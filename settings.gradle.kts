rootProject.name = "Bamboom"

plugins {
    // A missing JDK is downloaded from the foojay catalogue instead of failing the build.
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

// build-logic SEMPRE per prima
includeBuild("build-logic")

// Frontend
includeBuild("frontend/common")
includeBuild("frontend/admin")
includeBuild("frontend/player")

// API Gateway
includeBuild("api-gateway")

// Servizi TypeScript
includeBuild("micro-services/player-identity")
includeBuild("micro-services/lobby-match")
includeBuild("micro-services/deck-workshop")
includeBuild("micro-services/card-forge")

// Servizi JVM
includeBuild("micro-services/progress")
