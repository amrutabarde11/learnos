// ─── models/Assessment.java ───────────────────────────────────────────────────
        package models;

public final class Assessment {

    private final String         goalId;
    private final String         name;
    private final AssessmentType type;
    private final double         marksObtained;
    private final double         maxMarks;
    private final double         weightage;   // % contribution to final grade
    private final String         date;

    public Assessment(String goalId, String name, AssessmentType type,
                      double marksObtained, double maxMarks,
                      double weightage, String date) {
        if (marksObtained < 0 || marksObtained > maxMarks)
            throw new IllegalArgumentException("marksObtained out of range.");
        this.goalId        = goalId;
        this.name          = name;
        this.type          = type;
        this.marksObtained = marksObtained;
        this.maxMarks      = maxMarks;
        this.weightage     = weightage;
        this.date          = date;
    }

    public String         getGoalId()        { return goalId; }
    public String         getName()          { return name; }
    public AssessmentType getType()          { return type; }
    public double         getMarksObtained() { return marksObtained; }
    public double         getMaxMarks()      { return maxMarks; }
    public double         getWeightage()     { return weightage; }
    public String         getDate()          { return date; }
    public double         getPercentage()    { return (marksObtained / maxMarks) * 100.0; }

    public String toCsvLine() {
        return String.join(",", goalId, name.replace(",", ";"), type.name(),
                String.valueOf(marksObtained), String.valueOf(maxMarks),
                String.valueOf(weightage), date);
    }

    public static Assessment fromCsvLine(String line) {
        String[] p = line.split(",", 7);
        return new Assessment(p[0].trim(), p[1].trim().replace(";", ","),
                AssessmentType.valueOf(p[2].trim()),
                Double.parseDouble(p[3].trim()), Double.parseDouble(p[4].trim()),
                Double.parseDouble(p[5].trim()), p[6].trim());
    }
}
