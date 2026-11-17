rootProject.name = "progress"

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

pluginManagement {
    includeBuild("../../build-logic")
}

plugins {
    // A missing JDK is downloaded from the foojay catalogue instead of failing the build.
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

include("player-progress")
include("game-observatory")
include("app")