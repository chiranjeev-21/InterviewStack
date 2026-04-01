# Multi-stage build — final image ~220 MB
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

RUN apk add --no-cache maven

COPY pom.xml .
RUN mvn -q -ntp dependency:go-offline

COPY src src
RUN mvn -q -ntp package -DskipTests

# ── Runtime image ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
