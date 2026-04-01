package com.interviewbank.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.interviewbank.model.InterviewExperience.Difficulty;
import com.interviewbank.model.InterviewExperience.Outcome;
import com.interviewbank.model.Question.QuestionCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;

// ──────────────────────────────────────────────────────────────────────────────
// Request DTOs
// ──────────────────────────────────────────────────────────────────────────────

public final class ExperienceDTOs {

    private ExperienceDTOs() {}

    @Value
    @Builder
    public static class CreateExperienceRequest {

        @NotBlank(message = "Company slug is required")
        String companySlug;

        @NotBlank(message = "Role is required")
        @Size(min = 2, max = 150, message = "Role must be 2-150 characters")
        String role;

        @Size(max = 50)
        String level;

        @NotNull(message = "Year is required")
        @Min(value = 2000, message = "Year must be >= 2000")
        @Max(value = 2099, message = "Year must be <= 2099")
        Integer year;

        @Min(1) @Max(12)
        Integer month;

        @NotNull(message = "Difficulty is required")
        Difficulty difficulty;

        Outcome outcome;

        @Min(1) @Max(20)
        Integer rounds;

        @Size(max = 5000, message = "Description must be under 5000 characters")
        String description;

        @NotEmpty(message = "At least one question is required")
        @Size(max = 50, message = "Cannot submit more than 50 questions")
        @Valid
        List<CreateQuestionRequest> questions;
    }

    @Value
    @Builder
    public static class CreateQuestionRequest {

        @NotBlank(message = "Question text is required")
        @Size(min = 5, max = 2000, message = "Question text must be 5-2000 characters")
        String text;

        // Category auto-classified if null; can be overridden by submitter
        QuestionCategory category;

        @Size(max = 100)
        String topic;

        @Min(1) @Max(20)
        Integer roundNumber;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Response DTOs
    // ──────────────────────────────────────────────────────────────────────────

    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ExperienceResponse {
        Long id;
        CompanyDTOs.CompanySummary company;
        String role;
        String level;
        Integer year;
        Integer month;
        Difficulty difficulty;
        Outcome outcome;
        Integer rounds;
        String description;
        String verifiedEmail;
        Integer upvotes;
        Instant createdAt;
        List<QuestionResponse> questions;
    }

    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class QuestionResponse {
        Long id;
        String text;
        QuestionCategory category;
        String topic;
        Integer roundNumber;
    }
}
