package com.interviewbank.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.util.List;

public final class CompanyDTOs {

    private CompanyDTOs() {}

    @Value @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CompanySummary {
        Long id;
        String name;
        String slug;
        String logoUrl;
        String industry;
        Integer experienceCount;
    }

    @Value @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CompanyDetail {
        Long id;
        String name;
        String slug;
        String logoUrl;
        String industry;
        String website;
        Integer totalExperiences;
        List<String> availableRoles;
    }
}


