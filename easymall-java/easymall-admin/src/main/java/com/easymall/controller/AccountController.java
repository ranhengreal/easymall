package com.easymall.controller;

import com.easymall.auth.AdminTokenService;
import com.easymall.auth.annotation.CurrentAdminAccount;
import com.easymall.auth.annotation.CurrentToken;
import com.easymall.component.RedisComponent;
import com.easymall.entity.config.AppConfig;
import com.easymall.entity.result.Result;
import com.easymall.entity.result.ResultCode;
import com.easymall.entity.vo.CheckCodeVO;
import com.wf.captcha.ArithmeticCaptcha;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/account")
@Slf4j
@Validated
public class AccountController {

    @Resource
    private RedisComponent redisComponent;

    @Resource
    private AdminTokenService adminTokenService;

    @Resource
    private AppConfig appConfig;

    @GetMapping("/checkCode")
    public Result<CheckCodeVO> checkCode() {
        ArithmeticCaptcha captcha = new ArithmeticCaptcha(100, 42);
        String code = captcha.text();
        String checkCodeBase64 = captcha.toBase64();
        String checkCodeKey = redisComponent.saveCheckCode(code);
        return Result.success(new CheckCodeVO(checkCodeKey, checkCodeBase64));
    }

    @PostMapping("/login")
    public Result<String> login(@NotEmpty String account,
                                @NotEmpty String password,
                                @NotEmpty String checkCode,
                                @NotEmpty String checkCodeKey) {
        boolean codeValid = false;
        try {
            String savedCode = redisComponent.getCheckCode(checkCodeKey);
            if (savedCode == null) {
                return Result.error(ResultCode.CODE_EXPIRED);
            }
            if (!checkCode.equalsIgnoreCase(savedCode)) {
                return Result.error(ResultCode.CODE_ERROR);
            }
            codeValid = true;
            if (!account.equalsIgnoreCase(appConfig.getAdminAccount()) ||
                    !password.equalsIgnoreCase(appConfig.getAdminPassword())) {
                return Result.error(ResultCode.LOGIN_ERROR);
            }
            String token = adminTokenService.createToken(account);
            log.info("管理员登录成功: {}", account);
            return Result.success(token);
        } finally {
            if (codeValid) {
                redisComponent.cleanCheckCode(checkCodeKey);
            }
        }
    }

    @PostMapping("/logout")
    public Result<String> logout(@CurrentToken String token) {
        adminTokenService.removeToken(token);
        log.info("管理员登出成功");
        return Result.success("登出成功");
    }

    /**
     * 获取当前管理员信息
     */
    @GetMapping("/info")
    public Result<Map<String, Object>> getInfo(@CurrentAdminAccount String adminAccount) {
        Map<String, Object> info = Map.of(
                "account", adminAccount,
                "role", "超级管理员",
                "avatar", "https://cube.elemecdn.com/0/88/03b164d5f8a6ae5a66e6f6b8b3c70e.png"
        );
        return Result.success(info);
    }

    /**
     * 修改密码
     */
    @PutMapping("/password")
    public Result<String> changePassword(@CurrentAdminAccount String adminAccount,
                                         @CurrentToken String token,
                                         @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        if (oldPassword == null || oldPassword.isEmpty()) {
            return Result.error("请输入旧密码");
        }
        if (newPassword == null || newPassword.isEmpty()) {
            return Result.error("请输入新密码");
        }
        if (newPassword.length() < 6 || newPassword.length() > 20) {
            return Result.error("新密码长度必须在6-20个字符之间");
        }

        if (!oldPassword.equals(appConfig.getAdminPassword())) {
            return Result.error("旧密码错误");
        }

        log.info("管理员修改密码: account={}", adminAccount);
        adminTokenService.removeToken(token);
        return Result.success("密码修改成功，请重新登录");
    }
}
