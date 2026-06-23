package com.easymall.interceptor;

import com.easymall.auth.AuthContext;
import com.easymall.auth.AuthResponseWriter;
import com.easymall.auth.TokenUtils;
import com.easymall.auth.UserTokenService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 用户端认证拦截器：仅负责 token 校验与上下文注入，路径白名单由 WebMvcConfig 管理。
 */
@Component
public class UserAuthInterceptor implements HandlerInterceptor {

    @Resource
    private UserTokenService userTokenService;

    @Resource
    private AuthResponseWriter authResponseWriter;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = TokenUtils.extractToken(request.getHeader("Authorization"));
        if (token == null || token.isEmpty()) {
            return authResponseWriter.writeUnauthorized(response, "未登录，请先登录");
        }

        String userId = userTokenService.getUserIdByToken(token);
        if (userId == null) {
            return authResponseWriter.writeUnauthorized(response, "登录已过期，请重新登录");
        }

        request.setAttribute(AuthContext.REQUEST_ATTR_USER_ID, userId);
        request.setAttribute(AuthContext.REQUEST_ATTR_TOKEN, token);
        return true;
    }
}
