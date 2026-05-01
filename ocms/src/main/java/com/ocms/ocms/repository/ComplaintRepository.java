package com.ocms.ocms.repository;

import com.ocms.ocms.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Complaint} entities.
 * <p>
 * Provides derived query methods for looking up complaints by student
 * and by assigned manager.
 * </p>
 */
public interface ComplaintRepository extends JpaRepository<Complaint, String> {

    /**
     * Returns all complaints submitted by a specific student.
     *
     * @param studentId the student's College ID.
     * @return list of matching complaints (may be empty).
     */
    List<Complaint> findByStudent_UserId(String studentId);

    /**
     * Returns all complaints assigned to a specific manager.
     *
     * @param managerId the manager's user ID.
     * @return list of matching complaints (may be empty).
     */
    List<Complaint> findByManager_UserId(String managerId);
}