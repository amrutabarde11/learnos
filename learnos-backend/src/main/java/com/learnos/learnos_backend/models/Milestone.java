// ─── models/Milestone.java ────────────────────────────────────────────────────
        package models;

public final class Milestone {

    private final String  goalId;
    private final String  title;
    private final String  dueDate;   // ISO or "none"
    private       boolean completed;

    public Milestone(String goalId, String title, String dueDate, boolean completed) {
        this.goalId    = goalId;
        this.title     = title;
        this.dueDate   = dueDate == null ? "none" : dueDate;
        this.completed = completed;
    }

    public String  getGoalId()   { return goalId; }
    public String  getTitle()    { return title; }
    public String  getDueDate()  { return dueDate; }
    public boolean isCompleted() { return completed; }
    public void    setCompleted(boolean v) { this.completed = v; }

    public String toCsvLine() {
        return String.join(",", goalId, title.replace(",", ";"),
                dueDate, String.valueOf(completed));
    }

    public static Milestone fromCsvLine(String line) {
        String[] p = line.split(",", 4);
        return new Milestone(p[0].trim(), p[1].trim().replace(";", ","),
                p[2].trim(), Boolean.parseBoolean(p[3].trim()));
    }
}
