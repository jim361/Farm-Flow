package com.backend.repository;

import com.backend.entity.Workflow;
import com.backend.entity.WorkflowDeploy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkflowDeployRepository extends JpaRepository<WorkflowDeploy, Long> {

    @Modifying
    @Query("DELETE FROM WorkflowDeploy d WHERE d.workflow = :workflow")
    void deleteByWorkflow(@Param("workflow") Workflow workflow);
}