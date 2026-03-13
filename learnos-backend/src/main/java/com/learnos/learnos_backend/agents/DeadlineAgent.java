// ─── agents/DeadlineAgent.java ────────────────────────────────────────────────
        package agents;

import models.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Checks if goals with upcoming deadlines have sufficient study pace.
 * Flags goals where the user won't cover all topics in time.
 */
public class DeadlineAgent extends BaseAgent {

    private List<String> atRiskDeadlines = List.of();

    public DeadlineAgent() { super("Deadline Agent"); }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        requireSessions(sessions, 1);
        List<String> risks = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (LearningGoal goal : goals) {
            if (goal.getStatus() != GoalStatus.ACTIVE) continue;
            if ("none".equals(goal.getDeadline())) continue;

            LocalDate deadline = LocalDate.parse(goal.getDeadline());
            long daysLeft = ChronoUnit.DAYS.between(today, deadline);
            if (daysLeft <= 0) continue;

            // Count uncovered topics (still UNAWARE or EXPOSED)
            long uncoveredTopics = goal.getTopics().stream()
                    .filter(t -> t.getMasteryLevel().ordinal() < MasteryLevel.FAMILIAR.ordinal())
                    .count();

            if (uncoveredTopics == 0) continue;

            // Sessions on this goal per day so far
            long goalSessions = sessions.stream()
                    .filter(s -> s.getGoalId().equals(goal.getGoalId())).count();
            long daysActive = Math.max(1, sessions.stream()
                    .filter(s -> s.getGoalId().equals(goal.getGoalId()))
                    .map(LearningSession::getDate).distinct().count());
            double sessionsPerDay = (double) goalSessions / daysActive;

            // At current pace, sessions available before deadline
            double projectedSessions = sessionsPerDay * daysLeft;

            // Rough estimate: 3 sessions to move one topic from UNAWARE to FAMILIAR
            double sessionsNeeded = uncoveredTopics * 3.0;

            if (projectedSessions < sessionsNeeded) {
                risks.add("'%s' — %d uncovered topics, %d days left. Need more sessions."
                        .formatted(goal.getTitle(), uncoveredTopics, daysLeft));
            }
        }

        atRiskDeadlines = Collections.unmodifiableList(risks);
        score = risks.isEmpty() ? 100 : clamp(100 - (risks.size() * 25.0));
        feedback = risks.isEmpty()
                ? "All goals on track for their deadlines."
                : risks.get(0);
    }

    public List<String> getAtRiskDeadlines() { return atRiskDeadlines; }
}
