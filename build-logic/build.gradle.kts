// build-logic/build.gradle.kts

plugins {
    `kotlin-dsl`
}

dependencies {
    // Qui il catalog funziona perfettamente
    // Legge la versione da gradle/libs.versions.toml
    val kotlinVersion = libs.versions.kotlin.get()
    val detektVersion = libs.versions.detekt.get()
    val spotlessVersion = libs.versions.spotless.get()
    val scalafixVersion = libs.versions.scalafix.get()
//    val wartremoverVersion = libs.versions.wartremover.get()

    implementation("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    implementation("dev.detekt:dev.detekt.gradle.plugin:$detektVersion")
    implementation("com.diffplug.spotless:com.diffplug.spotless.gradle.plugin:$spotlessVersion")
    implementation("io.github.cosmicsilence.scalafix:io.github.cosmicsilence.scalafix.gradle.plugin:${scalafixVersion}")
//    implementation("cz.augi.gradle.wartremover:cz.augi.gradle.wartremover.gradle.plugin:${wartremoverVersion}")
}
