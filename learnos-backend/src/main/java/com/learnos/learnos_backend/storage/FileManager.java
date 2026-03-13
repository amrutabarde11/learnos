package storage;

import models.*;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * FileManager — all CSV persistence.
 * Instantiable, injectable, deduplicated.
 *
 * Files:
 *   data/user.csv
 *   data/academic_profile.csv
 *   data/goals.csv
 *   data/topics.csv
 *   data/milestones.csv
 *   data/assessments.csv
 *   data/subjects.csv
 *   data/sessions.csv
 *   data/habit_log.csv
 *   data/reports/  (directory for exported reports)
 */
public class FileManager {

    private final Path dataDir;
    private final Path userFile;
    private final Path academicFile;
    private final Path goalsFile;
    private final Path topicsFile;
    private final Path milestonesFile;
    private final Path assessmentsFile;
    private final Path subjectsFile;
    private final Path sessionsFile;
    private final Path habitFile;
    private final Path reportsDir;

    public FileManager() { this(Path.of("data")); }

    public FileManager(Path dataDir) {
        this.dataDir        = dataDir;
        this.userFile       = dataDir.resolve("user.csv");
        this.academicFile   = dataDir.resolve("academic_profile.csv");
        this.goalsFile      = dataDir.resolve("goals.csv");
        this.topicsFile     = dataDir.resolve("topics.csv");
        this.milestonesFile = dataDir.resolve("milestones.csv");
        this.assessmentsFile= dataDir.resolve("assessments.csv");
        this.subjectsFile   = dataDir.resolve("subjects.csv");
        this.sessionsFile   = dataDir.resolve("sessions.csv");
        this.habitFile      = dataDir.resolve("habit_log.csv");
        this.reportsDir     = dataDir.resolve("reports");
    }

    public void initStorage() throws IOException {
        Files.createDirectories(dataDir);
        Files.createDirectories(reportsDir);
        for (Path p : List.of(userFile, academicFile, goalsFile, topicsFile,
                milestonesFile, assessmentsFile, subjectsFile, sessionsFile, habitFile))
            if (!Files.exists(p)) Files.createFile(p);
    }

    // ── User ─────────────────────────────────────────────────────────────────

    public void saveUser(User user) throws IOException {
        Files.writeString(userFile, user.toCsvLine() + System.lineSeparator());
    }

    public User loadUser() throws IOException {
        List<String> lines = Files.readAllLines(userFile);
        return lines.isEmpty() ? null : User.fromCsvLine(lines.get(0));
    }

    // ── Academic Profile ──────────────────────────────────────────────────────

    public void saveAcademicProfile(AcademicProfile profile) throws IOException {
        Files.writeString(academicFile, profile.toCsvLine() + System.lineSeparator());
    }

    public AcademicProfile loadAcademicProfile() throws IOException {
        List<String> lines = Files.readAllLines(academicFile);
        return lines.isEmpty() ? null : AcademicProfile.fromCsvLine(lines.get(0));
    }

    // ── Goals ─────────────────────────────────────────────────────────────────

    public void saveGoal(LearningGoal goal) throws IOException {
        appendLine(goalsFile, goal.toCsvLine());
    }

    public void saveAllGoals(List<LearningGoal> goals) throws IOException {
        List<String> lines = new ArrayList<>();
        for (LearningGoal g : goals) lines.add(g.toCsvLine());
        Files.write(goalsFile, lines);
    }

    public List<LearningGoal> loadGoals() throws IOException {
        LinkedHashMap<String, LearningGoal> seen = new LinkedHashMap<>();
        for (String line : Files.readAllLines(goalsFile))
            if (!line.isBlank()) {
                LearningGoal g = LearningGoal.fromCsvLine(line);
                seen.put(g.getGoalId(), g);
            }
        return new ArrayList<>(seen.values());
    }

    // ── Topics ────────────────────────────────────────────────────────────────

    public void saveAllTopics(List<Topic> topics) throws IOException {
        List<String> lines = new ArrayList<>();
        for (Topic t : topics) lines.add(t.toCsvLine());
        Files.write(topicsFile, lines);
    }

    public List<Topic> loadTopics() throws IOException {
        List<Topic> result = new ArrayList<>();
        for (String line : Files.readAllLines(topicsFile))
            if (!line.isBlank()) result.add(Topic.fromCsvLine(line));
        return result;
    }

    // ── Milestones ────────────────────────────────────────────────────────────

    public void saveAllMilestones(List<Milestone> milestones) throws IOException {
        List<String> lines = new ArrayList<>();
        for (Milestone m : milestones) lines.add(m.toCsvLine());
        Files.write(milestonesFile, lines);
    }

    public List<Milestone> loadMilestones() throws IOException {
        List<Milestone> result = new ArrayList<>();
        for (String line : Files.readAllLines(milestonesFile))
            if (!line.isBlank()) result.add(Milestone.fromCsvLine(line));
        return result;
    }

    // ── Assessments ───────────────────────────────────────────────────────────

    public void saveAssessment(Assessment assessment) throws IOException {
        appendLine(assessmentsFile, assessment.toCsvLine());
    }

    public List<Assessment> loadAssessments() throws IOException {
        List<Assessment> result = new ArrayList<>();
        for (String line : Files.readAllLines(assessmentsFile))
            if (!line.isBlank()) result.add(Assessment.fromCsvLine(line));
        return result;
    }

    // ── Subjects ──────────────────────────────────────────────────────────────

    public void saveSubject(Subject subject) throws IOException {
        appendLine(subjectsFile, subject.toCsvLine());
    }

    public void saveAllSubjects(List<Subject> subjects) throws IOException {
        List<String> lines = new ArrayList<>();
        for (Subject s : subjects) lines.add(s.toCsvLine());
        Files.write(subjectsFile, lines);
    }

    public List<Subject> loadSubjects() throws IOException {
        List<Subject> result = new ArrayList<>();
        for (String line : Files.readAllLines(subjectsFile))
            if (!line.isBlank()) result.add(Subject.fromCsvLine(line));
        return result;
    }

    // ── Sessions ──────────────────────────────────────────────────────────────

    public void saveSession(LearningSession session) throws IOException {
        appendLine(sessionsFile, session.toCsvLine());
    }

    public List<LearningSession> loadSessions() throws IOException {
        LinkedHashMap<String, LearningSession> seen = new LinkedHashMap<>();
        for (String line : Files.readAllLines(sessionsFile))
            if (!line.isBlank()) {
                LearningSession s = LearningSession.fromCsvLine(line);
                seen.putIfAbsent(s.getSessionId(), s);
            }
        return new ArrayList<>(seen.values());
    }

    // ── Habit Log ─────────────────────────────────────────────────────────────

    public void saveHabitRecord(HabitRecord record) throws IOException {
        appendLine(habitFile, record.toCsvLine());
    }

    public List<HabitRecord> loadHabitRecords() throws IOException {
        List<HabitRecord> result = new ArrayList<>();
        for (String line : Files.readAllLines(habitFile))
            if (!line.isBlank()) result.add(HabitRecord.fromCsvLine(line));
        return result;
    }

    // ── Reports ───────────────────────────────────────────────────────────────

    public Path getReportsDir() { return reportsDir; }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void appendLine(Path path, String line) throws IOException {
        Files.writeString(path, line + System.lineSeparator(), StandardOpenOption.APPEND);
    }
}
