// api-gateway/build.gradle.kts
//
// Punto di ingresso Gradle per l'API Gateway.
// Delega build a npm/tsc e containerizzazione a Docker.

// ── NODE / BUILD ──────────────────────────────────────────

tasks.register<Exec>("npmInstall") {
    group       = "node"
    description = "Installs npm dependencies"
    commandLine("sh", "-c", "npm install")
}

tasks.register<Exec>("dev") {
    group       = "node"
    description = "Runs the API Gateway in dev mode (port 8000)"
    commandLine("sh", "-c", "npm run dev")
    dependsOn("npmInstall")
}

tasks.register<Exec>("build") {
    group       = "build"
    description = "Builds the API Gateway (tsc → dist/)"
    commandLine("sh", "-c", "npm run build")
    dependsOn("npmInstall")
}

tasks.register<Exec>("test") {
    group       = "verification"
    description = "Tests the API Gateway"
    commandLine("sh", "-c", "npm test")
    dependsOn("npmInstall")
}

tasks.register<Exec>("clean") {
    group       = "build"
    description = "Cleans the API Gateway dist folder"
    commandLine("sh", "-c", "npm run clean")
}

// ── DOCKER ────────────────────────────────────────────────

tasks.register<Exec>("dockerBuild") {
    group       = "docker"
    description = "Builds the Docker image for api-gateway"
    commandLine("sh", "-c", "docker build -t api-gateway:latest .")
}

tasks.register<Exec>("dockerRun") {
    group       = "docker"
    description = "Builds and runs api-gateway (host 8000 → container 8000)"
    commandLine("sh", "-c", "docker run --rm -p 8000:8000 api-gateway:latest")
    dependsOn("dockerBuild")
}