rootProject.name = "Bamboom"

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
