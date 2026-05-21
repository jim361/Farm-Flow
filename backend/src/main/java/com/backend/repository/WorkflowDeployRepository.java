package com.backend.repository;

import com.backend.entity.WorkflowDeploy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkflowDeployRepository extends JpaRepository<WorkflowDeploy, Long> {
}