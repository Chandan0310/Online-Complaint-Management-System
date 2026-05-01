package com.ocms.ocms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC configuration for serving static resources.
 * <p>
 * Maps the {@code /uploads/**} URL path to the local {@code uploads/}
 * directory so that complaint evidence images can be accessed directly
 * by the React frontend via {@code <img src>} tags.
 * </p>
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Registers a resource handler that serves files from the {@code uploads/}
     * directory under the {@code /uploads/**} URL prefix.
     *
     * @param registry the resource handler registry.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}