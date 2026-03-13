// ─── agents/TopicPriorityAgent.java ──────────────────────────────────────────
        package agents;

import models.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Checks if the user is spending time on HIGH priority topics
 * or avoiding them in favour of easier/lower priority ones.
 */
public class TopicPriorityAgent extends BaseAgent {

    private List<String> avoidedHighPriorityTopics = List.of();

    public TopicPriorityAgent() { super("Topic Priority Agent"); }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        requireSessions(sessions, 1);

        // All HIGH priority topics across active goals
        List<Topic> highPriority = goals.stream()
                .filter(g -> g.getStatus() == GoalStatus.ACTIVE)
                .flatMap(g -> g.getTopics().stream())
                .filter(t -> t.getPriority() == Priority.HIGH)
                .collect(Collectors.toList());

        if (highPriority.isEmpty()) {
            score    = 100;
            feedback = "No high-priority topics set. Add priorities to your topics.";
            return;
        }

        // Which high-priority topics have NO sessions logged?
        Set<String> studiedTopics = sessions.stream()
                .map(LearningSession::getTopicName)
                .collect(Collectors.toSet());

        avoidedHighPriorityTopics = highPriority.stream()
                .filter(t -> !studiedTopics.contains(t.getName()))
                .map(Topic::getName)
                .collect(Collectors.toUnmodifiableList());

        double coverageRatio = 1.0 - ((double) avoidedHighPriorityTopics.size() / highPriority.size());
        score = clamp(coverageRatio * 100);

        feedback = avoidedHighPriorityTopics.isEmpty()
                ? "Great — you're covering all high-priority topics."
                : "Avoiding high-priority topics: " + String.join(", ", avoidedHighPriorityTopics);
    }

    public List<String> getAvoidedHighPriorityTopics() { return avoidedHighPriorityTopics; }
}
