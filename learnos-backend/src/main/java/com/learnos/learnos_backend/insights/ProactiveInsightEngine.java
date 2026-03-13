// ─── insights/ProactiveInsightEngine.java ─────────────────────────────────────
        package insights;

import engine.EngineResult;
import models.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ProactiveInsightEngine — surfaces insights the user never had to ask for.
 *
 * Runs after every session save inside SessionController.
 * Checks 7 insight types and returns a prioritised list.
 *
 * The Dashboard shows the top insight as a banner on the Home tab.
 */
public class ProactiveInsightEngine {

    /**
     * Detects all applicable insights for the current state.
     *
     * @param user     current user
     * @param goals    all learning goals with topics loaded
     * @param sessions all logged sessions
     * @param result   latest engine result
     * @return prioritised list of insights (most urgent first)
     */
    public List<Insight> detect(User user, List<LearningGoal> goals,
                                List<LearningSession> sessions,
                                EngineResult result) {
        List<Insight> insights = new ArrayList<>();

        checkOverloadWarning(result, insights);
        checkGoalAtRisk(result, insights);
        checkDeadlineProjection(result, insights);
        checkForgettingAlert(goals, insights);
        checkMasteryPlateau(goals, sessions, insights);
        checkTopicAvoidance(goals, sessions, insights);
        checkMotivationNudge(result, insights);
        checkPositiveStreak(sessions, user, insights);
        checkMasteryMilestone(sessions, insights);

        // Sort: URGENT first, then WARNING, then INFO
        insights.sort(Comparator.comparing(i -> switch (i.severity()) {
            case URGENT  -> 0;
            case WARNING -> 1;
            case INFO    -> 2;
        }));

        return Collections.unmodifiableList(insights);
    }

    // ── Insight detectors ─────────────────────────────────────────────────────

    private void checkOverloadWarning(EngineResult result, List<Insight> out) {
        if ("High".equals(result.cognitiveRisk())) {
            out.add(new Insight(InsightType.OVERLOAD_WARNING,
                    "🚨 You're consistently studying too long without mastery gains. " +
                            "Shorten sessions to 60–90 minutes.",
                    InsightSeverity.URGENT, "All Goals"));
        }
    }

    private void checkGoalAtRisk(EngineResult result, List<Insight> out) {
        result.atRiskDeadlines().forEach(r ->
                out.add(new Insight(InsightType.GOAL_AT_RISK,
                        "⏰ " + r, InsightSeverity.URGENT, r)));
    }

    private void checkDeadlineProjection(EngineResult result, List<Insight> out) {
        if (!result.atRiskDeadlines().isEmpty()) return; // already covered above
        if (result.deadlineScore() < 80) {
            out.add(new Insight(InsightType.DEADLINE_PROJECTION,
                    "📅 Some goals may not be completed at your current study pace. " +
                            "Check your Goals tab for details.",
                    InsightSeverity.WARNING, "Multiple Goals"));
        }
    }

    private void checkForgettingAlert(List<LearningGoal> goals, List<Insight> out) {
        for (LearningGoal goal : goals) {
            if (goal.getStatus() != GoalStatus.ACTIVE) continue;
            for (Topic topic : goal.getTopics()) {
                if (topic.getMasteryLevel().ordinal() < MasteryLevel.FAMILIAR.ordinal()) continue;
                long days = topic.daysSinceStudied();
                int threshold = switch (topic.getMasteryLevel()) {
                    case FAMILIAR   -> 7;
                    case COMPETENT  -> 14;
                    default         -> 21;
                };
                if (days >= threshold) {
                    out.add(new Insight(InsightType.FORGETTING_ALERT,
                            "🔁 '%s' in '%s' — not revised in %d days. Quick revision will lock it in."
                                    .formatted(topic.getName(), goal.getTitle(), days),
                            InsightSeverity.WARNING, goal.getTitle()));
                    break; // one alert per goal to avoid noise
                }
            }
        }
    }

    private void checkMasteryPlateau(List<LearningGoal> goals,
                                     List<LearningSession> sessions,
                                     List<Insight> out) {
        // Find topics with 4+ sessions and no mastery increase
        Map<String, List<LearningSession>> byTopic = sessions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getGoalId() + "::" + s.getTopicName()));

        for (LearningGoal goal : goals) {
            if (goal.getStatus() != GoalStatus.ACTIVE) continue;
            for (Topic topic : goal.getTopics()) {
                String key = goal.getGoalId() + "::" + topic.getName();
                List<LearningSession> topicSessions = byTopic.getOrDefault(key, List.of());
                if (topicSessions.size() >= 4) {
                    boolean noProgress = topicSessions.stream().noneMatch(s -> s.masteryDelta() > 0);
                    if (noProgress) {
                        out.add(new Insight(InsightType.MASTERY_PLATEAU,
                                "📊 '%s' in '%s' — %d sessions with no mastery gain. Try a different approach or resource."
                                        .formatted(topic.getName(), goal.getTitle(), topicSessions.size()),
                                InsightSeverity.WARNING, goal.getTitle()));
                    }
                }
            }
        }
    }

    private void checkTopicAvoidance(List<LearningGoal> goals,
                                     List<LearningSession> sessions,
                                     List<Insight> out) {
        Set<String> studiedTopics = sessions.stream()
                .map(LearningSession::getTopicName).collect(Collectors.toSet());

        for (LearningGoal goal : goals) {
            if (goal.getStatus() != GoalStatus.ACTIVE) continue;
            goal.getTopics().stream()
                    .filter(t -> t.getPriority() == Priority.HIGH
                            && !studiedTopics.contains(t.getName()))
                    .findFirst()
                    .ifPresent(t -> out.add(new Insight(InsightType.TOPIC_AVOIDANCE,
                            "🎯 High-priority topic '%s' in '%s' has zero sessions. Start today."
                                    .formatted(t.getName(), goal.getTitle()),
                            InsightSeverity.WARNING, goal.getTitle())));
        }
    }

    private void checkMotivationNudge(EngineResult result, List<Insight> out) {
        result.disengagedGoals().forEach(d ->
                out.add(new Insight(InsightType.MOTIVATION_NUDGE,
                        "💡 " + d, InsightSeverity.INFO, d)));
    }

    private void checkPositiveStreak(List<LearningSession> sessions,
                                     User user, List<Insight> out) {
        if (sessions.size() < 5) return;

        // Check last 7 days — did user hit target each day?
        LocalDate today = LocalDate.now();
        long activeDays = sessions.stream()
                .map(LearningSession::getDate)
                .map(LocalDate::parse)
                .filter(d -> ChronoUnit.DAYS.between(d, today) <= 7)
                .distinct().count();

        if (activeDays >= 5) {
            out.add(new Insight(InsightType.POSITIVE_STREAK,
                    "🌟 You've studied %d out of the last 7 days. Excellent consistency — this is how mastery is built."
                            .formatted(activeDays),
                    InsightSeverity.INFO, "All Goals"));
        }
    }

    private void checkMasteryMilestone(List<LearningSession> sessions,
                                       List<Insight> out) {
        if (sessions.isEmpty()) return;

        // Check the most recent session for a mastery level-up
        LearningSession last = sessions.get(sessions.size() - 1);
        if (last.masteryDelta() > 0) {
            out.add(new Insight(InsightType.MASTERY_MILESTONE,
                    "✅ '%s' just moved from %s to %s. Great session!"
                            .formatted(last.getTopicName(),
                                    last.getMasteryBefore().name(),
                                    last.getMasteryAfter().name()),
                    InsightSeverity.INFO, last.getGoalId()));
        }
    }
}
