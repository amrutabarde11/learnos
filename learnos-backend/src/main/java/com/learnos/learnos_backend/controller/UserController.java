package com.learnos.learnos_backend.controller;

import com.learnos.learnos_backend.models.UserEntity;
import com.learnos.learnos_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/me")
    public Map<String, Object> getUser(@RequestParam String userId) {
        Optional<UserEntity> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return Map.of("exists", false);
        UserEntity u = opt.get();
        Map<String, Object> res = new HashMap<>();
        res.put("exists", true);
        res.put("clerkId", u.getClerkId());
        res.put("name", u.getName());
        res.put("learnerType", u.getLearnerType());
        res.put("dailyTarget", u.getDailyTarget());
        try {
            List<?> goals = mapper.readValue(u.getGoalsJson() != null ? u.getGoalsJson() : "[]", List.class);
            res.put("goals", goals);
        } catch (Exception e) {
            res.put("goals", List.of());
        }
        return res;
    }

    @PostMapping("/setup")
    public Map<String, Object> setupUser(@RequestBody Map<String, Object> body) {
        String userId = (String) body.get("userId");
        if (userId == null) return Map.of("success", false, "error", "userId required");

        UserEntity u = userRepository.findById(userId).orElse(new UserEntity());
        u.setClerkId(userId);
        u.setName((String) body.getOrDefault("name", "Learner"));
        u.setLearnerType((String) body.getOrDefault("learnerType", "BOTH"));
        Object dt = body.get("dailyTarget");
        u.setDailyTarget(dt != null ? Double.parseDouble(dt.toString()) : 2.0);

        try {
            Object goals = body.get("goals");
            u.setGoalsJson(goals != null ? mapper.writeValueAsString(goals) : "[]");
        } catch (Exception e) {
            u.setGoalsJson("[]");
        }

        userRepository.save(u);
        return Map.of("success", true, "message", "Welcome to LearnOS, " + u.getName() + "!");
    }

    @GetMapping("/goals")
    public List<?> getGoals(@RequestParam String userId) {
        Optional<UserEntity> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return List.of();
        try {
            return mapper.readValue(opt.get().getGoalsJson() != null ? opt.get().getGoalsJson() : "[]", List.class);
        } catch (Exception e) { return List.of(); }
    }

    @PostMapping("/goals")
    public Map<String, Object> addGoal(@RequestParam String userId, @RequestBody Map<String, Object> goal) {
        Optional<UserEntity> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return Map.of("success", false, "error", "User not found");
        UserEntity u = opt.get();
        try {
            List<Map> goals = new ArrayList<>(mapper.readValue(u.getGoalsJson() != null ? u.getGoalsJson() : "[]",
                    mapper.getTypeFactory().constructCollectionType(List.class, Map.class)));
            goal.put("id", System.currentTimeMillis());
            goals.add(goal);
            u.setGoalsJson(mapper.writeValueAsString(goals));
            userRepository.save(u);
            return Map.of("success", true, "goal", goal);
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    @PostMapping("/reset")
    public Map<String, Object> resetUser(@RequestParam String userId) {
        userRepository.deleteById(userId);
        return Map.of("success", true);
    }
}