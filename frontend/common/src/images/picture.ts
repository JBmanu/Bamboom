export interface Picture {
    sources: Record<string, string>
    img: { src: string; w: number; h: number }
}
