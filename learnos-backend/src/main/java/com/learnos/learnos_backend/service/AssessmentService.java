package service;

import models.MasteryLevel;
import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URI;
import java.net.http.*;
import java.util.ArrayList;
import java.util.List;

/**
 * AssessmentService — calls Google Gemini API to generate quiz questions
 * for a given topic and evaluates answers to determine mastery level.
 *
 * Replace YOUR_GEMINI_API_KEY below with your actual key.
 */
public class AssessmentService {

    // ── PASTE YOUR GEMINI KEY HERE ────────────────────────────────────────────
    private static final String API_KEY = "AIzaSyAJf6d731VJEJWUrdNT5cTO1FEZW3OpGB8";
    // ─────────────────────────────────────────────────────────────────────────

    private static final String API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                    + API_KEY;

    // ── Data class for one MCQ question ──────────────────────────────────────
    public record Question(
            String questionText,
            List<String> options,      // always 4 options
            int correctIndex           // 0-based index of correct answer
    ) {}

    // ── Data class for quiz result ────────────────────────────────────────────
    public record QuizResult(
            int correct,
            int total,
            MasteryLevel newMasteryLevel
    ) {}

    /**
     * Generates 3 MCQ questions for the given topic and current mastery level.
     * Questions are generated fresh each time via Gemini — not hardcoded.
     *
     * @param topicName      e.g. "React Hooks"
     * @param currentMastery current mastery level of the student
     * @return list of 3 Question objects
     */
    public List<Question> generateQuestions(String topicName,
                                            MasteryLevel currentMastery)
            throws Exception {

        String difficulty = switch (currentMastery) {
            case UNAWARE, EXPOSED  -> "beginner — test basic recall and definitions";
            case FAMILIAR          -> "intermediate — test conceptual understanding";
            case COMPETENT         -> "applied — test practical application";
            case PROFICIENT, MASTERED -> "advanced — test edge cases and deep understanding";
        };

        String prompt = """
                Generate exactly 3 multiple choice questions to assess a student's
                understanding of the topic: "%s".
                Difficulty level: %s.
                
                Rules:
                - Each question must be practical, not just definitional
                - Each question has exactly 4 options labeled A, B, C, D
                - Only one option is correct
                - Questions should progressively get slightly harder
                
                Respond ONLY with a valid JSON array, no extra text, no markdown.
                Format:
                [
                  {
                    "question": "question text here",
                    "options": ["option A", "option B", "option C", "option D"],
                    "correctIndex": 0
                  }
                ]
                correctIndex is 0-based (0=A, 1=B, 2=C, 3=D).
                """.formatted(topicName, difficulty);

        // Build Gemini API request body
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

        // Send HTTP POST request
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();

        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200)
            throw new Exception("Gemini API error: " + response.statusCode()
                    + " — " + response.body());

        // Parse response
        JSONObject responseJson = new JSONObject(response.body());
        String rawText = responseJson
                .getJSONArray("candidates")
                .getJSONObject(0)
                .getJSONObject("content")
                .getJSONArray("parts")
                .getJSONObject(0)
                .getString("text")
                .trim();

        // Strip markdown fences if Gemini adds them
        rawText = rawText.replace("```json", "").replace("```", "").trim();

        JSONArray questionsJson = new JSONArray(rawText);
        List<Question> questions = new ArrayList<>();

        for (int i = 0; i < questionsJson.length(); i++) {
            JSONObject q = questionsJson.getJSONObject(i);
            List<String> options = new ArrayList<>();
            JSONArray opts = q.getJSONArray("options");
            for (int j = 0; j < opts.length(); j++)
                options.add(opts.getString(j));

            questions.add(new Question(
                    q.getString("question"),
                    options,
                    q.getInt("correctIndex")
            ));
        }

        return questions;
    }

    /**
     * Evaluates the user's answers and computes the new mastery level.
     *
     * Scoring:
     *   3/3 correct → mastery goes UP one level
     *   2/3 correct → mastery stays the same
     *   1/3 correct → mastery goes DOWN one level
     *   0/3 correct → mastery goes DOWN two levels
     *
     * @param questions      the questions that were asked
     * @param userAnswers    the user's selected option indices (0-based)
     * @param currentMastery the mastery level before this quiz
     * @return QuizResult with score and new mastery level
     */
    public QuizResult evaluateAnswers(List<Question> questions,
                                      List<Integer> userAnswers,
                                      MasteryLevel currentMastery) {
        int correct = 0;
        for (int i = 0; i < questions.size(); i++) {
            if (userAnswers.get(i) == questions.get(i).correctIndex())
                correct++;
        }

        MasteryLevel[] levels = MasteryLevel.values();
        int current = currentMastery.ordinal();

        int newOrdinal = switch (correct) {
            case 3  -> Math.min(current + 1, levels.length - 1); // go up
            case 2  -> current;                                    // stay
            case 1  -> Math.max(current - 1, 0);                  // go down
            default -> Math.max(current - 2, 0);                  // go down 2
        };

        return new QuizResult(correct, questions.size(), levels[newOrdinal]);
    }
}