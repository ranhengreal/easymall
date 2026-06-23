package com.easymall.auth;

/**
 * Token 解析工具，统一 Bearer 格式处理。
 */
public final class TokenUtils {

    private static final String BEARER_PREFIX = "Bearer ";

    private TokenUtils() {
    }

    public static String extractToken(String authorization) {
        if (authorization == null || authorization.isEmpty()) {
            return null;
        }
        if (authorization.startsWith(BEARER_PREFIX)) {
            return authorization.substring(BEARER_PREFIX.length());
        }
        return authorization;
    }
}
