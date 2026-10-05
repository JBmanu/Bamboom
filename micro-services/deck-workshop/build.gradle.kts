plugins {
    id("docker-conventions")
    id("node-conventions")
}

dockerImage {
    imageName = "deck-workshop"
    hostPort = 3003
    containerPort = 3000
}
