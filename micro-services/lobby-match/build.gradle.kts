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

tasks.register<Exec>("type-check") {
    group       = "verification"
    description = "Type-checks TypeScript without emitting files (tsc --noEmit)"
    commandLine("sh", "-c", "npm run type-check")
    dependsOn("npmInstall")
}

tasks.register<Exec>("clean") {
    group = "build"
    description = "Cleans lobby-match dist folder"
    commandLine("sh", "-c", "npm run clean")
}

// -- DOCKER --
tasks.register<Exec>("dockerBuild") {
    group       = "docker"
    description = "Builds the Docker image (use -PimageVersion=X.Y.Z for a specific tag, defaults to 'latest')"
    val version = project.findProperty("imageVersion") ?: "latest"
    commandLine("sh", "-c", "docker build -t lobby-match:$version .")
}

tasks.register<Exec>("dockerRun") {
    group = "docker"
    description = "Runs the lobby-match (host 3002 → container 3000)"
    commandLine("sh", "-c", "docker run --rm -p 3002:3000 lobby-match:latest")
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