// build-logic/src/main/kotlin/kotlin-service-conventions.gradle.kts

plugins {
    // NON usiamo alias() qui — limitazione Gradle
    // La versione viene dalla dipendenza in build-logic/build.gradle.kts
    kotlin("jvm")
}

repositories {
    mavenCentral()
}

kotlin {
    jvmToolchain(25)
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}