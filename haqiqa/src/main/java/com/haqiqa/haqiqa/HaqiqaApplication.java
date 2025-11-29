package com.haqiqa.haqiqa;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HaqiqaApplication {

	public static void main(String[] args) {
		Dotenv.configure().ignoreIfMissing().systemProperties().load();
		SpringApplication.run(HaqiqaApplication.class, args);
	}

}
