plugins {
    id("scala-conventions")
}

dependencies {
    implementation("org.scala-lang:scala3-library_3:${libs.versions.scala.get()}")
    testImplementation(libs.scalatest)

}
