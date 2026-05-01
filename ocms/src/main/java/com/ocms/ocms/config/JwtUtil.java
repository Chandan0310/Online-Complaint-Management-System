package com.ocms.ocms.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // 1. Tell Spring to grab the string from application.properties
    @Value("${jwt.secret}")
    private String secretString;

    private Key key;

    // 2. Turn that string into a cryptographic key right after the app starts
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretString.getBytes());
    }
    // Token is valid for 24 hours (in milliseconds)
    private final long EXPIRATION_TIME = 86400000;

    public String generateToken(String userId, String role) {
        return Jwts.builder()
                .setSubject(userId) // The main identifier is now the College ID
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }
    // Extracts the College ID (userId) from the token
    public String extractUserId(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }

    // Extracts the Role from the token
    public String extractRole(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().get("role", String.class);
    }

    // Checks if the token is valid and hasn't been tampered with
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}