// ─── models/AcademicProfile.java ──────────────────────────────────────────────
        package models;

/**
 * University-specific profile.
 * Only created if UserProfile.isStudent() == true.
 */
public final class AcademicProfile {

    private final String userId;
    private final String degree;
    private final String specialisation;
    private final String university;
    private final int    currentYear;
    private final int    currentSemester;
    private final double targetCGPA;

    public AcademicProfile(String userId, String degree, String specialisation,
                           String university, int currentYear,
                           int currentSemester, double targetCGPA) {
        this.userId          = userId;
        this.degree          = degree;
        this.specialisation  = specialisation;
        this.university      = university;
        this.currentYear     = currentYear;
        this.currentSemester = currentSemester;
        this.targetCGPA      = targetCGPA;
    }

    public String getUserId()         { return userId; }
    public String getDegree()         { return degree; }
    public String getSpecialisation() { return specialisation; }
    public String getUniversity()     { return university; }
    public int    getCurrentYear()    { return currentYear; }
    public int    getCurrentSemester(){ return currentSemester; }
    public double getTargetCGPA()     { return targetCGPA; }

    public String toCsvLine() {
        return String.join(",", userId, degree, specialisation, university,
                String.valueOf(currentYear), String.valueOf(currentSemester),
                String.valueOf(targetCGPA));
    }

    public static AcademicProfile fromCsvLine(String line) {
        String[] p = line.split(",", 7);
        return new AcademicProfile(p[0].trim(), p[1].trim(), p[2].trim(), p[3].trim(),
                Integer.parseInt(p[4].trim()), Integer.parseInt(p[5].trim()),
                Double.parseDouble(p[6].trim()));
    }
}
