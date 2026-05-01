package com.ocms.ocms.repository;

import com.ocms.ocms.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    // Find all complaints submitted by a specific student
    List<Complaint> findByStudent_UserId(String studentId);

    // Find all complaints assigned to a specific manager
    List<Complaint> findByManager_UserId(String managerId);
}