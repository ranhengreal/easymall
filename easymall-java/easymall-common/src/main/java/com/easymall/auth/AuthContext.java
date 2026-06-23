package com.easymall.auth;

/**
 * 认证上下文：拦截器写入 request attribute，ArgumentResolver 读取。
 */
public final class AuthContext {

    public static final String REQUEST_ATTR_USER_ID = "authUserId";
    public static final String REQUEST_ATTR_TOKEN = "authToken";
    public static final String REQUEST_ATTR_ADMIN_ACCOUNT = "adminAccount";

    private AuthContext() {
    }
}
