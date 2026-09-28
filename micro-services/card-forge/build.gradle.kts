tasks.register<Exec>("npmInstall") {
    group       = "node"
    description = "Installs npm dependencies"
    commandLine("sh", "-c", "npm install")
}

tasks.register<Exec>("build") {
    group       = "build"
    description = "Builds card-forge via npm"
    commandLine("sh", "-c", "npm run build")
    dependsOn("npmInstall")
}

tasks.register<Exec>("test") {
    group       = "verification"
    description = "Tests card-forge via npm"
    commandLine("sh", "-c", "npm test")
    dependsOn("npmInstall")
}

tasks.register<Exec>("clean") {
    group       = "build"
    description = "Cleans card-forge dist folder"
    commandLine("sh", "-c", "npm run clean")
}

// -- DOCKER --
tasks.register<Exec>("dockerBuild") {
    group = "docker"
    description = "Builds the Docker image for card-forge"
    commandLine("sh", "-c", "docker build -t card-forge:latest .")
}

tasks.register<Exec>("dockerRun") {
    group = "docker"
    description = "Runs the card-forge (host 3004 → container 3000)"
    commandLine("sh", "-c", "docker run --rm -p 3004:3000 card-forge:latest")
    dependsOn("dockerBuild")
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