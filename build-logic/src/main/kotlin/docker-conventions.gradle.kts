import bamboom.DockerImageExtension

private val extensionName = "dockerImage"
private val groupName = "docker"
private val dockerBuildTaskName = "dockerBuild"
private val dockerRunTaskName = "dockerRun"

val docker = extensions.create<DockerImageExtension>(extensionName)
val imageVersion = providers.gradleProperty("imageVersion").orElse("latest")
docker.buildFromRepoRoot.convention(false)

tasks.register<Exec>(dockerBuildTaskName) {
    group = groupName
    description = "Builds the Docker image (-PimageVersion=X.Y.Z, default 'latest')"
    doFirst {
        val cmd = docker.buildCommand(imageVersion, projectDir)
        workingDir = cmd.workingDir
        commandLine("sh", "-c", cmd.shell)
    }
}

tasks.register<Exec>(dockerRunTaskName) {
    group = groupName
    description = "Builds and runs the image (host port -> container port)"
    dependsOn(dockerBuildTaskName)
    doFirst { commandLine("sh", "-c", docker.runCommand(imageVersion)) }
}