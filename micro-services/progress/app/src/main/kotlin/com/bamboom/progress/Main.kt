package com.bamboom.progress

import com.bamboom.gameobservatory.GameEvent
import com.bamboom.gameobservatory.GameObservatory
import com.bamboom.playerprogress.PlayerProgress

fun main() {
    // player-progress
    val progress =
        PlayerProgress(
            "player-1",
            1,
            0L,
        )
    val updated = progress.gainExperience(100L)
    println("Player ${updated.playerId} — level ${updated.level} — XP ${updated.experience}")

    // game-observatory
    val observatory = GameObservatory()
    observatory.recordEvent(
        GameEvent(
            "game-1",
            "player-1",
            "MATCH_COMPLETED",
            System.currentTimeMillis(),
        ),
    )
    val events = observatory.getEvents("game-1")
    println("Recorded ${events.size} event(s) for game-1")

    println("progress service up and running")
}
