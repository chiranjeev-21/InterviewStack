package com.interviewbank.repository;

import com.interviewbank.model.InterviewExperience;
import com.interviewbank.model.InterviewExperience.ExperienceStatus;
import com.interviewbank.model.Question.QuestionCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceRepository extends JpaRepository<InterviewExperience, Long> {

    Page<InterviewExperience> findByCompanyIdAndStatusOrderByCreatedAtDesc(
            Long companyId, ExperienceStatus status, Pageable pageable);

    Page<InterviewExperience> findByCompanyIdAndRoleContainingIgnoreCaseAndStatus(
            Long companyId, String role, ExperienceStatus status, Pageable pageable);

    boolean existsByTokenJti(String tokenJti);

    // --- Prediction queries ---

    @Query("""
        SELECT COUNT(e) FROM InterviewExperience e
        WHERE e.company.id = :companyId
          AND LOWER(e.role) LIKE LOWER(CONCAT('%', :roleKeyword, '%'))
          AND e.status = 'APPROVED'
        """)
    long countByCompanyAndRole(@Param("companyId") Long companyId,
                               @Param("roleKeyword") String roleKeyword);

    @Query("""
        SELECT q.category, COUNT(q) FROM Question q
        JOIN q.experience e
        WHERE e.company.id = :companyId
          AND LOWER(e.role) LIKE LOWER(CONCAT('%', :roleKeyword, '%'))
          AND e.status = 'APPROVED'
        GROUP BY q.category
        """)
    List<Object[]> countCategoriesByCompanyAndRole(@Param("companyId") Long companyId,
                                                   @Param("roleKeyword") String roleKeyword);

    @Query("""
        SELECT q.topic, COUNT(q) FROM Question q
        JOIN q.experience e
        WHERE e.company.id = :companyId
          AND LOWER(e.role) LIKE LOWER(CONCAT('%', :roleKeyword, '%'))
          AND e.status = 'APPROVED'
          AND q.category = :category
          AND q.topic IS NOT NULL
        GROUP BY q.topic
        ORDER BY COUNT(q) DESC
        """)
    List<Object[]> countTopicsByCompanyRoleAndCategory(
            @Param("companyId") Long companyId,
            @Param("roleKeyword") String roleKeyword,
            @Param("category") QuestionCategory category);

    @Query("""
        SELECT DISTINCT e.role FROM InterviewExperience e
        WHERE e.company.id = :companyId
          AND e.status = 'APPROVED'
        ORDER BY e.role
        """)
    List<String> findDistinctRolesByCompany(@Param("companyId") Long companyId);
}
