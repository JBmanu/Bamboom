plugins {
    id("docker-conventions")
}

dockerImage {
    imageName = "api-gateway"
    hostPort = 8000
    containerPort = 8000
}

// -- NODE / BUILD --
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

tasks.register<Exec>("type-check") {
    group       = "verification"
    description = "Type-checks TypeScript without emitting files (tsc --noEmit)"
    commandLine("sh", "-c", "npm run type-check")
    dependsOn("npmInstall")
}

tasks.register<Exec>("clean") {
    group       = "build"
    description = "Cleans the API Gateway dist folder"
    commandLine("sh", "-c", "npm run clean")
}

// -- BIOME --
tasks.register<Exec>("lint") {
    group       = "verification"
    description = "Lints and checks formatting with Biome"
    commandLine("sh", "-c", "npm run lint")
    dependsOn("npmInstall")
}

tasks.register<Exec>("format") {
    group       = "formatting"
    description = "Formats and auto-fixes with Biome"
    commandLine("sh", "-c", "npm run format")
    dependsOn("npmInstall")
}