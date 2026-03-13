// ─── agents/ProductivityAgent.java ───────────────────────────────────────────
        package agents;

import models.*;
import java.util.*;
import java.util.stream.Collectors;

/** Checks daily learning consistency against the user's target hours. */
public class ProductivityAgent extends BaseAgent {

    public ProductivityAgent() { super("Productivity Agent"); }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        requireSessions(sessions, 1);

        double target = user.getProfile().getDailyLearningTargetHours();

        // Group sessions by date, sum hours per day
        Map<String, Double> dailyHours = sessions.stream()
                .collect(Collectors.groupingBy(LearningSession::getDate,
                        Collectors.summingDouble(LearningSession::getDurationHours)));

        double avgDaily = dailyHours.values().stream()
                .mapToDouble(Double::doubleValue).average().orElse(0);

        score = clamp((avgDaily / target) * 100);

        feedback = (score >= 80) ? "Excellent! Consistently hitting your daily learning target."
                : (score >= 60) ? "Good effort. Try to be more consistent with your daily target."
                : (score >= 40) ? "Below target. Schedule fixed learning blocks each day."
                :                 "Low consistency. You need to show up more regularly.";
    }
}
