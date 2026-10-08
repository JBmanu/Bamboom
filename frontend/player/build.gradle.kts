plugins {
    id("docker-conventions")
    id("node-conventions")
}

node {
    workspaceMember = true
}

dockerImage {
    dockerfile = "Dockerfile"
    buildArgs.put("APP", "player")
    contextDir = ".."
    imageName = "player-frontend"
    hostPort = 5173
    containerPort = 80
}
