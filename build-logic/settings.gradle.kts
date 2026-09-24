// build-logic/settings.gradle.kts
//
// build-logic è essa stessa una build Gradle indipendente,
// inclusa nella root come qualsiasi altro servizio.
// Ha quindi il suo settings.gradle.kts.

rootProject.name = "build-logic"

// Qui diciamo a build-logic dove trovare le dipendenze
// e, soprattutto, dove trovare il version catalog condiviso.
//
// dependencyResolutionManagement configura la risoluzione
// delle dipendenze per QUESTA build (build-logic stessa).
// "../gradle/libs.versions.toml" risale di un livello
// dalla cartella build-logic/ alla root del monorepo.

dependencyResolutionManagement {
    repositories {
        gradlePluginPortal()  // necessario per scaricare plugin Gradle
        mavenCentral()
    }
    versionCatalogs {
        create("libs") {
            from(files("../gradle/libs.versions.toml"))
        }
    }
}