# ── STAGE 1: builder ──────────────────────────────────────
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /monorepo
COPY build-logic/ ./build-logic/
COPY gradle/ ./gradle/
COPY micro-services/progress/ ./micro-services/progress/
WORKDIR /monorepo/micro-services/progress
RUN chmod +x gradlew
RUN ./gradlew :app:shadowJar --no-daemon

# ── STAGE 2: runtime ──────────────────────────────────────
FROM eclipse-temurin:25-jre AS runtime
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/* && rm -f /usr/bin/pebble
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app
COPY --from=builder /monorepo/micro-services/progress/app/build/libs/*-all.jar ./app.jar
USER appuser
EXPOSE 3000
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]