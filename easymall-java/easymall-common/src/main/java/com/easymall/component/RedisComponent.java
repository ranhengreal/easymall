package com.easymall.component;

import com.easymall.entity.constants.Constants;
import com.easymall.redis.RedisUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Slf4j
public class RedisComponent {
    @Resource
    private RedisUtils redisUtils;

    /**
     * 保存验证码数据
     */
    public String saveCheckCode(String code){
        String checkCodeKey = UUID.randomUUID().toString();
        String fullKey = Constants.REDIS_KEY_CHECK_CODE + checkCodeKey;
        redisUtils.setex(fullKey, code, 60*10);
        log.debug("保存验证码 - key: {}, code: {}", fullKey, code);
        return checkCodeKey;
    }

    /**
     * 获取验证码
     */
    public String getCheckCode(String checkCodeKey){
        String fullKey = Constants.REDIS_KEY_CHECK_CODE + checkCodeKey;
        Object value = redisUtils.get(fullKey);
        return value == null ? null : value.toString();
    }

    /**
     * 清除验证码
     */
    public void cleanCheckCode(String checkCodeKey){
        String fullKey = Constants.REDIS_KEY_CHECK_CODE + checkCodeKey;
        redisUtils.delete(fullKey);
        log.debug("清除验证码 - key: {}", fullKey);
    }

    public void setex(String key, String value, long expireSeconds) {
        redisUtils.setex(key, value, expireSeconds);
    }

    public String getValue(String key) {
        Object value = redisUtils.get(key);
        return value == null ? null : value.toString();
    }

    public void deleteKey(String key) {
        redisUtils.delete(key);
        log.debug("删除 Redis key: {}", key);
    }

    /**
     * 保存用户登录 token，key 格式：easymall:user:token:{token}，value：userId
     */
    public String saveUserToken(String userId) {
        String token = UUID.randomUUID().toString();
        String fullKey = Constants.REDIS_KEY_USER_TOKEN + token;
        redisUtils.setex(fullKey, userId, Constants.REDIS_KEY_EXPIRE_DAY);
        log.info("保存用户token - key: {}, userId: {}", fullKey, userId);
        return token;
    }

    /**
     * 通过 token 获取 userId
     */
    public String getUserIdByToken(String token) {
        String fullKey = Constants.REDIS_KEY_USER_TOKEN + token;
        Object value = redisUtils.get(fullKey);
        return value == null ? null : value.toString();
    }

    /**
     * 删除用户 token（登出）
     */
    public void deleteUserToken(String token) {
        String fullKey = Constants.REDIS_KEY_USER_TOKEN + token;
        redisUtils.delete(fullKey);
        log.info("删除用户token - key: {}", fullKey);
    }
}
