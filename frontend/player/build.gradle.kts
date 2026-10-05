plugins {
    id("docker-conventions")
    id("node-conventions")
}

dockerImage {
    imageName = "player-frontend"
    hostPort = 5173
    containerPort = 80
}
