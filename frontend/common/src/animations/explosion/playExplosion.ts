import { gsap } from 'gsap'
import type { SparkFlight } from './planSparkFlights'

const POP_SCALE = 1.12
const POP_SECONDS = 0.12
const SETTLE_SECONDS = 0.6
const FLIGHT_SECONDS = 0.9
const FADE_SECONDS = 0.35

export type BurstOptions = {
    delaySeconds: number
    reachScale: number
    onBlastStart: () => void
    onBlastFinish: () => void
}

/**
 * Makes the content pop and throws one spark along each flight.
 * `sparks[i]` follows `flights[i]`. Nothing moves or shows before `delaySeconds` have passed.
 * `onBlastStart` runs when the delay is over, `onBlastFinish` when the last animation ends.
 * @returns a function that stops the animations and removes the styles they set. After it, neither callback runs.
 */
export function playExplosion(
    content: HTMLElement,
    sparks: HTMLElement[],
    flights: SparkFlight[],
    { delaySeconds, reachScale, onBlastStart, onBlastFinish }: BurstOptions
): () => void {
    const animations = gsap.context(() => {
        const reachWidth = content.offsetWidth * reachScale
        const blast = gsap.timeline({ delay: delaySeconds, onStart: onBlastStart, onComplete: onBlastFinish })

        blast
            .to(content, { scale: POP_SCALE, duration: POP_SECONDS, ease: 'power2.out' })
            .to(content, { scale: 1, duration: SETTLE_SECONDS, ease: 'elastic.out(1, 0.4)', clearProps: 'transform' })

        sparks.forEach((spark, index) => {
            const flight = flights[index]!
            blast.fromTo(
                spark,
                { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.4, rotation: 0, opacity: 1 },
                {
                    x: flight.rightShare * reachWidth,
                    y: flight.downShare * reachWidth,
                    scale: 1,
                    rotation: flight.turnDegrees,
                    duration: FLIGHT_SECONDS,
                    immediateRender: false,
                    ease: 'power3.out'
                },
                0
            )
            blast.to(spark, { opacity: 0, duration: FADE_SECONDS }, FLIGHT_SECONDS - FADE_SECONDS)
        })
    })

    return () => animations.revert()
}
