package com.learnos.learnos_backend.controller;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.*;
import java.util.*;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    @Value("${gemini.api.key}")
    private String apiKey;

    private String getGeminiUrl() {
        return "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
    }

    @PostMapping("/generate")
    public Map<String, Object> generateQuiz(@RequestBody Map<String, Object> body) {
        String topic = (String) body.getOrDefault("topic", "General Knowledge");
        String mastery = (String) body.getOrDefault("mastery", "FAMILIAR");
        String goal = (String) body.getOrDefault("goalTitle", "");

        String difficulty = switch (mastery) {
            case "UNAWARE", "EXPOSED" -> "beginner";
            case "FAMILIAR", "COMPETENT" -> "intermediate";
            default -> "advanced";
        };

        String prompt = String.format("""
            Generate exactly 3 multiple choice questions about "%s" for a %s learner%s.
            
            Return ONLY a valid JSON array with this exact structure, no markdown, no extra text:
            [
              {
                "question": "question text here",
                "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
                "correct": "A",
                "explanation": "brief explanation why A is correct"
              }
            ]
            """,
                topic, difficulty,
                goal.isEmpty() ? "" : " studying " + goal
        );

        try {
            JSONObject requestBody = new JSONObject();
            JSONArray contents = new JSONArray();
            JSONObject content = new JSONObject();
            JSONArray parts = new JSONArray();
            JSONObject part = new JSONObject();
            part.put("text", prompt);
            parts.put(part);
            content.put("parts", parts);
            contents.put(content);
            requestBody.put("contents", contents);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(getGeminiUrl()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();

            JSONObject json = new JSONObject(responseBody);
            String text = json
                    .getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text")
                    .trim();

            // Strip markdown code fences if present
            if (text.startsWith("```")) {
                text = text.replaceAll("```json\\n?", "").replaceAll("```\\n?", "").trim();
            }

            JSONArray questions = new JSONArray(text);
            List<Map<String, Object>> questionList = new ArrayList<>();

            for (int i = 0; i < questions.length(); i++) {
                JSONObject q = questions.getJSONObject(i);
                Map<String, Object> qMap = new LinkedHashMap<>();
                qMap.put("id", i + 1);
                qMap.put("question", q.getString("question"));

                JSONArray opts = q.getJSONArray("options");
                List<String> optList = new ArrayList<>();
                for (int j = 0; j < opts.length(); j++) optList.add(opts.getString(j));
                qMap.put("options", optList);
                qMap.put("correct", q.getString("correct"));
                qMap.put("explanation", q.optString("explanation", ""));
                questionList.add(qMap);
            }

            return Map.of("success", true, "topic", topic, "questions", questionList);

        } catch (Exception e) {
            // Fallback questions if Gemini fails
            return Map.of(
                    "success", true,
                    "topic", topic,
                    "questions", getFallbackQuestions(topic)
            );
        }
    }

    @PostMapping("/evaluate")
    public Map<String, Object> evaluateQuiz(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> answers = (List<Map<String, Object>>) body.get("answers");
        if (answers == null) return Map.of("score", 0, "total", 0, "percentage", 0);

        long correct = answers.stream()
                .filter(a -> {
                    String given = (String) a.get("given");
                    String expected = (String) a.get("correct");
                    return given != null && given.equals(expected);
                }).count();

        int total = answers.size();
        int pct = total > 0 ? (int)((correct * 100.0) / total) : 0;

        String feedback;
        if (pct == 100) feedback = "Perfect score! You've mastered this topic.";
        else if (pct >= 66) feedback = "Great work! A little more practice and you'll nail it.";
        else if (pct >= 33) feedback = "Good start! Review the explanations to strengthen your understanding.";
        else feedback = "Keep going! Revisiting the basics will help solidify your knowledge.";

        return Map.of("score", correct, "total", total, "percentage", pct, "feedback", feedback);
    }

    private List<Map<String, Object>> getFallbackQuestions(String topic) {
        return List.of(
                Map.of("id", 1,
                        "question", "What is the most important aspect of " + topic + "?",
                        "options", List.of("A) Understanding fundamentals", "B) Memorizing syntax", "C) Skipping practice", "D) None of the above"),
                        "correct", "A",
                        "explanation", "Understanding fundamentals is always the foundation of any topic."
                ),
                Map.of("id", 2,
                        "question", "How do you best improve at " + topic + "?",
                        "options", List.of("A) Read once and forget", "B) Practice consistently", "C) Avoid difficult problems", "D) Copy solutions"),
                        "correct", "B",
                        "explanation", "Consistent practice is the key to mastery in any subject."
                ),
                Map.of("id", 3,
                        "question", "What helps retain knowledge of " + topic + "?",
                        "options", List.of("A) Passive reading", "B) Active recall and testing", "C) Cramming the night before", "D) Skipping review"),
                        "correct", "B",
                        "explanation", "Active recall through testing is proven to dramatically improve retention."
                )
        );
    }
}
