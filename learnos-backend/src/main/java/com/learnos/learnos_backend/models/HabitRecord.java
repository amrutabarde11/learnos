// ─── models/HabitRecord.java ──────────────────────────────────────────────────
        package models;

public final class HabitRecord {

    private final String userId;
    private final String date;
    private final double totalHours;
    private final int    sessionsCount;

    public HabitRecord(String userId, String date,
                       double totalHours, int sessionsCount) {
        this.userId        = userId;
        this.date          = date;
        this.totalHours    = totalHours;
        this.sessionsCount = sessionsCount;
    }

    public String getUserId()      { return userId; }
    public String getDate()        { return date; }
    public double getTotalHours()  { return totalHours; }
    public int getSessionsCount()  { return sessionsCount; }

    public String toCsvLine() {
        return String.join(",", userId, date,
                String.valueOf(totalHours), String.valueOf(sessionsCount));
    }

    public static HabitRecord fromCsvLine(String line) {
        String[] p = line.split(",", 4);
        return new HabitRecord(p[0].trim(), p[1].trim(),
                Double.parseDouble(p[2].trim()), Integer.parseInt(p[3].trim()));
    }
}
