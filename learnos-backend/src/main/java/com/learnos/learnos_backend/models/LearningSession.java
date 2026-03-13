// ─── models/LearningSession.java ──────────────────────────────────────────────
        package models;

public final class LearningSession {

    private final String      sessionId;
    private final String      userId;
    private final String      goalId;
    private final String      topicName;
    private final String      date;
    private final double      durationHours;
    private final MasteryLevel masteryBefore;
    private final MasteryLevel masteryAfter;
    private final SessionType sessionType;
    private final String      notes;

    public LearningSession(String sessionId, String userId, String goalId,
                           String topicName, String date, double durationHours,
                           MasteryLevel masteryBefore, MasteryLevel masteryAfter,
                           SessionType sessionType, String notes) {
        if (durationHours <= 0) throw new IllegalArgumentException("duration must be > 0.");
        this.sessionId     = sessionId;
        this.userId        = userId;
        this.goalId        = goalId;
        this.topicName     = topicName;
        this.date          = date;
        this.durationHours = durationHours;
        this.masteryBefore = masteryBefore;
        this.masteryAfter  = masteryAfter;
        this.sessionType   = sessionType;
        this.notes         = notes == null ? "" : notes;
    }

    public String       getSessionId()    { return sessionId; }
    public String       getUserId()       { return userId; }
    public String       getGoalId()       { return goalId; }
    public String       getTopicName()    { return topicName; }
    public String       getDate()         { return date; }
    public double       getDurationHours(){ return durationHours; }
    public MasteryLevel getMasteryBefore(){ return masteryBefore; }
    public MasteryLevel getMasteryAfter() { return masteryAfter; }
    public SessionType  getSessionType()  { return sessionType; }
    public String       getNotes()        { return notes; }

    /** Returns 1 if mastery increased, 0 if unchanged, -1 if decreased. */
    public int masteryDelta() {
        return Integer.compare(masteryAfter.ordinal(), masteryBefore.ordinal());
    }

    public String toCsvLine() {
        return String.join(",", sessionId, userId, goalId,
                topicName.replace(",", ";"), date,
                String.valueOf(durationHours),
                masteryBefore.name(), masteryAfter.name(),
                sessionType.name(), notes.replace(",", ";"));
    }

    public static LearningSession fromCsvLine(String line) {
        String[] p = line.split(",", 10);
        return new LearningSession(p[0].trim(), p[1].trim(), p[2].trim(),
                p[3].trim().replace(";", ","), p[4].trim(),
                Double.parseDouble(p[5].trim()),
                MasteryLevel.valueOf(p[6].trim()),
                MasteryLevel.valueOf(p[7].trim()),
                SessionType.valueOf(p[8].trim()),
                p.length > 9 ? p[9].trim().replace(";", ",") : "");
    }
}