// ─── agents/RecommendationAgent.java ─────────────────────────────────────────
        package agents;

import models.*;
import java.util.*;

/**
 * Synthesises all upstream agent results.
 * Upstream agents injected via constructor — no temporal coupling.
 */
public class RecommendationAgent extends BaseAgent {

    private final ProductivityAgent   pa;
    private final MasteryAgent        ma;
    private final CognitiveAgent      ca;
    private final TopicPriorityAgent  tpa;
    private final DeadlineAgent       da;
    private final RetentionAgent      ra;
    private final GoalProgressAgent   gpa;
    private final MotivationAgent     moa;

    private List<String> recommendations = List.of();
    private String       priorityAction  = "";

    public RecommendationAgent(ProductivityAgent pa, MasteryAgent ma,
                               CognitiveAgent ca, TopicPriorityAgent tpa,
                               DeadlineAgent da, RetentionAgent ra,
                               GoalProgressAgent gpa, MotivationAgent moa) {
        super("Recommendation Agent");
        this.pa = pa; this.ma = ma; this.ca = ca; this.tpa = tpa;
        this.da = da; this.ra = ra; this.gpa = gpa; this.moa = moa;
    }

    @Override
    public void analyze(User user, List<LearningGoal> goals,
                        List<LearningSession> sessions) throws AgentException {
        requireSessions(sessions, 1);
        List<String> result = new ArrayList<>();

        // Priority 1 — cognitive overload is most urgent
        if ("High".equals(ca.getRiskLevel())) {
            result.add("🚨 URGENT: Shorten your sessions. Long sessions with no mastery gain = wasted time.");
            priorityAction = "Take a break and cap sessions at 90 minutes.";
        }

        // Priority 2 — deadline risk
        da.getAtRiskDeadlines().forEach(r -> result.add("⏰ DEADLINE: " + r));
        if (!da.getAtRiskDeadlines().isEmpty() && priorityAction.isEmpty())
            priorityAction = da.getAtRiskDeadlines().get(0);

        // Priority 3 — forgetting curve
        if (!ra.getForgettingRiskTopics().isEmpty()) {
            result.add("🔁 REVISE: " + ra.getForgettingRiskTopics().get(0));
            if (priorityAction.isEmpty()) priorityAction = "Schedule revision for topics you're about to forget.";
        }

        // Priority 4 — avoided high priority topics
        if (!tpa.getAvoidedHighPriorityTopics().isEmpty())
            result.add("🎯 PRIORITY: Start sessions on: " +
                    String.join(", ", tpa.getAvoidedHighPriorityTopics()));

        // Priority 5 — disengagement
        moa.getDisengagedGoals().forEach(d -> result.add("💡 MOTIVATION: " + d));

        // Priority 6 — low productivity
        if (pa.getScore() < 50) {
            result.add("📅 Set fixed daily learning blocks and treat them like appointments.");
            if (priorityAction.isEmpty()) priorityAction = "Consistency matters more than duration. Show up daily.";
        }

        if (result.isEmpty()) {
            result.add("🌟 Excellent learning momentum. Keep going!");
            priorityAction = "Maintain your current pace — you're building real mastery.";
        }

        if (priorityAction.isEmpty()) priorityAction = result.get(0);

        recommendations = Collections.unmodifiableList(result);
        score    = 100.0;
        feedback = priorityAction;
    }

    public List<String> getRecommendations() { return recommendations; }
    public String        getPriorityAction()  { return priorityAction; }
}
