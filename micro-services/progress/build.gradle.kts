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
    description = "Builds and runs the progress host on port 8080 and container on port 8080"
    commandLine("sh", "-c", "docker run --rm -p 8080:8080 progress:latest")
    dependsOn("dockerBuild")
}