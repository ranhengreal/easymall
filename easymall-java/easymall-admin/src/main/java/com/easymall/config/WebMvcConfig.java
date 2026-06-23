package com.easymall.config;

import com.easymall.auth.resolver.CurrentAdminAccountArgumentResolver;
import com.easymall.auth.resolver.CurrentTokenArgumentResolver;
import com.easymall.interceptor.AdminAuthInterceptor;
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
    private AdminAuthInterceptor adminAuthInterceptor;

    @Resource
    private CurrentAdminAccountArgumentResolver currentAdminAccountArgumentResolver;

    @Resource
    private CurrentTokenArgumentResolver currentTokenArgumentResolver;

    @Value("${upload.path}")
    private String uploadPath;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/admin/**")
                .excludePathPatterns(
                        "/admin/account/login",
                        "/admin/account/checkCode"
                );
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(currentAdminAccountArgumentResolver);
        resolvers.add(currentTokenArgumentResolver);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String basePath = uploadPath.endsWith("/") ? uploadPath : uploadPath + "/";

        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + basePath + "images/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + basePath);
    }
}
