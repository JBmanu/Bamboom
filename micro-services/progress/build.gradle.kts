import org.gradle.kotlin.dsl.apply

plugins {
    id("docker-conventions")
    id("kotlin-conventions") apply false
    id("scala-conventions")  apply false
}

subprojects {
    repositories {
        mavenCentral()
    }
}

dockerImage {
    imageName = "progress"
    hostPort = 3005
    containerPort = 3000
    buildFromRepoRoot = true
}

tasks.register("test") {
    group       = "verification"
    description = "Runs tests on all modules"
    dependsOn(
        subprojects
            .filter { it.tasks.findByName("test") != null }
            .map { "${it.path}:test" }
    )
}

// -- LINT / FORMAT aggregato: tutti i moduli che hanno il task lint/format --
tasks.register("lint") {
    group       = "verification"
    description = "Runs lint on all modules (Kotlin: detekt, Scala: Spotless(scalafmt)+Scalafix+WartRemover)"
    dependsOn(
        subprojects
            .filter { subproject ->
                subproject.tasks.findByName("lint") != null
            }
            .map { "${it.path}:lint" }
    )
}

tasks.register("format") {
    group       = "formatting"
    description = "Formats all modules (Kotlin: detekt auto-correct, Scala: Spotless(scalafmt)+Scalafix)"
    dependsOn(
        subprojects
            .filter { subproject ->
                subproject.tasks.findByName("format") != null
            }
            .map { "${it.path}:format" }
    )
}

tasks.register("shadowJar") {
    group       = "build"
    description = "Builds the fat JAR (delegates to :app:shadowJar)"
    dependsOn(":app:shadowJar")
}