package com.ocms.ocms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Servlet filter that intercepts every HTTP request and validates the JWT
 * token from the {@code Authorization} header.
 * <p>
 * If a valid token is found, a {@link UsernamePasswordAuthenticationToken}
 * is created and placed into the {@link SecurityContextHolder} so that
 * Spring Security treats the request as authenticated.  The filter
 * executes exactly once per request ({@link OncePerRequestFilter}).
 * </p>
 */
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtRequestFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Extracts and validates the JWT from the {@code Authorization: Bearer <token>}
     * header.  If valid, populates the security context with the user's
     * identity and role.
     *
     * @param request  the incoming HTTP request.
     * @param response the outgoing HTTP response.
     * @param chain    the remaining filter chain.
     * @throws ServletException on servlet errors.
     * @throws IOException      on I/O errors.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String userId = null;
        String jwtToken = null;

        /* Extract the token from the "Bearer " prefix */
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtToken = authorizationHeader.substring(7);
            try {
                if (jwtUtil.validateToken(jwtToken)) {
                    userId = jwtUtil.extractUserId(jwtToken);
                }
            } catch (Exception e) {
                log.warn("Invalid or expired JWT token");
            }
        }

        /* If we have a valid user and the context is not yet authenticated */
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String role = jwtUtil.extractRole(jwtToken);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        /* Continue the filter chain */
        chain.doFilter(request, response);
    }
}