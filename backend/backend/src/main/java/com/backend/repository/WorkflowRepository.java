package com.backend.repository;

import com.backend.entity.User;
import com.backend.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    Optional<Workflow> findByUid(String uid);
    List<Workflow> findByUser(User user);
}