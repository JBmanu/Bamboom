plugins {
    id("scala-service-conventions")
}

dependencies {
    implementation("org.scala-lang:scala3-library_3:${libs.versions.scala.get()}")
    testImplementation(libs.scalatest)

}
