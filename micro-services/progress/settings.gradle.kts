// micro-services/progress/settings.gradle.kts
//
// Questo file fa tre cose:
// 1. Dà il nome a questa build indipendente
// 2. Punta al version catalog condiviso nella root
// 3. Include build-logic per i convention plugin
// 4. Dichiara i 3 moduli interni con include()
//    (multi-project INTERNO a progress)

rootProject.name = "progress"

// Legge il version catalog dalla root del monorepo.
// "../../gradle/libs.versions.toml" risale da
// micro-services/progress/ fino a Bamboom/
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
    versionCatalogs {
        create("libs") {
            from(files("../../gradle/libs.versions.toml"))
        }
    }
}

// Include build-logic per usare i convention plugin
// (kotlin-service-conventions, ecc.)
includeBuild("../../build-logic")

// include() — NON includeBuild() — perché questi 3
// sono moduli della STESSA build, non build separate.
// Producono UN solo JAR/container alla fine.
include("player-progress")
include("game-observatory")
include("app")