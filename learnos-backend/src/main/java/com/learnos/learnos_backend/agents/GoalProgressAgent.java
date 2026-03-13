// ─── agents/GoalProgressAgent.java ───────────────────────────────────────────
        package agents;

import models.*;
import java.util.*;
import java.util.stream.Collectors;

/** Computes overall progress across all active goals. */
public class GoalProgressAgent extends BaseAgent {

    private Map<String, Double> goalProgressMap = new HashMap<>();

    public GoalProgressAgent() { super("Goal Progress Agent"); }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        goalProgressMap = new HashMap<>();

        List<LearningGoal> active = goals.stream()
                .filter(g -> g.getStatus() == GoalStatus.ACTIVE)
                .collect(Collectors.toList());

        if (active.isEmpty()) {
            score    = 0;
            feedback = "No active goals. Add a goal to get started.";
            return;
        }

        double totalProgress = 0;
        for (LearningGoal goal : active) {
            double progress = goal.getProgressScore();
            goalProgressMap.put(goal.getTitle(), progress);
            totalProgress += progress;
        }

        score    = clamp(totalProgress / active.size());
        feedback = (score >= 75) ? "Strong progress across your active goals."
                : (score >= 50) ? "Moderate progress. Some goals need more attention."
                :                 "Low overall progress. Focus on your highest-priority goals.";
    }

    public Map<String, Double> getGoalProgressMap() {
        return Collections.unmodifiableMap(goalProgressMap);
    }
}
