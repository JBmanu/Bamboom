plugins {
    id("kotlin-conventions")
}

dependencies {
    implementation(libs.bundles.kotlin.base)
    implementation(libs.logback.classic)
    testImplementation(libs.junit.jupiter)
}