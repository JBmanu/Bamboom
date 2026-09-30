// frontend/player/build.gradle.kts

// -- NODE / BUILD --

tasks.register<Exec>("npmInstall") {
    group       = "node"
    description = "Installs npm dependencies"
    commandLine("sh", "-c", "npm install")
}

tasks.register<Exec>("dev") {
    group       = "node"
    description = "Runs the Vite dev server (port 5173)"
    commandLine("sh", "-c", "npm run dev")
    dependsOn("npmInstall")
}

tasks.register<Exec>("build") {
    group       = "build"
    description = "Builds the player for production (vite build → dist/)"
    commandLine("sh", "-c", "npm run build")
    dependsOn("npmInstall")
}

tasks.register<Exec>("test") {
    group       = "verification"
    description = "Tests the player via Vitest"
    commandLine("sh", "-c", "npm test")
    dependsOn("npmInstall")
}

tasks.register<Exec>("type-check") {
    group       = "verification"
    description = "Type-checks Vue + TypeScript without emitting files (vue-tsc --noEmit)"
    commandLine("sh", "-c", "npm run type-check")
    dependsOn("npmInstall")
}

tasks.register<Exec>("clean") {
    group       = "build"
    description = "Cleans the player dist folder"
    commandLine("sh", "-c", "npm run clean")
}

// -- DOCKER --
tasks.register<Exec>("dockerBuild") {
    group       = "docker"
    description = "Builds the Docker image (use -PimageVersion=X.Y.Z for a specific tag, defaults to 'latest')"
    val version = project.findProperty("imageVersion") ?: "latest"
    commandLine("sh", "-c", "docker build -t player-frontend:$version .")
}
tasks.register<Exec>("dockerRun") {
    group       = "docker"
    description = "Builds and runs player frontend (host 5173 → container 80)"
    commandLine("sh", "-c", "docker run --rm -p 5173:80 player:latest")
    dependsOn("dockerBuild")
}

// -- Eslint + prettier --
tasks.register<Exec>("lint") {
    group       = "verification"
    description = "Lints and checks formatting with Biome"
    commandLine("sh", "-c", "npm run lint")
    dependsOn("npmInstall")
}

tasks.register<Exec>("format") {
    group       = "formatting"
    description = "Formats with ESLint --fix and Prettier --write"
    commandLine("sh", "-c", "npm run format")
    dependsOn("npmInstall")
}