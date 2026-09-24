// micro-services/progress/game-observatory/build.gradle.kts
//
// Modulo Scala — bounded context game-observatory.
// È una LIBRERIA: non ha un main, non produce
// un eseguibile. Viene consumato dal modulo app.

plugins {
    id("scala-service-conventions")
}

group   = "com.bamboom"
version = "0.1.0"

dependencies {
    implementation(libs.bundles.scala.base)
    testImplementation(libs.scalatest)
}