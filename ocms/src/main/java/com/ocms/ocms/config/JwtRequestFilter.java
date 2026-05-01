package com.ocms.ocms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 1. Look for the "Authorization" header in the incoming request
        final String authorizationHeader = request.getHeader("Authorization");

        String userId = null;
        String jwtToken = null;

        // 2. Check if the header exists and starts with "Bearer "
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtToken = authorizationHeader.substring(7); // Remove "Bearer " to get the actual token
            try {
                if (jwtUtil.validateToken(jwtToken)) {
                    userId = jwtUtil.extractUserId(jwtToken);
                }
            } catch (Exception e) {
                System.out.println("Invalid or Expired JWT Token");
            }
        }

        // 3. If we found a valid ID and the user isn't already authenticated in this transaction
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            String role = jwtUtil.extractRole(jwtToken);

            // Tell Spring Security: "This user is verified, let them pass!"
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        // 4. Continue the request to the next step
        chain.doFilter(request, response);
    }
}