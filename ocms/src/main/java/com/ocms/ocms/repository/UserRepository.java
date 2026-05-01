package com.ocms.ocms.repository;

import com.ocms.ocms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entities.
 * <p>
 * The primary key type is {@code String} because users are identified by
 * their College ID (students) or generated manager ID.
 * </p>
 */
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Finds a user by their unique email address.
     * Used during registration to detect duplicate emails.
     *
     * @param email the email address to search for.
     * @return an {@link Optional} containing the matching user, or empty.
     */
    Optional<User> findByEmail(String email);
}