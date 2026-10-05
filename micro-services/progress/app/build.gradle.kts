plugins {
    application
    alias(libs.plugins.shadow)
    id("kotlin-service-conventions")
}

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