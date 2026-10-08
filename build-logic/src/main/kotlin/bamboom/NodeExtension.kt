package bamboom

import org.gradle.api.provider.Property

abstract class NodeExtension {
    abstract val workspaceMember: Property<Boolean>
}