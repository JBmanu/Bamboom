# ── STAGE 1: builder ──────────────────────────────────────
FROM eclipse-temurin:25-jdk AS builder

WORKDIR /monorepo

# Copia build-logic — necessario per i convention plugin
COPY build-logic/ ./build-logic/

# Copia il version catalog condiviso
COPY gradle/ ./gradle/

# Copia progress come sotto-cartella
COPY micro-services/progress/ ./micro-services/progress/

WORKDIR /monorepo/micro-services/progress

RUN chmod +x gradlew

# Builda il progetto
RUN ./gradlew :app:build --no-daemon

# ── STAGE 2: runtime ──────────────────────────────────────
FROM eclipse-temurin:25-jre AS runtime

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

COPY --from=builder /monorepo/micro-services/progress/app/build/libs/*.jar ./app.jar

USER appuser

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]