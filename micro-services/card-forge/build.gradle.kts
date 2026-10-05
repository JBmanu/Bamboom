plugins {
    id("docker-conventions")
    id("node-conventions")
}

dockerImage {
    imageName = "card-forge"
    hostPort = 3004
    containerPort = 3000
}
