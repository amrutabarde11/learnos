// ─── agents/RetentionAgent.java ───────────────────────────────────────────────
        package agents;

import models.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Forgetting curve detection.
 * Topics not revised within a threshold period are flagged for revision.
 *
 * Thresholds (simplified Ebbinghaus):
 *   FAMILIAR   → needs revision after 7 days
 *   COMPETENT  → needs revision after 14 days
 *   PROFICIENT → needs revision after 21 days
 */
public class RetentionAgent extends BaseAgent {

    private List<String> forgettingRiskTopics = List.of();

    public RetentionAgent() { super("Retention Agent"); }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        requireSessions(sessions, 1);
        List<String> risks = new ArrayList<>();

        for (LearningGoal goal : goals) {
            if (goal.getStatus() != GoalStatus.ACTIVE) continue;
            for (Topic topic : goal.getTopics()) {
                if (topic.getMasteryLevel() == MasteryLevel.UNAWARE ||
                        topic.getMasteryLevel() == MasteryLevel.EXPOSED) continue;

                long days = topic.daysSinceStudied();
                int threshold = switch (topic.getMasteryLevel()) {
                    case FAMILIAR   -> 7;
                    case COMPETENT  -> 14;
                    case PROFICIENT -> 21;
                    default         -> 30;
                };

                if (days >= threshold) {
                    risks.add("'%s' in %s — %d days since last revision (threshold: %d days)"
                            .formatted(topic.getName(), goal.getTitle(), days, threshold));
                }
            }
        }

        forgettingRiskTopics = Collections.unmodifiableList(risks);
        score = clamp(100 - (risks.size() * 15.0));
        feedback = risks.isEmpty()
                ? "Good retention — all topics revised within recommended intervals."
                : "%d topic(s) at risk of being forgotten. Prioritise revision.".formatted(risks.size());
    }

    public List<String> getForgettingRiskTopics() { return forgettingRiskTopics; }
}
