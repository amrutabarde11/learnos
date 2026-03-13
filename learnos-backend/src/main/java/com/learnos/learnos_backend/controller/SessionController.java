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
        Map<String, Object> insight = new HashMap<>();
        insight.put("id", 1);
        insight.put("type", "INFO");
        insight.put("severity", "info");
        insight.put("message", "Total sessions logged: " + sessions.size() + ". LEI updates with every session.");
        insights.add(insight);
        return insights;
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
