package com.interviewbank.controller;

import com.interviewbank.dto.CompanyDTOs;
import com.interviewbank.dto.ExperienceDTOs;
import com.interviewbank.dto.PredictionDTOs;
import com.interviewbank.service.CompanyService;
import com.interviewbank.service.ExperienceService;
import com.interviewbank.service.PredictionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ApiController {

    private final ExperienceService experienceService;
    private final PredictionService predictionService;
    private final CompanyService    companyService;

    // ─── Companies ────────────────────────────────────────────────────────────

    @GetMapping("/companies")
    public ResponseEntity<Page<CompanyDTOs.CompanySummary>> listCompanies(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0")  @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        return ResponseEntity.ok(companyService.listCompanies(search, page, size));
    }

    @GetMapping("/companies/trending")
    public ResponseEntity<List<CompanyDTOs.CompanySummary>> trendingCompanies() {
        return ResponseEntity.ok(companyService.getTrending());
    }

    @GetMapping("/companies/{slug}")
    public ResponseEntity<CompanyDTOs.CompanyDetail> getCompany(@PathVariable String slug) {
        return ResponseEntity.ok(companyService.getDetail(slug));
    }

    // ─── Experiences ──────────────────────────────────────────────────────────

    @GetMapping("/companies/{slug}/experiences")
    public ResponseEntity<Page<ExperienceDTOs.ExperienceResponse>> listExperiences(
            @PathVariable String slug,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0")  @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {

        return ResponseEntity.ok(
                experienceService.getExperiencesForCompany(slug, role, page, size));
    }

    @GetMapping("/experiences/{id}")
    public ResponseEntity<ExperienceDTOs.ExperienceResponse> getExperience(@PathVariable Long id) {
        return ResponseEntity.ok(experienceService.getById(id));
    }

    /**
     * Submit a new interview experience.
     * Requires a valid contributor token in the X-Contributor-Token header.
     */
    @PostMapping("/experiences")
    public ResponseEntity<ExperienceDTOs.ExperienceResponse> submitExperience(
            @Valid @RequestBody ExperienceDTOs.CreateExperienceRequest request,
            @RequestHeader("X-Contributor-Token") String contributorToken) {

        ExperienceDTOs.ExperienceResponse response =
                experienceService.submitExperience(request, contributorToken);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── Predictions ──────────────────────────────────────────────────────────

    @GetMapping("/companies/{slug}/predict")
    public ResponseEntity<PredictionDTOs.PredictionResponse> predict(
            @PathVariable String slug,
            @RequestParam String role) {
        return ResponseEntity.ok(predictionService.predict(slug, role));
    }
}
