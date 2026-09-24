// micro-services/progress/player-progress/build.gradle.kts
//
// Modulo Kotlin — bounded context player-progress.
// È una LIBRERIA: non ha un main, non produce
// un eseguibile. Viene consumato dal modulo app.

plugins {
    id("kotlin-service-conventions")
}

group   = "com.bamboom"
version = "0.1.0"

dependencies {
    implementation(libs.bundles.kotlin.base)
    implementation(libs.logback.classic)
    testImplementation(libs.junit.jupiter)
}