// micro-services/progress/app/build.gradle.kts
//
// Modulo assembly: dipende da player-progress e game-observatory
// ed è l'unico modulo con un main eseguibile.
// Produce il JAR finale che va nel container Docker.

plugins {
    id("kotlin-service-conventions")
    application
    alias(libs.plugins.shadow)
}

group   = "com.bamboom"
version = "0.1.0"

dependencies {
    // Dipende dai due bounded context interni
    implementation(project(":player-progress"))
    implementation(project(":game-observatory"))

    // Dipendenze proprie
    implementation(libs.bundles.kotlin.base)
    implementation(libs.logback.classic)

    testImplementation(libs.junit.jupiter)
}

application {
    mainClass.set("com.bamboom.progress.MainKt")
}

tasks.shadowJar {
    // Unisce i file di servizio (META-INF/services) correttamente
    mergeServiceFiles()
}