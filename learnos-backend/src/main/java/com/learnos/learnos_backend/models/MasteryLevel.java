// ─── models/MasteryLevel.java ─────────────────────────────────────────────────
        package models;

/**
 * Six-stage mastery progression.
 * Ordinal values (0–5) are used for velocity calculations.
 */
public enum MasteryLevel {
    UNAWARE,    // 0 — haven't touched this topic
    EXPOSED,    // 1 — seen it, very confused
    FAMILIAR,   // 2 — understand the basics
    COMPETENT,  // 3 — can apply with effort
    PROFICIENT, // 4 — comfortable, mostly automatic
    MASTERED;   // 5 — can teach it, handle edge cases

    public boolean isAbove(MasteryLevel other) {
        return this.ordinal() > other.ordinal();
    }

    public boolean isBelow(MasteryLevel other) {
        return this.ordinal() < other.ordinal();
    }

    public int toScore() {
        return this.ordinal() * 20; // 0,20,40,60,80,100
    }
}