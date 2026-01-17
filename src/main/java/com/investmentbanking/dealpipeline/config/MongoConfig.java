package com.investmentbanking.dealpipeline.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.investmentbanking.dealpipeline.repository")
public class MongoConfig {
    // MongoDB configuration is handled via application.yml
    // This class enables MongoDB repositories scanning
}
