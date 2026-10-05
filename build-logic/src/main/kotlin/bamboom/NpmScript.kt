package bamboom

// Un task Gradle che lancia un comando npm nella cartella del servizio.
internal data class NpmScript(
    val taskName: String,
    val group: String,
    val description: String,
    val command: String,
    // clean non ha bisogno delle dipendenze installate
    val installFirst: Boolean = true,
)

private const val NODE_CMD = "npm"

private const val NODE_GROUP = "node"
private const val BUILD_GROUP = "build"
private const val VERIFICATION_GROUP = "verification"
private const val FORMATTING_GROUP = "formatting"

internal val NODE_SERVICE_SCRIPTS = listOf(
    NpmScript("build", BUILD_GROUP, "Builds the service (npm run build)",
        "$NODE_CMD run build"),
    NpmScript("dev", NODE_GROUP, "Runs the dev server (npm run dev)",
        "$NODE_CMD run dev"),
    NpmScript("test", VERIFICATION_GROUP, "Runs the tests (npm test)",
        "$NODE_CMD test"),
    NpmScript("type-check", VERIFICATION_GROUP, "Type-checks without emitting files (npm run type-check)",
        "$NODE_CMD run type-check"),
    NpmScript("lint", VERIFICATION_GROUP, "Lints and checks formatting (npm run lint)",
        "$NODE_CMD run lint"),
    NpmScript("format", FORMATTING_GROUP, "Formats and auto-fixes (npm run format)",
        "$NODE_CMD run format"),
    NpmScript("clean", BUILD_GROUP, "Removes the dist folder (npm run clean)",
        "$NODE_CMD run clean", installFirst = false)
)