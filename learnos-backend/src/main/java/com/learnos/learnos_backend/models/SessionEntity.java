package com.learnos.learnos_backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "sessions")
public class SessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String userId; // Clerk user ID
    private String goalId;
    private String goalTitle;
    private String topic;
    private double duration;
    private String sessionType;
    private String masteryBefore;
    private String masteryAfter;
    private String notes;
    private LocalDate date;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getGoalId() { return goalId; }
    public void setGoalId(String goalId) { this.goalId = goalId; }
    public String getGoalTitle() { return goalTitle; }
    public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public double getDuration() { return duration; }
    public void setDuration(double duration) { this.duration = duration; }
    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }
    public String getMasteryBefore() { return masteryBefore; }
    public void setMasteryBefore(String masteryBefore) { this.masteryBefore = masteryBefore; }
    public String getMasteryAfter() { return masteryAfter; }
    public void setMasteryAfter(String masteryAfter) { this.masteryAfter = masteryAfter; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
