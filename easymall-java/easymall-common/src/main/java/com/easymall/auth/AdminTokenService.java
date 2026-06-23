package com.easymall.auth;

import com.easymall.component.RedisComponent;
import com.easymall.entity.constants.Constants;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AdminTokenService {

    @Resource
    private RedisComponent redisComponent;

    public String createToken(String adminAccount) {
        String token = UUID.randomUUID().toString();
        saveToken(token, adminAccount);
        return token;
    }

    public void saveToken(String token, String adminAccount) {
        String key = Constants.REDIS_KEY_ADMIN_TOKEN + token;
        redisComponent.setex(key, adminAccount, Constants.REDIS_KEY_EXPIRE_DAY);
    }

    public String getAdminAccountByToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }
        String key = Constants.REDIS_KEY_ADMIN_TOKEN + token;
        return redisComponent.getValue(key);
    }

    public void removeToken(String token) {
        if (token == null || token.isEmpty()) {
            return;
        }
        String key = Constants.REDIS_KEY_ADMIN_TOKEN + token;
        redisComponent.deleteKey(key);
    }
}
