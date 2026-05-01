package com.ocms.ocms.repository;

import com.ocms.ocms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    // We will need this for Login authentication
    Optional<User> findByEmail(String email);
}