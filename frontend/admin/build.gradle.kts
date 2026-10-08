plugins {
    id("docker-conventions")
    id("node-conventions")
}

node {
    workspaceMember = true
}

dockerImage {
    dockerfile = "Dockerfile"
    buildArgs.put("APP", "admin")
    contextDir = ".."
    imageName = "admin-frontend"
    hostPort = 5174
    containerPort = 80
}
