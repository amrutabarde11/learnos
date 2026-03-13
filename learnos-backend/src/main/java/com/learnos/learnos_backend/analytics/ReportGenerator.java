// ─── analytics/ReportGenerator.java ──────────────────────────────────────────
        package analytics;

import engine.EngineResult;
import models.LearningGoal;
import models.User;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * ReportGenerator — accepts EngineResult record only.
 * Zero dependency on agents or engine internals.
 * Can generate an in-app string or export to a timestamped .txt file.
 */
public class ReportGenerator {

    private static final String DIVIDER = "─".repeat(56);

    public static String generateReport(User user, List<LearningGoal> goals,
                                        EngineResult result) {
        String ts = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));

        var sb = new StringBuilder();
        sb.append("╔════════════════════════════════════════════════════════╗\n");
        sb.append("║            LEARNING EFFICIENCY REPORT                 ║\n");
        sb.append("╚════════════════════════════════════════════════════════╝\n");
        sb.append("  Generated  : ").append(ts).append("\n");
        sb.append("  Learner    : ").append(user.getProfile().getName()).append("\n");
        sb.append("  Type       : ").append(user.getProfile().getLearnerType()).append("\n");
        sb.append(DIVIDER).append("\n");

        // Core metrics
        sb.append("\n📊  CORE METRICS\n");
        sb.append("  Learning Efficiency Index  : %.0f / 100%n".formatted(result.lei()));
        sb.append("  Overall Risk Level         : %s%n".formatted(result.riskLevel()));
        sb.append("  Mastery Score              : %.0f / 100%n".formatted(result.masteryScore()));
        sb.append("  Retention Score            : %.0f / 100%n".formatted(result.retentionScore()));
        sb.append("  Productivity Score         : %.0f / 100%n".formatted(result.productivityScore()));
        sb.append("  Cognitive Load             : %s%n".formatted(result.cognitiveRisk()));
        sb.append("  Goal Progress              : %.0f / 100%n".formatted(result.goalProgressScore()));

        // Goal-by-goal progress
        if (!result.goalProgressMap().isEmpty()) {
            sb.append("\n🎯  GOAL PROGRESS\n");
            result.goalProgressMap().forEach((title, progress) ->
                    sb.append("  %-35s %.0f%%%n".formatted(title, progress)));
        }

        // Forgetting risks
        if (!result.forgettingRiskTopics().isEmpty()) {
            sb.append("\n🔁  REVISION NEEDED\n");
            result.forgettingRiskTopics().forEach(r -> sb.append("  • ").append(r).append("\n"));
        }

        // Deadline risks
        if (!result.atRiskDeadlines().isEmpty()) {
            sb.append("\n⏰  DEADLINE RISKS\n");
            result.atRiskDeadlines().forEach(r -> sb.append("  • ").append(r).append("\n"));
        }

        // Recommendations
        sb.append("\n💡  RECOMMENDATIONS\n");
        result.recommendations().forEach(r -> sb.append("  ").append(r).append("\n"));

        // Priority action
        sb.append("\n🔑  PRIORITY ACTION\n");
        sb.append("  → ").append(result.priorityAction()).append("\n");

        // Warnings
        if (!result.agentWarnings().isEmpty()) {
            sb.append("\n⚠️   SYSTEM WARNINGS\n");
            result.agentWarnings().forEach(w -> sb.append("  [!] ").append(w).append("\n"));
        }

        sb.append("\n").append(DIVIDER).append("\n");
        sb.append("              Personal Learning OS — LearnOS\n");
        sb.append(DIVIDER).append("\n");

        return sb.toString();
    }

    public static void exportToFile(String report, Path reportsDir) throws IOException {
        String ts       = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm"));
        Path   filePath = reportsDir.resolve("report_" + ts + ".txt");
        Files.writeString(filePath, report);
        System.out.println("[Report] Exported to: " + filePath);
    }
}