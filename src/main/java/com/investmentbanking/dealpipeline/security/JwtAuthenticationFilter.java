package com.investmentbanking.dealpipeline.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            
            // Only process if token is present
            if (StringUtils.hasText(jwt)) {
                try {
                    // Extract username from token
                    String username = jwtTokenProvider.extractUsername(jwt);
                    
                    // Only set authentication if not already set and username is valid
                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        // Load user details from database
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        
                        // Validate token signature, expiration, and username match
                        if (jwtTokenProvider.validateToken(jwt, userDetails)) {
                            // Create authentication token with authorities from UserDetails
                            UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(
                                    userDetails, 
                                    null, 
                                    userDetails.getAuthorities()
                                );
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            
                            // Set authentication in SecurityContext
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            
                            logger.debug("Successfully authenticated user: " + username);
                        } else {
                            logger.warn("Token validation failed for user: " + username);
                            // Don't set authentication - let SecurityConfig handle unauthorized
                        }
                    }
                } catch (io.jsonwebtoken.ExpiredJwtException ex) {
                    logger.warn("JWT token is expired: " + ex.getMessage());
                    // Continue filter chain - SecurityConfig will return 401
                } catch (io.jsonwebtoken.security.SignatureException ex) {
                    logger.warn("Invalid JWT signature: " + ex.getMessage());
                    // Continue filter chain - SecurityConfig will return 401
                } catch (io.jsonwebtoken.MalformedJwtException ex) {
                    logger.warn("Invalid JWT token format: " + ex.getMessage());
                    // Continue filter chain - SecurityConfig will return 401
                } catch (org.springframework.security.core.userdetails.UsernameNotFoundException ex) {
                    logger.warn("User not found: " + ex.getMessage());
                    // Continue filter chain - SecurityConfig will return 401
                } catch (Exception ex) {
                    logger.error("Error processing JWT token: " + ex.getMessage(), ex);
                    // Continue filter chain - don't fail public endpoints
                }
            }
            // If no token, continue filter chain (public endpoints will work, protected ones will get 401)
        } catch (Exception ex) {
            logger.error("Unexpected error in JWT filter", ex);
            // Always continue filter chain - don't block requests
        }
        
        // Always continue filter chain - let SecurityConfig handle authorization
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
