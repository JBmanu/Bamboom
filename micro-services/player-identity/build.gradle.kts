plugins {
    id("docker-conventions")
    id("node-conventions")
}

dockerImage {
    imageName = "player-identity"
    hostPort = 3001
    containerPort = 3000
}
