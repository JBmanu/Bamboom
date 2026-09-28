
import org.gradle.api.artifacts.VersionCatalogsExtension

// Convention plugin per i moduli Scala.
// Strumenti: Spotless+scalafmt (format), Scalafix (refactoring/lint).

plugins {
    scala
    java
    id("com.diffplug.spotless")
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

val scalafmtVersion = extensions
    .getByType<VersionCatalogsExtension>()
    .named("libs")
    .findVersion("scalafmt")
    .get()
    .requiredVersion

// -- SPOTLESS (scalafmt) --
spotless {
    scala {
        scalafmt(scalafmtVersion).configFile("${rootDir}/.scalafmt.conf")
    }
}

// ── LINT / FORMAT (Spotless + Scalafix insieme) ──
tasks.register("lint") {
    group       = "verification"
    description = "Checks Scala formatting (scalafmt via Spotless)"
    dependsOn("spotlessCheck")
}

tasks.register("format") {
    group       = "formatting"
    description = "Formats Scala code (scalafmt via Spotless)"
    dependsOn("spotlessApply")
}