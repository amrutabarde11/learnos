// ─── agents/AcademicRiskAgent.java ────────────────────────────────────────────
        package agents;

import models.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Academic goals only.
 * Projects final grade based on completed assessments + study trend.
 * Flags goals where projected grade is below target.
 */
public class AcademicRiskAgent extends BaseAgent {

    private List<String> atRiskGoals = List.of();

    public AcademicRiskAgent() { super("Academic Risk Agent"); }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        List<String> risks = new ArrayList<>();

        List<LearningGoal> academicGoals = goals.stream()
                .filter(g -> g.getCategory() == GoalCategory.ACADEMIC
                        && g.getStatus() == GoalStatus.ACTIVE)
                .collect(Collectors.toList());

        if (academicGoals.isEmpty()) {
            score    = 100;
            feedback = "No active academic goals.";
            return;
        }

        for (LearningGoal goal : academicGoals) {
            // Use topic mastery as proxy for academic readiness
            double avgMastery = goal.getTopics().stream()
                    .mapToInt(t -> t.getMasteryLevel().ordinal())
                    .average().orElse(0);

            double readinessPct = (avgMastery / 5.0) * 100;
            double targetPct    = goal.getTargetMastery().ordinal() / 5.0 * 100;

            if (readinessPct < targetPct * 0.7) {
                risks.add("'%s' — readiness %.0f%% vs target %.0f%%. Needs urgent attention."
                        .formatted(goal.getTitle(), readinessPct, targetPct));
            }
        }

        atRiskGoals = Collections.unmodifiableList(risks);
        score = clamp(100 - (risks.size() * 30.0));
        feedback = risks.isEmpty()
                ? "Academic goals are on track."
                : risks.get(0);
    }

    public List<String> getAtRiskGoals() { return atRiskGoals; }
}
