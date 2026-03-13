// ─── agents/BaseAgent.java ────────────────────────────────────────────────────
        package agents;

import models.*;
import java.util.List;

public abstract class BaseAgent implements Agent {

    protected double score    = 0.0;
    protected String feedback = "Analysis not yet run.";
    private final String agentName;

    protected BaseAgent(String agentName) { this.agentName = agentName; }

    @Override public double getScore()     { return score; }
    @Override public String getFeedback()  { return feedback; }
    @Override public String getAgentName() { return agentName; }

    protected void requireSessions(List<LearningSession> sessions, int min)
            throws AgentException.InsufficientDataException {
        int found = sessions == null ? 0 : sessions.size();
        if (found < min) throw new AgentException.InsufficientDataException(min, found);
    }

    protected double clamp(double v) { return Math.max(0.0, Math.min(100.0, v)); }
}

