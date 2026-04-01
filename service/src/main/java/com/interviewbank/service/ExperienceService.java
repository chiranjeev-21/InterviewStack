package com.interviewbank.service;

import com.interviewbank.dto.CompanyDTOs;
import com.interviewbank.dto.ExperienceDTOs;
import com.interviewbank.exception.DuplicateTokenException;
import com.interviewbank.exception.InvalidTokenException;
import com.interviewbank.exception.ResourceNotFoundException;
import com.interviewbank.model.Company;
import com.interviewbank.model.InterviewExperience;
import com.interviewbank.model.InterviewExperience.ExperienceStatus;
import com.interviewbank.model.Question;
import com.interviewbank.repository.CompanyRepository;
import com.interviewbank.repository.ExperienceRepository;
import com.interviewbank.security.ContributorTokenValidator;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository    experienceRepository;
    private final CompanyRepository       companyRepository;
    private final ContributorTokenValidator tokenValidator;
    private final TopicClassifierService  topicClassifier;

    // ─── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ExperienceDTOs.ExperienceResponse> getExperiencesForCompany(
            String companySlug, String roleFilter, int page, int size) {

        Company company = companyRepository.findBySlug(companySlug)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companySlug));

        PageRequest pageable = PageRequest.of(page, size);
        Page<InterviewExperience> experiences;

        if (roleFilter != null && !roleFilter.isBlank()) {
            experiences = experienceRepository
                    .findByCompanyIdAndRoleContainingIgnoreCaseAndStatus(
                            company.getId(), roleFilter, ExperienceStatus.APPROVED, pageable);
        } else {
            experiences = experienceRepository
                    .findByCompanyIdAndStatusOrderByCreatedAtDesc(
                            company.getId(), ExperienceStatus.APPROVED, pageable);
        }

        return experiences.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ExperienceDTOs.ExperienceResponse getById(Long id) {
        InterviewExperience exp = experienceRepository.findById(id)
                .filter(e -> e.getStatus() == ExperienceStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found: " + id));
        return toResponse(exp);
    }

    // ─── Write ────────────────────────────────────────────────────────────────

    @Transactional
    public ExperienceDTOs.ExperienceResponse submitExperience(
            ExperienceDTOs.CreateExperienceRequest request, String rawToken) {

        // 1. Validate JWT from token-generator
        Claims claims = tokenValidator.validateAndExtract(rawToken);
        String email  = tokenValidator.extractEmail(claims);
        String jti    = tokenValidator.extractJti(claims);

        // 2. Prevent token reuse (one-time write token)
        if (experienceRepository.existsByTokenJti(jti)) {
            throw new DuplicateTokenException(
                    "This token has already been used. Each token allows exactly one submission.");
        }

        // 3. Resolve company
        Company company = companyRepository.findBySlug(request.getCompanySlug())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Company not found: " + request.getCompanySlug()));

        // 4. Build experience entity
        InterviewExperience experience = InterviewExperience.builder()
                .company(company)
                .role(request.getRole())
                .level(request.getLevel())
                .year(request.getYear())
                .month(request.getMonth())
                .difficulty(request.getDifficulty())
                .outcome(request.getOutcome())
                .rounds(request.getRounds())
                .description(request.getDescription())
                .verifiedEmail(maskEmail(email))
                .tokenJti(jti)
                .status(ExperienceStatus.APPROVED) // auto-approve verified users
                .build();

        // 5. Build questions with auto-classification
        List<Question> questions = request.getQuestions().stream()
                .map(q -> buildQuestion(q, experience))
                .collect(Collectors.toList());
        experience.setQuestions(questions);

        InterviewExperience saved = experienceRepository.save(experience);
        log.info("Experience submitted: company={} role={} by={}", company.getSlug(), request.getRole(), email);

        return toResponse(saved);
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private Question buildQuestion(ExperienceDTOs.CreateQuestionRequest req,
                                   InterviewExperience experience) {
        // Use submitter-provided category if present, otherwise auto-classify
        Question.QuestionCategory category = req.getCategory() != null
                ? req.getCategory()
                : topicClassifier.classify(req.getText());

        String topic = req.getTopic() != null
                ? req.getTopic()
                : topicClassifier.extractTopic(req.getText()).orElse(null);

        return Question.builder()
                .experience(experience)
                .text(req.getText())
                .category(category)
                .topic(topic)
                .roundNumber(req.getRoundNumber())
                .build();
    }

    private ExperienceDTOs.ExperienceResponse toResponse(InterviewExperience e) {
        return ExperienceDTOs.ExperienceResponse.builder()
                .id(e.getId())
                .company(CompanyDTOs.CompanySummary.builder()
                        .id(e.getCompany().getId())
                        .name(e.getCompany().getName())
                        .slug(e.getCompany().getSlug())
                        .logoUrl(e.getCompany().getLogoUrl())
                        .industry(e.getCompany().getIndustry())
                        .build())
                .role(e.getRole())
                .level(e.getLevel())
                .year(e.getYear())
                .month(e.getMonth())
                .difficulty(e.getDifficulty())
                .outcome(e.getOutcome())
                .rounds(e.getRounds())
                .description(e.getDescription())
                .verifiedEmail(e.getVerifiedEmail())
                .upvotes(e.getUpvotes())
                .createdAt(e.getCreatedAt())
                .questions(e.getQuestions().stream().map(q ->
                        ExperienceDTOs.QuestionResponse.builder()
                                .id(q.getId())
                                .text(q.getText())
                                .category(q.getCategory())
                                .topic(q.getTopic())
                                .roundNumber(q.getRoundNumber())
                                .build()).collect(Collectors.toList()))
                .build();
    }

    /** Mask email for public display: j***@gmail.com */
    private String maskEmail(String email) {
        int atIdx = email.indexOf('@');
        if (atIdx <= 1) return email;
        return email.charAt(0) + "***" + email.substring(atIdx);
    }
}
