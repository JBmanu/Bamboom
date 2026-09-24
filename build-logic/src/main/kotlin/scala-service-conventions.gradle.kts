// build-logic/src/main/kotlin/scala-service-conventions.gradle.kts
//
// Convention plugin per i moduli Scala.
// Il plugin Scala è built-in in Gradle — non serve
// dichiararlo come dipendenza esterna in build-logic.

// build-logic/src/main/kotlin/scala-service-conventions.gradle.kts

plugins {
    scala
    java
}

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(25))
    }
}

tasks.withType<ScalaCompile> {
    scalaCompileOptions.apply {
        additionalParameters = listOf("-feature")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}