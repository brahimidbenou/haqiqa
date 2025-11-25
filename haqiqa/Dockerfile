# 1. Use an official Java 23 runtime as the base image
FROM eclipse-temurin:23-jdk-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the built .war file from your 'target' folder into the container
#    This wildcard copies the war file without needing the exact version
COPY target/*.war app.war

# 4. Tell Docker the container listens on port 8080
EXPOSE 8080

# 5. The command to run your application
ENTRYPOINT ["java", "-jar", "app.war"]