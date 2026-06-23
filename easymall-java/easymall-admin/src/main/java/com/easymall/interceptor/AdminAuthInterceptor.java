package com.easymall.interceptor;

import com.easymall.auth.AdminTokenService;
import com.easymall.auth.AuthContext;
import com.easymall.auth.AuthResponseWriter;
import com.easymall.auth.TokenUtils;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 管理端认证拦截器：仅负责管理员 token 校验与上下文注入，路径规则由 WebMvcConfig 管理。
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    @Resource
    private AdminTokenService adminTokenService;

    @Resource
    private AuthResponseWriter authResponseWriter;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = TokenUtils.extractToken(request.getHeader("Authorization"));
        if (token == null || token.isEmpty()) {
            return authResponseWriter.writeUnauthorized(response, "未登录，请先登录");
        }

        String adminAccount = adminTokenService.getAdminAccountByToken(token);
        if (adminAccount == null) {
            return authResponseWriter.writeUnauthorized(response, "登录已过期，请重新登录");
        }

        request.setAttribute(AuthContext.REQUEST_ATTR_ADMIN_ACCOUNT, adminAccount);
        request.setAttribute(AuthContext.REQUEST_ATTR_TOKEN, token);
        return true;
    }
}
