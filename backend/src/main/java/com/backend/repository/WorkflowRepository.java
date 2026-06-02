package com.backend.repository;

import com.backend.entity.User;
import com.backend.entity.Workflow;
import com.backend.entity.WorkflowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    Optional<Workflow> findByUid(String uid);
    List<Workflow> findByUser(User user);

    @Query("""
        SELECT w FROM Workflow w
        JOIN FETCH w.user u
        WHERE w.status = :status
          AND u.greenhouseUid = :greenhouseUid
        """)
    List<Workflow> findByStatusAndUserGreenhouseUid(
            @Param("status") WorkflowStatus status,
            @Param("greenhouseUid") String greenhouseUid
    );
}
