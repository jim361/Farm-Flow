package com.backend.repository;

import com.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findFirstByNameIgnoreCase(String name);
    Optional<User> findByUid(String uid);
    boolean existsByEmail(String email);
    boolean existsByGreenhouseUid(String greenhouseUid);
}
