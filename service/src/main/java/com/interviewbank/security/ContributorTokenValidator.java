package com.interviewbank.security;

import com.interviewbank.exception.InvalidTokenException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Validates contributor tokens issued by the standalone Token Generator service.
 *
 * Verification checklist (all must pass):
 *   1. HS256 signature valid (shared JWT_SECRET)
 *   2. iss == app.jwt.issuer  ("interview-bank-token-generator")
 *   3. aud contains app.jwt.audience  ("interview-bank")  ← NEW
 *   4. exp not passed
 *   5. sub (email) present
 *   6. jti present (replay prevention — checked against DB in ExperienceService)
 *
 * This service is READ-ONLY — it never issues tokens.
 */
@Slf4j
@Service
public class ContributorTokenValidator {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.issuer}")
    private String expectedIssuer;

    @Value("${app.jwt.audience}")
    private String expectedAudience;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Validates a contributor token and returns its claims.
     *
     * @param token raw JWT string
     * @return parsed {@link Claims}
     * @throws InvalidTokenException if anything in the checklist fails
     */
    public Claims validateAndExtract(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(expectedIssuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Check expiry
            if (claims.getExpiration() != null && claims.getExpiration().before(new Date())) {
                throw new InvalidTokenException("Token has expired.");
            }

            // Check audience — prevents tokens issued for other apps being used here
            if (claims.getAudience() == null || !claims.getAudience().contains(expectedAudience)) {
                throw new InvalidTokenException(
                    "Token was not issued for this application. " +
                    "Please generate a new token at the token generator.");
            }

            // Check subject (email)
            String subject = claims.getSubject();
            if (subject == null || subject.isBlank()) {
                throw new InvalidTokenException("Token subject (email) is missing.");
            }

            // Check JTI (needed for replay prevention in ExperienceService)
            String jti = claims.getId();
            if (jti == null || jti.isBlank()) {
                throw new InvalidTokenException("Token JTI is missing — cannot prevent replay.");
            }

            log.debug("Token validated: sub={} aud={} jti={}", subject, claims.getAudience(), jti);
            return claims;

        } catch (ExpiredJwtException e) {
            throw new InvalidTokenException("Token has expired.");
        } catch (UnsupportedJwtException | MalformedJwtException e) {
            throw new InvalidTokenException("Malformed or unsupported token.");
        } catch (io.jsonwebtoken.security.SecurityException e) {
            throw new InvalidTokenException("Token signature verification failed.");
        } catch (InvalidTokenException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Unexpected token validation error", e);
            throw new InvalidTokenException("Token validation failed.");
        }
    }

    public String extractEmail(Claims claims) { return claims.getSubject(); }
    public String extractJti(Claims claims)   { return claims.getId(); }
}
