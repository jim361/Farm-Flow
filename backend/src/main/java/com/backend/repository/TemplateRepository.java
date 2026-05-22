package com.backend.repository;

import com.backend.entity.Template;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TemplateRepository extends JpaRepository<Template, Long> {
    List<Template> findByCropType(String cropType);
    Optional<Template> findByUid(String uid);
}