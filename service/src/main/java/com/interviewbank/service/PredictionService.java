package com.interviewbank.service;

import com.interviewbank.dto.PredictionDTOs;
import com.interviewbank.model.Company;
import com.interviewbank.model.Question.QuestionCategory;
import com.interviewbank.repository.CompanyRepository;
import com.interviewbank.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Bayesian probability estimator for interview question categories.
 *
 * <p>Model: P(category | company, role) uses Laplace (add-1) smoothing
 * so categories with zero observations still receive a small non-zero
 * probability, avoiding cold-start issues for new companies.
 *
 * <p>Predictions are cached for 1 h to reduce DB load.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionService {

    private static final double LAPLACE_ALPHA = 1.0;
    private static final int    MIN_DATA_POINTS = 3; // warn if fewer observations

    private final CompanyRepository    companyRepository;
    private final ExperienceRepository experienceRepository;

    @Cacheable(value = "predictions", key = "#companySlug + ':' + #role")
    public PredictionDTOs.PredictionResponse predict(String companySlug, String role) {
        Company company = companyRepository.findBySlug(companySlug)
                .orElseThrow(() -> new NoSuchElementException("Company not found: " + companySlug));

        String roleKeyword = normalizeRole(role);
        long totalObservations = experienceRepository.countByCompanyAndRole(company.getId(), roleKeyword);

        List<Object[]> rawCounts = experienceRepository
                .countCategoriesByCompanyAndRole(company.getId(), roleKeyword);

        Map<QuestionCategory, Long> categoryCounts = new EnumMap<>(QuestionCategory.class);
        rawCounts.forEach(row -> categoryCounts.put((QuestionCategory) row[0], (Long) row[1]));

        long totalQuestions = categoryCounts.values().stream().mapToLong(Long::longValue).sum();
        int numCategories = QuestionCategory.values().length;

        List<PredictionDTOs.CategoryPrediction> predictions = new ArrayList<>();

        for (QuestionCategory category : QuestionCategory.values()) {
            long count = categoryCounts.getOrDefault(category, 0L);

            // Laplace smoothing: P = (count + α) / (total + α * K)
            double probability = (count + LAPLACE_ALPHA) /
                    (totalQuestions + LAPLACE_ALPHA * numCategories);

            List<Object[]> topicRows = experienceRepository
                    .countTopicsByCompanyRoleAndCategory(company.getId(), roleKeyword, category);

            long categoryTotal = topicRows.stream().mapToLong(r -> (Long) r[1]).sum();
            List<PredictionDTOs.TopicHint> topTopics = topicRows.stream()
                    .limit(5)
                    .map(r -> PredictionDTOs.TopicHint.builder()
                            .topic((String) r[0])
                            .frequency(categoryTotal > 0 ? (double)(Long)r[1] / categoryTotal : 0)
                            .build())
                    .collect(Collectors.toList());

            predictions.add(PredictionDTOs.CategoryPrediction.builder()
                    .category(category)
                    .probability(Math.round(probability * 1000.0) / 1000.0)
                    .observedCount((int) count)
                    .topTopics(topTopics)
                    .build());
        }

        predictions.sort(Comparator.comparingDouble(PredictionDTOs.CategoryPrediction::getProbability).reversed());

        String insight = generateInsight(predictions, (int) totalObservations);

        return PredictionDTOs.PredictionResponse.builder()
                .companyName(company.getName())
                .role(role)
                .dataPointsUsed((int) totalObservations)
                .categoryPredictions(predictions)
                .insight(insight)
                .build();
    }

    private String generateInsight(List<PredictionDTOs.CategoryPrediction> predictions, int dataPoints) {
        if (dataPoints < MIN_DATA_POINTS) {
            return String.format(
                    "Prediction based on only %d data point(s). Confidence improves with more submissions.",
                    dataPoints);
        }
        if (predictions.isEmpty()) return "No data available yet.";

        PredictionDTOs.CategoryPrediction top = predictions.get(0);
        return String.format(
                "Based on %d interview reports, %s questions appear most frequently (%.0f%% probability). " +
                "Focus your preparation here first.",
                dataPoints,
                top.getCategory().name().replace("_", " "),
                top.getProbability() * 100);
    }

    /**
     * Normalise role string to a keyword suitable for LIKE queries.
     * "Senior Software Engineer II" → "software engineer"
     */
    private String normalizeRole(String role) {
        return role.toLowerCase()
                .replaceAll("(?i)(senior|junior|staff|principal|lead|associate|sr\\.|jr\\.)", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
