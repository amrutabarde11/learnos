// ─── models/User.java ─────────────────────────────────────────────────────────
        package models;

/**
 * Top-level user entity.
 * Replaces the old Student class — works for any type of learner.
 */
public final class User {

    private final String userId;
    private final UserProfile profile;

    public User(String userId, UserProfile profile) {
        if (userId == null || userId.isBlank())  throw new IllegalArgumentException("userId required.");
        if (profile == null)                     throw new IllegalArgumentException("profile required.");
        this.userId  = userId;
        this.profile = profile;
    }

    public String      getUserId() { return userId; }
    public UserProfile getProfile(){ return profile; }

    public String toCsvLine() {
        return String.join(",", userId, profile.toCsvLine());
    }

    public static User fromCsvLine(String line) {
        // userId is first field, rest belongs to UserProfile
        int firstComma = line.indexOf(',');
        String userId       = line.substring(0, firstComma);
        String profilePart  = line.substring(firstComma + 1);
        return new User(userId, UserProfile.fromCsvLine(profilePart));
    }

    @Override public String toString() {
        return "User{id=%s, name=%s}".formatted(userId, profile.getName());
    }
}
