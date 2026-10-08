import bamboom.NODE_SERVICE_SCRIPTS
import bamboom.NodeExtension

val node = extensions.create<NodeExtension>("node")
node.workspaceMember.convention(false)

val npmInstall = tasks.register<Exec>("npmInstall") {
    group = "node"
    description = "Installs npm dependencies"
    doFirst {
        val flag = if (node.workspaceMember.get()) " --include-workspace-root" else ""
        commandLine("sh", "-c", "npm install$flag")
    }
}

NODE_SERVICE_SCRIPTS.forEach { script ->
    tasks.register<Exec>(script.taskName) {
        group = script.group
        description = script.description
        commandLine("sh", "-c", script.command)
        if (script.installFirst) dependsOn(npmInstall)
    }
}