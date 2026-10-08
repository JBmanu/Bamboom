package bamboom

import org.gradle.api.provider.Property
import org.gradle.api.provider.Provider
import java.io.File

internal data class DockerCommand(val workingDir: File, val shell: String)

abstract class DockerImageExtension {
    abstract val contextDir: Property<String>
    abstract val imageName: Property<String>
    abstract val hostPort: Property<Int>
    abstract val containerPort: Property<Int>
    abstract val buildFromRepoRoot: Property<Boolean>

    private companion object {
        const val DOCKERFILE = "Dockerfile"
        const val DOCKER_BUILD_CMD = "docker build"
        const val DOCKER_RUN_CMD = "docker run"
    }

    private fun reference(version: String) = "${imageName.get()}:$version"

    internal fun buildCommand(version: Provider<String>, projectDir: File): DockerCommand {
        val image = reference(version.get())
        if (contextDir.isPresent) {
            val context = projectDir.resolve(contextDir.get()).normalize()
            val dockerfile = projectDir.resolve(DOCKERFILE).relativeTo(context).path
            return DockerCommand(context, "$DOCKER_BUILD_CMD -t $image -f $dockerfile .")
        }
        if (!buildFromRepoRoot.get()) return DockerCommand(projectDir, "$DOCKER_BUILD_CMD -t $image .")
        val repoRoot = projectDir.parentFile.parentFile
        val dockerfile = "${projectDir.relativeTo(repoRoot).path}/$DOCKERFILE"
        return DockerCommand(repoRoot, "$DOCKER_BUILD_CMD -t $image -f $dockerfile .")
    }

    internal fun runCommand(version: Provider<String>) =
        "$DOCKER_RUN_CMD --rm -p ${hostPort.get()}:${containerPort.get()} ${reference(version.get())}"
}