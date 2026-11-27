export type SparkShape = 'ember' | 'leaf'

/** Where one spark ends its flight. Distances are shares of the content width, so the burst grows with the content. */
export type SparkFlight = {
    shape: SparkShape
    rightShare: number
    downShare: number
    turnDegrees: number
}

const LONG_REACH = 0.42
const SHORT_REACH = 0.3
const VERTICAL_SQUASH = 0.6
const LEAF_EVERY = 3
const TURN_STEP_DEGREES = 80

/** Spreads the sparks all around the blast. No randomness: the burst looks the same every time and can be tuned. */
export function planSparkFlights(sparkCount: number): SparkFlight[] {
    return Array.from({ length: sparkCount }, (_, index) => {
        const angle = (index / sparkCount) * 2 * Math.PI
        const reach = index % 2 === 0 ? LONG_REACH : SHORT_REACH
        return {
            shape: index % LEAF_EVERY === 0 ? 'leaf' : 'ember',
            rightShare: Math.cos(angle) * reach,
            downShare: Math.sin(angle) * reach * VERTICAL_SQUASH,
            turnDegrees: (index % 2 === 0 ? 1 : -1) * TURN_STEP_DEGREES * (1 + (index % LEAF_EVERY))
        }
    })
}
