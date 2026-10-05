plugins {
    id("docker-conventions")
    id("node-conventions")
}

dockerImage {
    imageName = "lobby-match"
    hostPort = 3002
    containerPort = 3000
}
