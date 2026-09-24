package com.bamboom.gameobservatory

import java.util.{List => JList}
import scala.jdk.CollectionConverters._

case class GameEvent(
                      gameId: String,
                      playerId: String,
                      eventType: String,
                      timestamp: Long
                    )

class GameObservatory {
  private var events: List[GameEvent] = List.empty

  def recordEvent(event: GameEvent): Unit =
    events = event :: events

  // Ritorna Java List per interoperabilità con Kotlin
  def getEvents(gameId: String): JList[GameEvent] =
    events.filter(_.gameId == gameId).asJava
}