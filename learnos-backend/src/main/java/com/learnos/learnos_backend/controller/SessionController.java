package com.learnos.learnos_backend.controller;

import com.learnos.learnos_backend.models.SessionEntity;
import com.learnos.learnos_backend.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    @Autowired
    private SessionRepository sessionRepository;

    @PostMapping
    public Map<String, Object> logSession(@RequestBody Map<String, Object> body) {
        String userId = (String) body.getOrDefault("userId", "anonymous");

        SessionEntity session = new SessionEntity();
        session.setUserId(userId);
        session.setGoalId((String) body.getOrDefault("goalId", ""));
        session.setGoalTitle((String) body.getOrDefault("goalTitle", ""));
        session.setTopic((String) body.getOrDefault("topic", ""));
        session.setDuration(Double.parseDouble(body.getOrDefault("duration", 1).toString()));
        session.setSessionType((String) body.getOrDefault("sessionType", "STUDY"));
        session.setMasteryBefore((String) body.getOrDefault("masteryBefore", "FAMILIAR"));
        session.setMasteryAfter((String) body.getOrDefault("masteryAfter", "FAMILIAR"));
        session.setNotes((String) body.getOrDefault("notes", ""));
        session.setDate(LocalDate.now());
        sessionRepository.save(session);

        List<SessionEntity> userSessions = sessionRepository.findByUserId(userId);
        Map<String, Object> lei = calculateLEI(userSessions);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("lei", lei);
        return result;
    }

    @GetMapping
    public List<SessionEntity> getSessions(@RequestParam(required = false) String userId) {
        if (userId != null) return sessionRepository.findByUserId(userId);
        return sessionRepository.findAll();
    }

    @GetMapping("/lei")
    public Map<String, Object> getLEI(@RequestParam(required = false) String userId) {
        List<SessionEntity> sessions = userId != null
                ? sessionRepository.findByUserId(userId)
                : sessionRepository.findAll();
        return calculateLEI(sessions);
    }

    @GetMapping("/insights")
    public List<Map<String, Object>> getInsights(@RequestParam(required = false) String userId) {
        List<SessionEntity> sessions = userId != null
                ? sessionRepository.findByUserId(userId)
                : sessionRepository.findAll();

        List<Map<String, Object>> insights = new ArrayList<>();
        int id = 1;

        if (sessions.isEmpty()) {
            insights.add(insight(id++, "INFO", "info", "No sessions yet. Log your first study session to get personalized insights."));
            return insights;
        }

        // --- Streak detection ---
        Set<LocalDate> dates = new HashSet<>();
        for (SessionEntity s : sessions) if (s.getDate() != null) dates.add(s.getDate());
        int streak = 0;
        LocalDate check = LocalDate.now();
        while (dates.contains(check)) { streak++; check = check.minusDays(1); }
        if (streak >= 3) insights.add(insight(id++, "MOTIVATION", "success", "🔥 " + streak + "-day streak! Consistency is your biggest advantage right now."));

        // --- Inactivity warning ---
        Optional<LocalDate> lastDate = dates.stream().max(Comparator.naturalOrder());
        if (lastDate.isPresent()) {
            long daysSince = java.time.temporal.ChronoUnit.DAYS.between(lastDate.get(), LocalDate.now());
            if (daysSince >= 3 && daysSince < 7)
                insights.add(insight(id++, "RETENTION", "warning", "⚠️ " + daysSince + " days since your last session. Retention drops sharply after 72 hours — log something today."));
            else if (daysSince >= 7)
                insights.add(insight(id++, "RETENTION", "danger", "🚨 " + daysSince + " days inactive. You're likely losing what you learned. Even a 15-min review session helps."));
        }

        // --- Mastery stagnation ---
        Map<String, Integer> masteryOrder = Map.of(
                "UNAWARE", 0, "EXPOSED", 1, "FAMILIAR", 2,
                "COMPETENT", 3, "PROFICIENT", 4, "MASTERED", 5
        );
        long stagnantSessions = sessions.stream().filter(s -> {
            int before = masteryOrder.getOrDefault(s.getMasteryBefore(), 0);
            int after  = masteryOrder.getOrDefault(s.getMasteryAfter(), 0);
            return after <= before;
        }).count();
        double stagnantRatio = (double) stagnantSessions / sessions.size();
        if (stagnantRatio > 0.6 && sessions.size() >= 3)
            insights.add(insight(id++, "MASTERY", "warning", "📉 " + (int)(stagnantRatio*100) + "% of your sessions show no mastery gain. Try harder problems, teach the concept, or switch methods."));

        // --- Topic overload ---
        Map<String, Long> topicCounts = new HashMap<>();
        for (SessionEntity s : sessions) {
            if (s.getTopic() != null && !s.getTopic().isBlank())
                topicCounts.merge(s.getTopic(), 1L, Long::sum);
        }
        if (topicCounts.size() > 5)
            insights.add(insight(id++, "FOCUS", "warning", "🧠 You're spreading across " + topicCounts.size() + " topics. Focus on 2-3 at a time for deeper mastery."));

        // --- Most neglected topic ---
        if (topicCounts.size() >= 3) {
            topicCounts.entrySet().stream()
                    .min(Map.Entry.comparingByValue())
                    .ifPresent(e -> insights.add(insight(
                            insights.size() + 1,
                            "TOPIC_PRIORITY",
                            "info",
                            "📌 \"" + e.getKey() + "\" has the fewest sessions (" + e.getValue() + "). Consider revisiting it before moving on."
                    )));
        }

        // --- Session length nudge ---
        double avgDuration = sessions.stream().mapToDouble(SessionEntity::getDuration).average().orElse(0);
        if (avgDuration < 0.5)
            insights.add(insight(id++, "PRODUCTIVITY", "warning", "⏱ Average session is under 30 min. Short sessions are fine for review, but deeper learning needs at least 45-60 min blocks."));
        else if (avgDuration > 3)
            insights.add(insight(id++, "COGNITIVE", "warning", "😓 Average session exceeds 3 hours. Long sessions hurt retention — try splitting into focused blocks with breaks."));

        // --- Positive milestone ---
        if (sessions.size() == 10 || sessions.size() == 25 || sessions.size() == 50 || sessions.size() == 100)
            insights.add(insight(id++, "MILESTONE", "success", "🎉 " + sessions.size() + " sessions logged! You're building a real learning habit."));

        return insights;
    }

    private Map<String, Object> insight(int id, String type, String severity, String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", id);
        m.put("type", type);
        m.put("severity", severity);
        m.put("message", message);
        return m;
    }


    @DeleteMapping
    public Map<String, Object> clearSessions(@RequestParam(required = false) String userId) {
        if (userId != null) {
            List<SessionEntity> sessions = sessionRepository.findByUserId(userId);
            sessionRepository.deleteAll(sessions);
        }
        return Map.of("success", true);
    }

    private Map<String, Object> calculateLEI(List<SessionEntity> sessions) {
        if (sessions.isEmpty()) {
            return Map.of("score", 0, "risk", "HIGH",
                    "productivity", 0, "mastery", 0, "retention", 0,
                    "topicPriority", 0, "deadline", 0, "goalProgress", 0,
                    "cognitive", 100, "motivation", 50);
        }

        int total = sessions.size();
        double productivity = Math.min(100, total * 14);
        double mastery = calculateMasteryVelocity(sessions);
        double retention = Math.min(100, total * 10);
        double topicPriority = Math.min(100, total * 8);
        double deadline = Math.min(100, 40 + total * 5);
        double goalProgress = Math.min(100, total * 7);
        double cognitive = Math.max(0, 100 - (total * 1.5));
        double motivation = Math.min(100, 50 + total * 4);

        int score = (int) (
                productivity * 0.20 + mastery * 0.15 + retention * 0.15 +
                        topicPriority * 0.10 + deadline * 0.10 + goalProgress * 0.15 +
                        cognitive * 0.05 + motivation * 0.10
        );

        String risk = score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : "HIGH";

        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("risk", risk);
        result.put("productivity", (int) productivity);
        result.put("mastery", (int) mastery);
        result.put("retention", (int) retention);
        result.put("topicPriority", (int) topicPriority);
        result.put("deadline", (int) deadline);
        result.put("goalProgress", (int) goalProgress);
        result.put("cognitive", (int) cognitive);
        result.put("motivation", (int) motivation);
        return result;
    }

    private double calculateMasteryVelocity(List<SessionEntity> sessions) {
        Map<String, Integer> masteryOrder = Map.of(
                "UNAWARE", 0, "EXPOSED", 1, "FAMILIAR", 2,
                "COMPETENT", 3, "PROFICIENT", 4, "MASTERED", 5
        );
        double totalGain = 0;
        for (SessionEntity s : sessions) {
            int before = masteryOrder.getOrDefault(s.getMasteryBefore(), 0);
            int after = masteryOrder.getOrDefault(s.getMasteryAfter(), 0);
            totalGain += Math.max(0, after - before);
        }
        return Math.min(100, totalGain * 20);
    }
}
