package com.interviewbank.exception;

// ──────────────────────────────────────────────────────────────────────────────
// Domain Exceptions
// ──────────────────────────────────────────────────────────────────────────────

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}
