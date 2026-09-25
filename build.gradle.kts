// build.gradle.kts (ROOT)
//
// La root non compila nulla di suo.
// Il suo unico scopo è orchestrare le build
// dei servizi tramite task che delegano
// alle build incluse con gradle.includedBuild().

// -- task aggregatori --
// Raggruppano tutti i servizi in un unico comando.
// Quando aggiungeremo progress (JVM) aggiungeremo
// il suo dependsOn qui.

tasks.register("installAll") {
    group       = "orchestration"
    description = "Installs dependencies for all services"
    dependsOn(
        "installWebApp",
        "installApiGateway",
        "installPlayerIdentity",
        "installLobbyMatch",
        "installDeckWorkshop",
        "installCardForge",
    )
}

tasks.register("buildAll") {
    group       = "orchestration"
    description = "Builds all services"
    dependsOn(
        "buildWebApp",
        "buildApiGateway",
        "buildPlayerIdentity",
        "buildLobbyMatch",
        "buildDeckWorkshop",
        "buildCardForge",
        "buildProgress"
    )
}

tasks.register("testAll") {
    group       = "orchestration"
    description = "Tests all services"
    dependsOn(
        "testWebApp",
        "testApiGateway",
        "testPlayerIdentity",
        "testLobbyMatch",
        "testDeckWorkshop",
        "testCardForge",
        "testProgress"
    )
}

// -- web-app (frontend) --
tasks.register("installWebApp") {
    group       = "orchestration"
    description = "Installs dependencies for web-app"
    dependsOn(gradle.includedBuild("web-app").task(":npmInstall"))
}

tasks.register("buildWebApp") {
    group       = "orchestration"
    description = "Builds web-app"
    dependsOn(gradle.includedBuild("web-app").task(":build"))
}

tasks.register("testWebApp") {
    group       = "orchestration"
    description = "Tests web-app"
    dependsOn(gradle.includedBuild("web-app").task(":test"))
}

// -- api-gateway --
tasks.register("installApiGateway") {
    group       = "orchestration"
    description = "Installs dependencies for api-gateway"
    dependsOn(gradle.includedBuild("api-gateway").task(":npmInstall"))
}

tasks.register("buildApiGateway") {
    group       = "orchestration"
    description = "Builds api-gateway"
    dependsOn(gradle.includedBuild("api-gateway").task(":build"))
}

tasks.register("testApiGateway") {
    group       = "orchestration"
    description = "Tests api-gateway"
    dependsOn(gradle.includedBuild("api-gateway").task(":test"))
}

// -- player-identity --
tasks.register("installPlayerIdentity") {
    group       = "orchestration"
    description = "Installs npm dependencies for player-identity"
    dependsOn(gradle.includedBuild("player-identity").task(":npmInstall"))
}

tasks.register("buildPlayerIdentity") {
    group       = "orchestration"
    description = "Builds player-identity"
    dependsOn(gradle.includedBuild("player-identity").task(":build"))
}

tasks.register("testPlayerIdentity") {
    group       = "orchestration"
    description = "Tests player-identity"
    dependsOn(gradle.includedBuild("player-identity").task(":test"))
}

// -- lobby-match --
tasks.register("installLobbyMatch") {
    group       = "orchestration"
    description = "Installs npm dependencies for lobby-match"
    dependsOn(gradle.includedBuild("lobby-match").task(":npmInstall"))
}

tasks.register("buildLobbyMatch") {
    group       = "orchestration"
    description = "Builds lobby-match"
    dependsOn(gradle.includedBuild("lobby-match").task(":build"))
}

tasks.register("testLobbyMatch") {
    group       = "orchestration"
    description = "Tests lobby-match"
    dependsOn(gradle.includedBuild("lobby-match").task(":test"))
}

// -- deck-workshop --
tasks.register("installDeckWorkshop") {
    group       = "orchestration"
    description = "Installs npm dependencies for deck-workshop"
    dependsOn(gradle.includedBuild("deck-workshop").task(":npmInstall"))
}

tasks.register("buildDeckWorkshop") {
    group       = "orchestration"
    description = "Builds deck-workshop"
    dependsOn(gradle.includedBuild("deck-workshop").task(":build"))
}

tasks.register("testDeckWorkshop") {
    group       = "orchestration"
    description = "Tests deck-workshop"
    dependsOn(gradle.includedBuild("deck-workshop").task(":test"))
}

// -- card-forge --
tasks.register("installCardForge") {
    group       = "orchestration"
    description = "Installs npm dependencies for card-forge"
    dependsOn(gradle.includedBuild("card-forge").task(":npmInstall"))
}

tasks.register("buildCardForge") {
    group       = "orchestration"
    description = "Builds card-forge"
    dependsOn(gradle.includedBuild("card-forge").task(":build"))
}

tasks.register("testCardForge") {
    group       = "orchestration"
    description = "Tests card-forge"
    dependsOn(gradle.includedBuild("card-forge").task(":test"))
}

// -- progress --
tasks.register("buildProgress") {
    group       = "orchestration"
    description = "Builds progress service (Kotlin + Scala)"
    dependsOn(gradle.includedBuild("progress").task(":app:build"))
}

tasks.register("testProgress") {
    group       = "orchestration"
    description = "Tests progress service"
    dependsOn(gradle.includedBuild("progress").task(":app:test"))
}

// -- DOCKER COMPOSE (sviluppo locale) --
tasks.register<Exec>("composeBuild") {
    group       = "docker compose"
    description = "Builds all service images via docker compose"
    commandLine("sh", "-c", "docker compose build")
}

tasks.register<Exec>("composeUp") {
    group       = "docker compose"
    description = "Starts all services via docker compose (foreground)"
    commandLine("sh", "-c", "docker compose up")
}

tasks.register<Exec>("composeUpDetached") {
    group       = "docker compose"
    description = "Starts all services via docker compose (background)"
    commandLine("sh", "-c", "docker compose up -d")
}

tasks.register<Exec>("composeDown") {
    group       = "docker compose"
    description = "Stops and removes all services via docker compose"
    commandLine("sh", "-c", "docker compose down")
}

tasks.register<Exec>("composeLogs") {
    group       = "docker compose"
    description = "Shows logs from all services"
    commandLine("sh", "-c", "docker compose logs -f")
}