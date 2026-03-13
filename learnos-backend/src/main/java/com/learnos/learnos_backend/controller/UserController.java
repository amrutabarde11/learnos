package com.learnos.learnos_backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    // In-memory store for now (we'll add database later)
    private static Map<String, Object> currentUser = null;
    private static List<Map<String, Object>> userGoals = new ArrayList<>();

    @GetMapping("/me")
    public Map<String, Object> getUser() {
        if (currentUser == null) {
            return Map.of("exists", false);
        }
        Map<String, Object> response = new HashMap<>(currentUser);
        response.put("exists", true);
        response.put("goals", userGoals);
        return response;
    }

    @PostMapping("/setup")
    public Map<String, Object> setupUser(@RequestBody Map<String, Object> body) {
        currentUser = new HashMap<>();
        currentUser.put("name", body.get("name"));
        currentUser.put("learnerType", body.get("learnerType"));
        currentUser.put("dailyTarget", body.get("dailyTarget"));

        // Save goals if provided
        if (body.containsKey("goals")) {
            userGoals = (List<Map<String, Object>>) body.get("goals");
        }

        return Map.of(
                "success", true,
                "message", "Welcome to LearnOS, " + body.get("name") + "!"
        );
    }

    @PostMapping("/reset")
    public Map<String, Object> resetUser() {
        currentUser = null;
        userGoals = new ArrayList<>();
        return Map.of("success", true);
    }

    @GetMapping("/goals")
    public List<Map<String, Object>> getGoals() {
        return userGoals;
    }

    @PostMapping("/goals")
    public Map<String, Object> addGoal(@RequestBody Map<String, Object> goal) {
        goal.put("id", userGoals.size() + 1);
        userGoals.add(goal);
        return Map.of("success", true, "goal", goal);
    }
}