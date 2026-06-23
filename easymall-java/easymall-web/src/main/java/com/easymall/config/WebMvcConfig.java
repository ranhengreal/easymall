package com.easymall.config;

import com.easymall.auth.resolver.CurrentTokenArgumentResolver;
import com.easymall.auth.resolver.CurrentUserIdArgumentResolver;
import com.easymall.interceptor.UserAuthInterceptor;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Resource
    private UserAuthInterceptor userAuthInterceptor;

    @Resource
    private CurrentUserIdArgumentResolver currentUserIdArgumentResolver;

    @Resource
    private CurrentTokenArgumentResolver currentTokenArgumentResolver;

    @Value("${upload.path}")
    private String uploadPath;

    /** 需要登录的接口（显式声明，其余接口默认公开） */
    private static final String[] AUTH_PATHS = {
            "/user/logout",
            "/user/info",
            "/user/password",
            "/cart/**",
            "/order/**"
    };

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userAuthInterceptor)
                .addPathPatterns(AUTH_PATHS);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(currentUserIdArgumentResolver);
        resolvers.add(currentTokenArgumentResolver);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String basePath = uploadPath.endsWith("/") ? uploadPath : uploadPath + "/";

        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + basePath + "images/");
    }
}
