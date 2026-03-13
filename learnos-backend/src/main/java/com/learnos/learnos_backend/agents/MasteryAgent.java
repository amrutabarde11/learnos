// ─── agents/MasteryAgent.java ─────────────────────────────────────────────────
        package agents;

import models.*;
import java.util.List;

/**
 * Measures mastery velocity — how fast topics are progressing
 * up the mastery scale across all active goals.
 */
public class MasteryAgent extends BaseAgent {

    public MasteryAgent() { super("Mastery Agent"); }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        requireSessions(sessions, 1);

        // Count sessions that resulted in a mastery increase
        long improved = sessions.stream()
                .filter(s -> s.masteryDelta() > 0).count();

        double improvementRate = (double) improved / sessions.size();

        // Average current mastery across all topics in active goals
        double avgMastery = goals.stream()
                .filter(g -> g.getStatus() == GoalStatus.ACTIVE)
                .flatMap(g -> g.getTopics().stream())
                .mapToInt(t -> t.getMasteryLevel().ordinal())
                .average().orElse(0);

        // Score = blend of improvement rate (60%) and current mastery level (40%)
        score = clamp((improvementRate * 60) + ((avgMastery / 5.0) * 40));

        feedback = (score >= 75) ? "Strong mastery growth across your goals."
                : (score >= 50) ? "Moderate progress. Focus sessions on moving topics up a level."
                :                 "Slow mastery gain. Try shorter, more focused sessions per topic.";
    }
}
