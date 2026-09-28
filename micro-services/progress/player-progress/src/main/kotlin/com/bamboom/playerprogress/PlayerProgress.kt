package com.bamboom.playerprogress

class PlayerProgress(val playerId: String, val level: Int, val experience: Long) {
    fun gainExperience(amount: Long): PlayerProgress = PlayerProgress(playerId, level, experience + amount)
}
