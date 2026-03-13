package com.learnos.learnos_backend.repository;

import com.learnos.learnos_backend.models.SessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionRepository extends JpaRepository<SessionEntity, String> {
    List<SessionEntity> findByUserId(String userId);
}
