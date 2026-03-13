// ─── engine/EngineResult.java ─────────────────────────────────────────────────
        package engine;

import java.util.List;
import java.util.Map;

/**
 * Immutable record of all engine outputs.
 * Every other layer reads from this — no agent references leak out.
 */
public record EngineResult(
        double              lei,
        String              riskLevel,
        double              productivityScore,
        double              masteryScore,
        double              cognitiveScore,
        double              topicPriorityScore,
        double              deadlineScore,
        double              retentionScore,
        double              goalProgressScore,
        double              motivationScore,
        String              cognitiveRisk,
        boolean             overloadDetected,
        List<String>        recommendations,
        String              priorityAction,
        List<String>        atRiskDeadlines,
        List<String>        forgettingRiskTopics,
        List<String>        avoidedHighPriorityTopics,
        List<String>        disengagedGoals,
        Map<String, Double> goalProgressMap,
        List<String>        agentWarnings,
        String              productivityFeedback,
        String              masteryFeedback,
        String              cognitiveFeedback,
        String              retentionFeedback
) {}

