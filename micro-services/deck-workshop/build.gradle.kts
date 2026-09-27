tasks.register<Exec>("npmInstall") {
    group       = "node"
    description = "Installs npm dependencies"
    commandLine("sh", "-c", "npm install")
}

tasks.register<Exec>("build") {
    group       = "build"
    description = "Builds deck-workshop via npm"
    commandLine("sh", "-c", "npm run build")
    dependsOn("npmInstall")
}

tasks.register<Exec>("test") {
    group       = "verification"
    description = "Tests deck-workshop via npm"
    commandLine("sh", "-c", "npm test")
    dependsOn("npmInstall")
}

tasks.register<Exec>("clean") {
    group       = "build"
    description = "Cleans deck-workshop dist folder"
    commandLine("sh", "-c", "npm run clean")
}

// -- DOCKER --
tasks.register<Exec>("dockerBuild") {
    group = "docker"
    description = "Builds the Docker image for deck-workshop"
    commandLine("sh", "-c", "docker build -t deck-workshop:latest .")
}

tasks.register<Exec>("dockerRun") {
    group = "docker"
    description = "Runs the deck-workshop (host 3003 → container 3000)"
    commandLine("sh", "-c", "docker run --rm -p 3003:3000 deck-workshop:latest")
    dependsOn("dockerBuild")
}

// -- BIOME --
tasks.register<Exec>("lint") {
    group       = "verification"
    description = "Lints and checks formatting with Biome"
    commandLine("sh", "-c", "npm run lint")
    dependsOn("npmInstall")
}