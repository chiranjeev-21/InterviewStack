package com.interviewbank.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_experiences")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InterviewExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "role_name", nullable = false, length = 150)
    private String role;

    @Column(name = "level_name", length = 50)
    private String level;

    @Column(name = "exp_year", nullable = false)
    private Integer year;

    @Column(name = "exp_month")
    private Integer month;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    private Outcome outcome;

    private Integer rounds;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "verified_email", nullable = false)
    private String verifiedEmail;

    @Column(name = "token_jti", nullable = false, unique = true)
    private String tokenJti;

    @Column(nullable = false)
    @Builder.Default
    private Integer upvotes = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "exp_status", nullable = false)
    @Builder.Default
    private ExperienceStatus status = ExperienceStatus.PENDING;

    @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum Difficulty      { EASY, MEDIUM, HARD }
    public enum Outcome         { OFFER, REJECTED, GHOSTED, PENDING }
    public enum ExperienceStatus { PENDING, APPROVED, REJECTED }
}
