// micro-services/player-identity/build.gradle.kts
//
// Questo file è il punto di ingresso Gradle per player-identity.
// Non compila nulla direttamente — delega tutto a npm.
// In questo modo il servizio è autonomo: si può buildare
// sia dalla root che dalla sua cartella con ./gradlew build.

tasks.register<Exec>("npmInstall") {
    group       = "node"
    description = "Installs npm dependencies"
    commandLine("sh", "-c", "npm install")
}

tasks.register<Exec>("build") {
    group       = "build"
    description = "Builds player-identity via npm"
    commandLine("sh", "-c", "npm run build")
    dependsOn("npmInstall")
}

tasks.register<Exec>("test") {
    group       = "verification"
    description = "Tests player-identity via npm"
    commandLine("sh", "-c", "npm test")
    dependsOn("npmInstall")
}

tasks.register<Exec>("clean") {
    group       = "build"
    description = "Cleans player-identity dist folder"
    commandLine("sh", "-c", "npm run clean")
}

// ── Docker ──
tasks.register<Exec>("dockerBuild") {
    group       = "docker"
    description = "Builds Docker image for player-identity"
    commandLine("sh", "-c", "docker build -t player-identity:latest .")
}

tasks.register<Exec>("dockerRun") {
    group       = "docker"
    description = "Runs player-identity container locally"
    commandLine("sh", "-c", "docker run --rm -p 3000:3000 player-identity:latest")
}