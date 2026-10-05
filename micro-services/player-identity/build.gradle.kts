plugins {
    id("docker-conventions")
}

dockerImage {
    imageName = "player-identity"
    hostPort = 3001
    containerPort = 3000
}

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

tasks.register<Exec>("type-check") {
    group       = "verification"
    description = "Type-checks TypeScript without emitting files (tsc --noEmit)"
    commandLine("sh", "-c", "npm run type-check")
    dependsOn("npmInstall")
}

tasks.register<Exec>("clean") {
    group       = "build"
    description = "Cleans player-identity dist folder"
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