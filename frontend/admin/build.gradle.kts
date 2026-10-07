plugins {
    id("docker-conventions")
    id("node-conventions")
}

dockerImage {
    imageName = "admin-frontend"
    hostPort = 5174
    containerPort = 80
}
