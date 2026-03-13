//─── models/Topic.java ────────────────────────────────────────────────────────
        package models;

import java.time.LocalDate;

/**
 * A single learnable unit within a goal.
 * Tracks mastery level and when it was last studied.
 */
public final class Topic {

    private final String      goalId;
    private final String      name;
    private final Priority    priority;
    private       MasteryLevel masteryLevel;
    private       String      lastStudied; // ISO date or "never"

    public Topic(String goalId, String name, Priority priority,
                 MasteryLevel masteryLevel, String lastStudied) {
        this.goalId       = goalId;
        this.name         = name;
        this.priority     = priority;
        this.masteryLevel = masteryLevel;
        this.lastStudied  = lastStudied == null ? "never" : lastStudied;
    }

    public String       getGoalId()      { return goalId; }
    public String       getName()        { return name; }
    public Priority     getPriority()    { return priority; }
    public MasteryLevel getMasteryLevel(){ return masteryLevel; }
    public String       getLastStudied() { return lastStudied; }

    public void setMasteryLevel(MasteryLevel level) { this.masteryLevel = level; }
    public void setLastStudied(String date)          { this.lastStudied  = date; }

    /** Days since last studied. Returns 999 if never studied. */
    public long daysSinceStudied() {
        if ("never".equals(lastStudied)) return 999;
        return java.time.temporal.ChronoUnit.DAYS.between(
                LocalDate.parse(lastStudied), LocalDate.now());
    }

    public String toCsvLine() {
        return String.join(",", goalId, name, priority.name(),
                masteryLevel.name(), lastStudied);
    }

    public static Topic fromCsvLine(String line) {
        String[] p = line.split(",", 5);
        return new Topic(p[0].trim(), p[1].trim(),
                Priority.valueOf(p[2].trim()),
                MasteryLevel.valueOf(p[3].trim()), p[4].trim());
    }
}

