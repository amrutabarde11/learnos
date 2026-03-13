// ─── agents/Agent.java ────────────────────────────────────────────────────────
        package agents;

import models.*;
import java.util.List;

public interface Agent {
    void   analyze(User user, List<LearningGoal> goals,
                   List<LearningSession> sessions) throws AgentException;
    double getScore();
    String getFeedback();
    String getAgentName();
}
