import { gsap } from 'gsap'
import type { SparkFlight } from './planSparkFlights'

const POP_SCALE = 1.12
const POP_SECONDS = 0.12
const SETTLE_SECONDS = 0.6
const FLIGHT_SECONDS = 0.9
const FADE_SECONDS = 0.35

/**
 * Makes the content pop and throws one spark along each flight.
 * `sparks[i]` follows `flights[i]`.
 * @returns a function that stops the animations and removes the styles they set.
 */
export function playExplosion(content: HTMLElement, sparks: HTMLElement[], flights: SparkFlight[]): () => void {
    const animations = gsap.context(() => {
        const contentWidth = content.offsetWidth

        gsap.timeline()
            .to(content, { scale: POP_SCALE, duration: POP_SECONDS, ease: 'power2.out' })
            .to(content, { scale: 1, duration: SETTLE_SECONDS, ease: 'elastic.out(1, 0.4)', clearProps: 'transform' })

        sparks.forEach((spark, index) => {
            const flight = flights[index]!
            gsap.fromTo(
                spark,
                { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.4, rotation: 0, opacity: 1 },
                {
                    x: flight.rightShare * contentWidth,
                    y: flight.downShare * contentWidth,
                    scale: 1,
                    rotation: flight.turnDegrees,
                    duration: FLIGHT_SECONDS,
                    ease: 'power3.out'
                }
            )
            gsap.to(spark, { opacity: 0, delay: FLIGHT_SECONDS - FADE_SECONDS, duration: FADE_SECONDS })
        })
    })

    return () => animations.revert()
}
