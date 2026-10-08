package bamboom

import org.gradle.api.provider.MapProperty
import org.gradle.api.provider.Property
import org.gradle.api.provider.Provider
import java.io.File

internal data class DockerCommand(val workingDir: File, val shell: String)

abstract class DockerImageExtension {
    abstract val buildArgs: MapProperty<String, String>
    abstract val dockerfile: Property<String>
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

    private fun buildArgFlags() =
        buildArgs.get().entries.joinToString("") { " --build-arg ${it.key}=${it.value}" }

    internal fun buildCommand(version: Provider<String>, projectDir: File): DockerCommand {
        val image = reference(version.get())
        val args = buildArgFlags()
        if (contextDir.isPresent) {
            val context = projectDir.resolve(contextDir.get()).normalize()
            val dockerfilePath = if (dockerfile.isPresent) dockerfile.get()
            else projectDir.resolve(DOCKERFILE).relativeTo(context).path
            return DockerCommand(context, "$DOCKER_BUILD_CMD -t $image -f $dockerfilePath$args .")
        }
        if (!buildFromRepoRoot.get()) return DockerCommand(projectDir, "$DOCKER_BUILD_CMD -t $image$args .")
        val repoRoot = projectDir.parentFile.parentFile
        val dockerfile = "${projectDir.relativeTo(repoRoot).path}/$DOCKERFILE"
        return DockerCommand(repoRoot, "$DOCKER_BUILD_CMD -t $image -f $dockerfile$args .")
    }

    internal fun runCommand(version: Provider<String>) =
        "$DOCKER_RUN_CMD --rm -p ${hostPort.get()}:${containerPort.get()} ${reference(version.get())}"
}