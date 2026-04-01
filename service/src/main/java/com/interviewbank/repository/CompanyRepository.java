package com.interviewbank.repository;

import com.interviewbank.model.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findBySlug(String slug);

    @Query("""
        SELECT c FROM Company c
        WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(c.industry) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY c.name
        """)
    Page<Company> searchByNameOrIndustry(@Param("query") String query, Pageable pageable);

    @Query("""
        SELECT c FROM Company c
        JOIN c.experiences e
        WHERE e.status = 'APPROVED'
        GROUP BY c
        ORDER BY COUNT(e) DESC
        """)
    List<Company> findTopCompaniesByExperienceCount(Pageable pageable);
}
