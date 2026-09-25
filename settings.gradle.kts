// settings.gradle.kts (ROOT)
//
// Questo file ha due responsabilità:
// 1. Dare un nome al progetto root
// 2. Dichiarare quali build indipendenti fanno parte
//    di questo composite build (includeBuild)
//
// NON usa include() — quello è per i multi-project build.
// includeBuild() include build COMPLETE e INDIPENDENTI.

rootProject.name = "Bamboom"

// build-logic SEMPRE per prima
includeBuild("build-logic")

// Frontend
includeBuild("frontend/web-app")

// Servizi TypeScript
includeBuild("micro-services/player-identity")
includeBuild("micro-services/lobby-match")
includeBuild("micro-services/deck-workshop")
includeBuild("micro-services/card-forge")

// Servizi JVM
includeBuild("micro-services/progress")
