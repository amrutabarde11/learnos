// ─── agents/CognitiveAgent.java ───────────────────────────────────────────────
        package agents;

import models.*;
import java.util.List;

/** Detects cognitive overload: long sessions with no mastery gain. */
public class CognitiveAgent extends BaseAgent {

    private boolean overloadDetected = false;
    private String  riskLevel        = "Low";

    public CognitiveAgent() { super("Cognitive Load Agent"); }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        requireSessions(sessions, 1);

        long overloadCount = sessions.stream()
                .filter(s -> s.getDurationHours() > 3.5 && s.masteryDelta() <= 0)
                .count();

        overloadDetected = sessions.stream()
                .anyMatch(s -> s.getDurationHours() > 4.0 && s.masteryDelta() < 0);

        double ratio = (double) overloadCount / sessions.size();

        riskLevel = (ratio > 0.5 || overloadDetected) ? "High"
                : (ratio > 0.2)                     ? "Medium"
                : "Low";

        score = switch (riskLevel) {
            case "High"   -> 20.0;
            case "Medium" -> 55.0;
            default       -> 100.0;
        };

        feedback = switch (riskLevel) {
            case "High"   -> "HIGH cognitive load. Long sessions with zero mastery gain. Take breaks and shorten sessions.";
            case "Medium" -> "Moderate load. Some long sessions not producing mastery gains.";
            default       -> "Healthy cognitive load. Good session length and mastery balance.";
        };
    }

    public boolean isOverloadDetected() { return overloadDetected; }
    public String  getRiskLevel()        { return riskLevel; }
}


