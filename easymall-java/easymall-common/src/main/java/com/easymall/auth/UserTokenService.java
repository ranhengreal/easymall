package com.easymall.auth;

import com.easymall.component.RedisComponent;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

/**
 * 用户 Token 校验服务，将 Redis 查询从拦截器中剥离。
 */
@Service
public class UserTokenService {

    @Resource
    private RedisComponent redisComponent;

    public String getUserIdByToken(String token) {
        return redisComponent.getUserIdByToken(token);
    }
}
