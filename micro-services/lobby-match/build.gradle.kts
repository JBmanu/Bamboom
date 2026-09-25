tasks.register<Exec>("npmInstall") {
    group = "node"
    description = "Installs npm dependencies"
    commandLine("sh", "-c", "npm install")
}

tasks.register<Exec>("build") {
    group = "build"
    description = "Builds lobby-match via npm"
    commandLine("sh", "-c", "npm run build")
    dependsOn("npmInstall")
}

tasks.register<Exec>("test") {
    group = "verification"
    description = "Tests lobby-match via npm"
    commandLine("sh", "-c", "npm test")
    dependsOn("npmInstall")
}

tasks.register<Exec>("clean") {
    group = "build"
    description = "Cleans lobby-match dist folder"
    commandLine("sh", "-c", "npm run clean")
}

// -- DOCKER --
tasks.register<Exec>("dockerBuild") {
    group = "docker"
    description = "Builds the Docker image for lobby-match"
    commandLine("sh", "-c", "docker build -t lobby-match:latest .")
}

tasks.register<Exec>("dockerRun") {
    group = "docker"
    description = "Runs the lobby-match (host 3002 → container 3000)"
    commandLine("sh", "-c", "docker run --rm -p 3002:3000 lobby-match:latest")
    dependsOn("dockerBuild")
}