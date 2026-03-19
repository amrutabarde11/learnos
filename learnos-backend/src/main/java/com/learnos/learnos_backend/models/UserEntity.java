package com.learnos.learnos_backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @Column(name = "clerk_id", nullable = false)
    private String clerkId;

    private String name;
    private String learnerType;
    private double dailyTarget;

    // Goals stored as JSON string — simple, no extra table needed
    @Column(columnDefinition = "TEXT")
    private String goalsJson;

    public UserEntity() {}

    public String getClerkId() { return clerkId; }
    public void setClerkId(String clerkId) { this.clerkId = clerkId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLearnerType() { return learnerType; }
    public void setLearnerType(String learnerType) { this.learnerType = learnerType; }

    public double getDailyTarget() { return dailyTarget; }
    public void setDailyTarget(double dailyTarget) { this.dailyTarget = dailyTarget; }

    public String getGoalsJson() { return goalsJson; }
    public void setGoalsJson(String goalsJson) { this.goalsJson = goalsJson; }
}