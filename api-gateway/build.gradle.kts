plugins {
    id("docker-conventions")
    id("node-conventions")
}

dockerImage {
    imageName = "api-gateway"
    hostPort = 8000
    containerPort = 8000
}
