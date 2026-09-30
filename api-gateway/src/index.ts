// api-gateway/src/index.ts
//
// API Gateway: unico punto di ingresso.
// Riceve tutte le richieste del frontend su /api/*
// e le inoltra al microservizio corretto in base al path.

import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()
const PORT = process.env.PORT || 8000

// Mappa dei servizi: path → indirizzo del microservizio.
// In sviluppo locale usiamo localhost + porta host.
// In Docker questi diventeranno i nomi dei container
// (es. http://player-identity:3000) — lo gestiremo
// con variabili d'ambiente.
const services = {
    '/api/players': process.env.PLAYER_IDENTITY_URL || 'http://localhost:3001',
    '/api/lobby': process.env.LOBBY_MATCH_URL || 'http://localhost:3002',
    '/api/decks': process.env.DECK_WORKSHOP_URL || 'http://localhost:3003',
    '/api/cards': process.env.CARD_FORGE_URL || 'http://localhost:3004',
    '/api/progress': process.env.PROGRESS_URL || 'http://localhost:3005', // ← era 8080
}

// Health check: utile per verificare che il gateway sia vivo
// (lo useremo anche in Kubernetes per il readiness probe)
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' })
})

// Registra un proxy per ogni servizio
for (const [path, target] of Object.entries(services)) {
    app.use(
        path,
        createProxyMiddleware({
            target,
            changeOrigin: true,
        }),
    )
    console.log(`Routing ${path}/* → ${target}`)
}

app.listen(PORT, () => {
    console.log(`API Gateway up and running on port ${PORT}`)
})
// test: trigger release-please for ghcr.io validation
// test: verify release-please and ghcr.io flow after OWNER_LC fix
