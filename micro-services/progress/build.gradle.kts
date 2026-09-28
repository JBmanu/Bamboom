// micro-services/progress/build.gradle.kts
//
// File ROOT di progress. NON compila codice: contiene solo
// la configurazione comune ai 3 moduli interni
// (player-progress, game-observatory, app) e i task Docker.

plugins {
    id("kotlin-service-conventions") apply false
    id("scala-service-conventions")  apply false
}


// Configurazione applicata a TUTTI i sotto-moduli
subprojects {
    repositories {
        mavenCentral()
    }
}

// -- TEST aggregato: tutti i moduli
tasks.register("test") {
    group       = "verification"
    description = "Runs tests on all modules"
    dependsOn(
        subprojects
            .filter { it.tasks.findByName("test") != null }
            .map { "${it.path}:test" }
    )
}

// -- DOCKER --
tasks.register<Exec>("dockerBuild") {
    group       = "docker"
    description = "Builds the Docker image for progress (fat JAR JVM)"
    workingDir  = rootDir.parentFile.parentFile
    commandLine("sh", "-c",
        "docker build -t progress:latest -f micro-services/progress/Dockerfile .")
}

tasks.register<Exec>("dockerRun") {
    group       = "docker"
    description = "Builds and runs the progress (host 3005 → container 3000)"
    commandLine("sh", "-c", "docker run --rm -p 3005:8080 progress:latest")
    dependsOn("dockerBuild")
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