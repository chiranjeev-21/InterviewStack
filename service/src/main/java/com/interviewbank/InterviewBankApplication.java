package com.interviewbank;

import com.interviewbank.config.EnvFileLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching
@EnableJpaAuditing
@EnableAsync
public class InterviewBankApplication {

    public static void main(String[] args) {
        EnvFileLoader.load();
        SpringApplication.run(InterviewBankApplication.class, args);
    }
}
