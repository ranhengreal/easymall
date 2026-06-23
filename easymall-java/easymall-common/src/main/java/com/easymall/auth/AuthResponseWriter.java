package com.easymall.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 统一认证失败响应写入，避免拦截器直接操作 JSON 序列化细节。
 */
@Component
public class AuthResponseWriter {

    private final ObjectMapper objectMapper;

    public AuthResponseWriter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public boolean writeUnauthorized(HttpServletResponse response, String message) throws Exception {
        response.setStatus(200);
        response.setContentType("application/json;charset=UTF-8");

        Map<String, Object> result = new HashMap<>();
        result.put("code", 401);
        result.put("message", message);
        result.put("data", null);

        response.getWriter().write(objectMapper.writeValueAsString(result));
        return false;
    }
}
