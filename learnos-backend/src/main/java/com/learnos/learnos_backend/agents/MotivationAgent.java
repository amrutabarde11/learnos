// ─── agents/MotivationAgent.java ──────────────────────────────────────────────
        package agents;

import models.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Detects disengagement from goals.
 * A goal is disengaged if no session has been logged for it in 4+ days.
 * Surfaces the stored "why" back to the user.
 */
public class MotivationAgent extends BaseAgent {

    private List<String> disengagedGoals = List.of();

    public MotivationAgent() { super("Motivation Agent"); }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        List<String> disengaged = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Most recent session date per goal
        Map<String, LocalDate> lastSessionByGoal = new HashMap<>();
        for (LearningSession s : sessions) {
            LocalDate d = LocalDate.parse(s.getDate());
            lastSessionByGoal.merge(s.getGoalId(), d,
                    (a, b) -> a.isAfter(b) ? a : b);
        }

        for (LearningGoal goal : goals) {
            if (goal.getStatus() != GoalStatus.ACTIVE) continue;
            LocalDate last = lastSessionByGoal.get(goal.getGoalId());
            long daysSince = (last == null) ? 999
                    : ChronoUnit.DAYS.between(last, today);

            if (daysSince >= 4) {
                String msg = "'%s' — %d days without a session. You set this goal because: \"%s\""
                        .formatted(goal.getTitle(), daysSince, goal.getWhy());
                disengaged.add(msg);
            }
        }

        disengagedGoals = Collections.unmodifiableList(disengaged);
        score = disengaged.isEmpty() ? 100 : clamp(100 - (disengaged.size() * 20.0));
        feedback = disengaged.isEmpty()
                ? "You're actively engaged with all your goals."
                : disengaged.get(0);
    }

    public List<String> getDisengagedGoals() { return disengagedGoals; }
}

