// Convention plugin per i moduli Scala.
// Strumenti: Spotless+scalafmt (format), Scalafix (refactoring/lint).

val scalafmtVersion = extensions
    .getByType<VersionCatalogsExtension>()
    .named("libs")
    .findVersion("scalafmt")
    .get()
    .requiredVersion

val wartremoverVersion = extensions
    .getByType<VersionCatalogsExtension>()
    .named("libs")
    .findVersion("wartremover")
    .get()
    .requiredVersion

plugins {
    scala
    java
    id("com.diffplug.spotless")
    id("io.github.cosmicsilence.scalafix")
}

// ── WARTREMOVER (come compiler plugin, senza plugin Gradle) ──
dependencies {
    // aggiunge wartremover come plugin del compilatore Scala
    scalaCompilerPlugins("org.wartremover:wartremover_3:$wartremoverVersion")
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

// -- SPOTLESS (scalafmt) --
spotless {
    scala {
        scalafmt(scalafmtVersion).configFile("${rootDir}/.scalafmt.conf")
    }
}

// -- WARTREMOVER (robustezza strutturale) --
// configura i warts come opzioni aggiuntive del compilatore
tasks.withType<ScalaCompile>().configureEach {
    scalaCompileOptions.additionalParameters = listOf(
        "-feature",
        // warts che bloccano la compilazione (errori)
        "-P:wartremover:traverser:org.wartremover.warts.Null",
        "-P:wartremover:traverser:org.wartremover.warts.Throw",
        "-P:wartremover:traverser:org.wartremover.warts.Return",
        "-P:wartremover:traverser:org.wartremover.warts.Var",
        "-P:wartremover:traverser:org.wartremover.warts.AsInstanceOf",
        "-P:wartremover:traverser:org.wartremover.warts.IsInstanceOf",
        "-P:wartremover:traverser:org.wartremover.warts.OptionPartial",
        "-P:wartremover:traverser:org.wartremover.warts.TryPartial"
    )
}

// -- LINT / FORMAT --
tasks.register("lint") {
    group       = "verification"
    description = "Checks Scala: formatting (Spotless/scalafmt) + linting (Scalafix) + WartRemover (via compile)"
    dependsOn("spotlessCheck", "checkScalafix", "compileScala")
}

tasks.register("format") {
    group       = "formatting"
    description = "Formats Scala: Spotless (scalafmt) + Scalafix auto-fix. WartRemover requires manual fix."
    dependsOn("spotlessApply", "scalafix")
}
