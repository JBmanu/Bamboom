import bamboom.NODE_SERVICE_SCRIPTS

val npmInstall = tasks.register<Exec>("npmInstall") {
    group = "node"
    description = "Installs npm dependencies"
    commandLine("sh", "-c", "npm install")
}

// Un task per ogni script del contratto: stessi nomi, gruppi e dipendenze di prima
NODE_SERVICE_SCRIPTS.forEach { script ->
    tasks.register<Exec>(script.taskName) {
        group = script.group
        description = script.description
        commandLine("sh", "-c", script.command)
        if (script.installFirst) dependsOn(npmInstall)
    }
}