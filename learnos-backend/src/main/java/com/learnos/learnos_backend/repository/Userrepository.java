package com.learnos.learnos_backend.repository;

import com.learnos.learnos_backend.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, String> {
}
