// ─── insights/Insight.java ────────────────────────────────────────────────────
        package insights;

/**
 * Immutable insight record.
 * Produced by ProactiveInsightEngine after every session save.
 */
public record Insight(
        InsightType     type,
        String          message,
        InsightSeverity severity,
        String          goalTitle   // which goal this insight relates to
) {}

