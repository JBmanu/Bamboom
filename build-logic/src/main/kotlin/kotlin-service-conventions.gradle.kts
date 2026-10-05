import dev.detekt.gradle.Detekt

// build-logic/src/main/kotlin/kotlin-service-conventions.gradle.kts

// In cima al blocco, recupera la versione dal catalog.
// Nei precompiled script plugin, il version catalog si accede
// tramite l'extension "libs" del progetto.
val detektVersion = versionCatalogs.named("libs").findVersion("detekt").get().requiredVersion

plugins {
    kotlin("jvm")
    id("dev.detekt")          // NUOVO: applica detekt ai moduli Kotlin
    id("jacoco")
}

repositories {
    mavenCentral()
}

kotlin {
    jvmToolchain(25)
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

// ── DETEKT ──
detekt {
    // buildUponDefaultConfig: parte dalle regole di default di detekt
    // e ci sovrappone le nostre personalizzazioni dal file config
    buildUponDefaultConfig = true

    // allRules = false: non attiva OGNI regola (alcune sono troppo aggressive)
    // teniamo il set ragionevole di default + le nostre
    allRules = true

    // Il file di configurazione con le nostre regole personalizzate.
    // Sta nella root di progress, condiviso da tutti i suoi moduli.
    config.setFrom(files("${rootDir}/config/detekt/detekt.yml"))
}

// Attiva il ruleset di formattazione (ktlint dentro detekt).
// Questo è il pezzo che ti dà ANCHE ktlint (formato) oltre
// all'analisi strutturale di detekt.
dependencies {
    detektPlugins("dev.detekt:detekt-rules-ktlint-wrapper:$detektVersion")
}

// -- LINT + FORMAT (detekt + ktlint-formatting)
// Task "lint" locale al modulo: alias di detekt.
// Ogni modulo Kotlin (app, player-progress) avrà il suo :modulo:lint
tasks.register("lint") {
    group       = "verification"
    description = "Runs detekt on this module"
    dependsOn("detekt")
}
// Task "format" locale al modulo: esegue detekt con auto-correzione.
// Crea una copia del task detekt con autoCorrect abilitato.
// Se viene passato -PautoCorrect, i task detekt correggono invece di verificare.

tasks.register<Detekt>("format") {
    group       = "formatting"
    description = "Runs detekt with auto-correct on this module"
    autoCorrect = true
    setSource(files("src/main/kotlin", "src/test/kotlin"))
    config.setFrom(files("${rootDir}/config/detekt/detekt.yml"))
    buildUponDefaultConfig = true
}

// ── JACOCO (coverage) ──
jacoco {
    toolVersion = "0.8.15"
}

tasks.withType<Test> {
    useJUnitPlatform()
    finalizedBy("jacocoTestReport")
}

tasks.named<JacocoReport>("jacocoTestReport") {
    reports {
        xml.required.set(true)
        html.required.set(false)
    }
}