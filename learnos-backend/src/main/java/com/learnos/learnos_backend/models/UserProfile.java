// ─── models/UserProfile.java ──────────────────────────────────────────────────
        package models;

/**
 * Personal preferences and learner configuration.
 */
public final class UserProfile {

    public enum LearnerType { STUDENT, SELF_LEARNER, BOTH }

    private final String      name;
    private final LearnerType learnerType;
    private final double      dailyLearningTargetHours;
    private final int         preferredSessionMinutes;

    public UserProfile(String name, LearnerType learnerType,
                       double dailyLearningTargetHours, int preferredSessionMinutes) {
        if (name == null || name.isBlank())         throw new IllegalArgumentException("name required.");
        if (dailyLearningTargetHours <= 0)          throw new IllegalArgumentException("daily target must be > 0.");
        if (preferredSessionMinutes <= 0)           throw new IllegalArgumentException("session length must be > 0.");
        this.name                      = name;
        this.learnerType               = learnerType;
        this.dailyLearningTargetHours  = dailyLearningTargetHours;
        this.preferredSessionMinutes   = preferredSessionMinutes;
    }

    public String      getName()                       { return name; }
    public LearnerType getLearnerType()                { return learnerType; }
    public double      getDailyLearningTargetHours()   { return dailyLearningTargetHours; }
    public int         getPreferredSessionMinutes()    { return preferredSessionMinutes; }

    public boolean isStudent()     { return learnerType == LearnerType.STUDENT || learnerType == LearnerType.BOTH; }
    public boolean isSelfLearner() { return learnerType == LearnerType.SELF_LEARNER || learnerType == LearnerType.BOTH; }

    public String toCsvLine() {
        return String.join(",", name, learnerType.name(),
                String.valueOf(dailyLearningTargetHours),
                String.valueOf(preferredSessionMinutes));
    }

    public static UserProfile fromCsvLine(String line) {
        String[] p = line.split(",", 4);
        return new UserProfile(p[0].trim(), LearnerType.valueOf(p[1].trim()),
                Double.parseDouble(p[2].trim()), Integer.parseInt(p[3].trim()));
    }
}
