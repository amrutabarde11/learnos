// ─── engine/EfficiencyEngine.java ─────────────────────────────────────────────
        package engine;

import agents.*;
import models.*;

import java.util.ArrayList;
import java.util.List;

/**
 * EfficiencyEngine — central reasoning unit.
 *
 * Runs all 9 agents polymorphically via List<Agent>.
 * Computes LEI from named weight constants.
 * Returns an immutable EngineResult record — nothing leaks out.
 *
 * LEI Formula:
 *   LEI = (Mastery Velocity   × 0.30)
 *       + (Topic Coverage     × 0.25)
 *       + (Retention Score    × 0.20)
 *       + (Consistency Score  × 0.15)
 *       + (Goal Progress      × 0.10)
 *       − Cognitive Penalty
 */
public class EfficiencyEngine {

    // ── Named weight constants ────────────────────────────────────────────────
    private static final double WEIGHT_MASTERY      = 0.30;
    private static final double WEIGHT_TOPIC        = 0.25;
    private static final double WEIGHT_RETENTION    = 0.20;
    private static final double WEIGHT_CONSISTENCY  = 0.15;
    private static final double WEIGHT_GOAL         = 0.10;

    // ── Agent construction with constructor injection ─────────────────────────
    private final ProductivityAgent   productivityAgent   = new ProductivityAgent();
    private final MasteryAgent        masteryAgent        = new MasteryAgent();
    private final CognitiveAgent      cognitiveAgent      = new CognitiveAgent();
    private final TopicPriorityAgent  topicPriorityAgent  = new TopicPriorityAgent();
    private final DeadlineAgent       deadlineAgent       = new DeadlineAgent();
    private final RetentionAgent      retentionAgent      = new RetentionAgent();
    private final AcademicRiskAgent   academicRiskAgent   = new AcademicRiskAgent();
    private final GoalProgressAgent   goalProgressAgent   = new GoalProgressAgent();
    private final MotivationAgent     motivationAgent     = new MotivationAgent();
    private final RecommendationAgent recommendationAgent = new RecommendationAgent(
            productivityAgent, masteryAgent, cognitiveAgent, topicPriorityAgent,
            deadlineAgent, retentionAgent, goalProgressAgent, motivationAgent
    );

    private final List<Agent> pipeline = List.of(
            productivityAgent, masteryAgent, cognitiveAgent,
            topicPriorityAgent, deadlineAgent, retentionAgent,
            academicRiskAgent, goalProgressAgent, motivationAgent,
            recommendationAgent
    );

    // ─────────────────────────────────────────────────────────────────────────

    public EngineResult process(User user, List<LearningGoal> goals,
                                List<LearningSession> sessions) {
        List<String> warnings = new ArrayList<>();

        // ── Polymorphic pipeline ──────────────────────────────────────────────
        for (Agent agent : pipeline) {
            try {
                agent.analyze(user, goals, sessions);
                System.out.printf("[Engine] %-28s → %.0f%n",
                        agent.getAgentName(), agent.getScore());
            } catch (AgentException.InsufficientDataException e) {
                warnings.add(agent.getAgentName() + " skipped: " + e.getMessage());
            } catch (AgentException e) {
                warnings.add(agent.getAgentName() + " error: " + e.getMessage());
            }
        }

        // ── Cognitive penalty ─────────────────────────────────────────────────
        double penalty = switch (cognitiveAgent.getRiskLevel()) {
            case "High"   -> 15.0;
            case "Medium" ->  7.0;
            default       ->  0.0;
        };

        // ── LEI ───────────────────────────────────────────────────────────────
        double lei = Math.max(0, Math.round(
                masteryAgent.getScore()       * WEIGHT_MASTERY     +
                        topicPriorityAgent.getScore() * WEIGHT_TOPIC       +
                        retentionAgent.getScore()     * WEIGHT_RETENTION   +
                        productivityAgent.getScore()  * WEIGHT_CONSISTENCY +
                        goalProgressAgent.getScore()  * WEIGHT_GOAL        -
                        penalty
        ));

        String riskLevel = (lei >= 75) ? "Low"
                : (lei >= 50) ? "Medium"
                : "High";

        System.out.printf("[Engine] LEI = %.0f | Risk = %s%n", lei, riskLevel);

        return new EngineResult(
                lei, riskLevel,
                productivityAgent.getScore(),
                masteryAgent.getScore(),
                cognitiveAgent.getScore(),
                topicPriorityAgent.getScore(),
                deadlineAgent.getScore(),
                retentionAgent.getScore(),
                goalProgressAgent.getScore(),
                motivationAgent.getScore(),
                cognitiveAgent.getRiskLevel(),
                cognitiveAgent.isOverloadDetected(),
                recommendationAgent.getRecommendations(),
                recommendationAgent.getPriorityAction(),
                deadlineAgent.getAtRiskDeadlines(),
                retentionAgent.getForgettingRiskTopics(),
                topicPriorityAgent.getAvoidedHighPriorityTopics(),
                motivationAgent.getDisengagedGoals(),
                goalProgressAgent.getGoalProgressMap(),
                List.copyOf(warnings),
                productivityAgent.getFeedback(),
                masteryAgent.getFeedback(),
                cognitiveAgent.getFeedback(),
                retentionAgent.getFeedback()
        );
    }
}
