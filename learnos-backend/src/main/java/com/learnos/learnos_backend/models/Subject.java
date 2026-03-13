// ─── models/Subject.java ──────────────────────────────────────────────────────
        package models;

public final class Subject {

    private final String      userId;
    private final String      subjectCode;
    private final String      subjectName;
    private final int         creditHours;
    private final SubjectType subjectType;
    private final String      targetGrade;  // "A", "B+", "B" etc.

    public Subject(String userId, String subjectCode, String subjectName,
                   int creditHours, SubjectType subjectType, String targetGrade) {
        this.userId      = userId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.creditHours = creditHours;
        this.subjectType = subjectType;
        this.targetGrade = targetGrade;
    }

    public String      getUserId()     { return userId; }
    public String      getSubjectCode(){ return subjectCode; }
    public String      getSubjectName(){ return subjectName; }
    public int         getCreditHours(){ return creditHours; }
    public SubjectType getSubjectType(){ return subjectType; }
    public String      getTargetGrade(){ return targetGrade; }

    public String toCsvLine() {
        return String.join(",", userId, subjectCode, subjectName,
                String.valueOf(creditHours), subjectType.name(), targetGrade);
    }

    public static Subject fromCsvLine(String line) {
        String[] p = line.split(",", 6);
        return new Subject(p[0].trim(), p[1].trim(), p[2].trim(),
                Integer.parseInt(p[3].trim()),
                SubjectType.valueOf(p[4].trim()), p[5].trim());
    }
}


