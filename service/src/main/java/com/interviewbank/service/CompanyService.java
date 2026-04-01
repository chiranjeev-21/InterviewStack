package com.interviewbank.service;

import com.interviewbank.dto.CompanyDTOs;
import com.interviewbank.exception.ResourceNotFoundException;
import com.interviewbank.model.Company;
import com.interviewbank.repository.CompanyRepository;
import com.interviewbank.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository    companyRepository;
    private final ExperienceRepository experienceRepository;

    @Transactional(readOnly = true)
    public Page<CompanyDTOs.CompanySummary> listCompanies(String search, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Company> companies = search == null || search.isBlank()
                ? companyRepository.findAll(pageable)
                : companyRepository.searchByNameOrIndustry(search, pageable);

        return companies.map(this::toSummary);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "trending-companies")
    public List<CompanyDTOs.CompanySummary> getTrending() {
        return companyRepository.findTopCompaniesByExperienceCount(PageRequest.of(0, 10))
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDTOs.CompanyDetail getDetail(String slug) {
        Company c = companyRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + slug));

        List<String> roles = experienceRepository.findDistinctRolesByCompany(c.getId());

        return CompanyDTOs.CompanyDetail.builder()
                .id(c.getId()).name(c.getName()).slug(c.getSlug())
                .logoUrl(c.getLogoUrl()).industry(c.getIndustry()).website(c.getWebsite())
                .totalExperiences(c.getExperiences().size())
                .availableRoles(roles)
                .build();
    }

    private CompanyDTOs.CompanySummary toSummary(Company c) {
        return CompanyDTOs.CompanySummary.builder()
                .id(c.getId()).name(c.getName()).slug(c.getSlug())
                .logoUrl(c.getLogoUrl()).industry(c.getIndustry())
                .build();
    }
}
