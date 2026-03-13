//─── models/LearningGoal.java ─────────────────────────────────────────────────
        package models;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Central model — one learning goal with its topics and milestones.
 */
public final class LearningGoal {

    private final String       goalId;
    private final String       userId;
    private final String       title;
    private final GoalCategory category;
    private final String       why;           // stored motivation
    private final String       deadline;      // ISO date or "none"
    private final MasteryLevel targetMastery;
    private       GoalStatus   status;
    private final List<Topic>     topics     = new ArrayList<>();
    private final List<Milestone> milestones = new ArrayList<>();

    public LearningGoal(String goalId, String userId, String title,
                        GoalCategory category, String why, String deadline,
                        MasteryLevel targetMastery, GoalStatus status) {
        this.goalId        = goalId;
        this.userId        = userId;
        this.title         = title;
        this.category      = category;
        this.why           = why;
        this.deadline      = deadline == null ? "none" : deadline;
        this.targetMastery = targetMastery;
        this.status        = status;
    }

    public String       getGoalId()       { return goalId; }
    public String       getUserId()       { return userId; }
    public String       getTitle()        { return title; }
    public GoalCategory getCategory()     { return category; }
    public String       getWhy()          { return why; }
    public String       getDeadline()     { return deadline; }
    public MasteryLevel getTargetMastery(){ return targetMastery; }
    public GoalStatus   getStatus()       { return status; }
    public void         setStatus(GoalStatus s) { this.status = s; }

    public List<Topic>     getTopics()     { return Collections.unmodifiableList(topics); }
    public List<Milestone> getMilestones() { return Collections.unmodifiableList(milestones); }
    public void addTopic(Topic t)          { topics.add(t); }
    public void addMilestone(Milestone m)  { milestones.add(m); }

    /** Progress 0–100 based on average topic mastery vs target mastery. */
    public double getProgressScore() {
        if (topics.isEmpty()) return 0;
        double avg = topics.stream()
                .mapToInt(t -> t.getMasteryLevel().ordinal()).average().orElse(0);
        return Math.min(100, (avg / targetMastery.ordinal()) * 100);
    }

    public String toCsvLine() {
        return String.join(",", goalId, userId, title, category.name(),
                why.replace(",", ";"), deadline,
                targetMastery.name(), status.name());
    }

    public static LearningGoal fromCsvLine(String line) {
        String[] p = line.split(",", 8);
        return new LearningGoal(p[0].trim(), p[1].trim(),
                p[2].trim(), GoalCategory.valueOf(p[3].trim()),
                p[4].trim().replace(";", ","), p[5].trim(),
                MasteryLevel.valueOf(p[6].trim()),
                GoalStatus.valueOf(p[7].trim()));
    }
}

