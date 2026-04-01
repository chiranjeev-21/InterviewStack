package com.interviewbank.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.interviewbank.model.Question.QuestionCategory;
import lombok.Builder;
import lombok.Value;

import java.util.List;

/**
 * DTOs for Bayesian interview-category predictions.
 */
public final class PredictionDTOs {

    private PredictionDTOs() {}

    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PredictionResponse {
        String companyName;
        String role;
        int    dataPointsUsed;
        List<CategoryPrediction> categoryPredictions;
        String insight;
    }

    @Value
    @Builder
    public static class CategoryPrediction {
        QuestionCategory category;
        double           probability;     // 0.0 – 1.0, Laplace-smoothed
        int              observedCount;
        List<TopicHint>  topTopics;
    }

    @Value
    @Builder
    public static class TopicHint {
        String topic;
        double frequency;  // relative frequency within this category
    }
}
