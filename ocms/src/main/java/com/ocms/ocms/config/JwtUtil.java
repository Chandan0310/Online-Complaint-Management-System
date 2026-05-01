package com.ocms.ocms.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Utility class for generating, parsing, and validating JSON Web Tokens (JWTs).
 * <p>
 * The HMAC-SHA signing key is derived from the {@code jwt.secret} property
 * defined in {@code application.properties}.  Tokens are valid for 24 hours.
 * </p>
 */
@Component
public class JwtUtil {

    /** Secret string loaded from application properties. */
    @Value("${jwt.secret}")
    private String secretString;

    /** Cryptographic key derived from the secret string. */
    private Key key;

    /** Token validity duration — 24 hours in milliseconds. */
    private final long EXPIRATION_TIME = 86_400_000;

    /**
     * Initialises the HMAC-SHA key from the configured secret string.
     * Called automatically by Spring after dependency injection.
     */
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretString.getBytes());
    }

    /**
     * Generates a signed JWT containing the user's College ID as the subject
     * and their role as a custom claim.
     *
     * @param userId the user's College ID (or manager ID).
     * @param role   the user's role (STUDENT, MANAGER, or ADMIN).
     * @return a compact, signed JWT string.
     */
    public String generateToken(String userId, String role) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    /**
     * Extracts the College ID (subject) from a validated token.
     *
     * @param token the JWT string.
     * @return the user's College ID.
     */
    public String extractUserId(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * Extracts the role claim from a validated token.
     *
     * @param token the JWT string.
     * @return the user's role as a string.
     */
    public String extractRole(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().get("role", String.class);
    }

    /**
     * Validates a JWT by attempting to parse and verify its signature.
     *
     * @param token the JWT string.
     * @return {@code true} if the token is valid, {@code false} if it is
     *         expired, malformed, or has an invalid signature.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}