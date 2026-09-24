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