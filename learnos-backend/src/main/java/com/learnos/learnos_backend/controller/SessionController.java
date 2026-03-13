package com.learnos.learnos_backend.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private static List<Map<String, Object>> sessions = new ArrayList<>();

    @GetMapping
    public List<Map<String, Object>> getSessions() {
        return sessions;
    }

    @PostMapping
    public Map<String, Object> logSession(@RequestBody Map<String, Object> body) {
        Map<String, Object> session = new HashMap<>(body);
        session.put("id", UUID.randomUUID().toString().substring(0, 8));
        session.put("date", LocalDate.now().toString());
        sessions.add(session);
        return Map.of("success", true, "session", session, "lei", calculateLEI());
    }

    @GetMapping("/lei")
    public Map<String, Object> getLEI() {
        return calculateLEI();
    }

    @GetMapping("/insights")
    public List<Map<String, Object>> getInsights() {
        return generateInsights();
    }

    @DeleteMapping
    public Map<String, Object> clearSessions() {
        sessions.clear();
        return Map.of("success", true);
    }

    private Map<String, Object> calculateLEI() {
        if (sessions.isEmpty()) {
            return Map.of("score", 0, "risk", "HIGH",
                    "productivity", 0, "mastery", 0, "retention", 0,
                    "topicPriority", 0, "deadline", 0, "goalProgress", 0,
                    "cognitive", 100, "motivation", 50);
        }

        long recentSessions = sessions.stream()
                .filter(s -> { String d = (String) s.get("date");
                    return d != null && d.compareTo(LocalDate.now().minusDays(7).toString()) >= 0; })
                .count();

        double masteryAvg = sessions.stream()
                .mapToDouble(s -> { Object a = s.get("masteryAfter");
                    return masteryToScore(a != null ? a.toString() : "UNAWARE"); })
                .average().orElse(0);

        long uniqueDays = sessions.stream().map(s -> s.get("date"))
                .filter(Objects::nonNull).distinct().count();

        int productivity  = Math.min(100, (int)(recentSessions * 14));
        int mastery       = (int)(masteryAvg * 20);
        int retention     = Math.min(100, (int)(uniqueDays * 10));
        int topicPriority = Math.min(100, sessions.size() * 8);
        int deadline      = 70;
        int goalProgress  = Math.min(100, (int)(masteryAvg * 15 + recentSessions * 5));
        int cognitive     = Math.max(20, 100 - (int)(recentSessions * 8));
        int motivation    = Math.min(100, 40 + (int)(uniqueDays * 8));

        int score = (int)(productivity*0.20 + mastery*0.15 + retention*0.15 +
                topicPriority*0.10 + deadline*0.10 + goalProgress*0.15 +
                cognitive*0.05 + motivation*0.10);

        return Map.of("score", score, "risk", score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : "HIGH",
                "productivity", productivity, "mastery", mastery, "retention", retention,
                "topicPriority", topicPriority, "deadline", deadline, "goalProgress", goalProgress,
                "cognitive", cognitive, "motivation", motivation);
    }

    private double masteryToScore(String m) {
        return switch (m) {
            case "EXPOSED" -> 1; case "FAMILIAR" -> 2; case "COMPETENT" -> 3;
            case "PROFICIENT" -> 4; case "MASTERED" -> 5; default -> 0;
        };
    }

    private List<Map<String, Object>> generateInsights() {
        List<Map<String, Object>> insights = new ArrayList<>();
        if (sessions.isEmpty()) {
            insights.add(Map.of("id", 1, "type", "STREAK", "severity", "info",
                    "message", "Welcome to LearnOS! Log your first session to start tracking your progress."));
            return insights;
        }
        long recentSessions = sessions.stream()
                .filter(s -> { String d = (String) s.get("date");
                    return d != null && d.compareTo(LocalDate.now().minusDays(3).toString()) >= 0; })
                .count();
        if (recentSessions == 0)
            insights.add(Map.of("id", 1, "type", "AVOIDANCE", "severity", "warning",
                    "message", "No sessions in the last 3 days. Even a 20-min review keeps retention high."));
        long uniqueDays = sessions.stream().map(s -> s.get("date"))
                .filter(Objects::nonNull).distinct().count();
        if (uniqueDays >= 5)
            insights.add(Map.of("id", 2, "type", "STREAK", "severity", "info",
                    "message", "You've studied " + uniqueDays + " different days — great consistency!"));
        insights.add(Map.of("id", 3, "type", "INFO", "severity", "info",
                "message", "Total sessions logged: " + sessions.size() + ". LEI updates with every session."));
        return insights;
    }
}