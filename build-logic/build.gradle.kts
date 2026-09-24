// build-logic/build.gradle.kts

plugins {
    `kotlin-dsl`
}

dependencies {
    // Qui il catalog funziona perfettamente
    // Legge la versione da gradle/libs.versions.toml
    val kotlinVersion = libs.versions.kotlin.get()
    implementation("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
}