import express from 'express'
import { sql } from 'kysely'
import { db } from './db/client'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { devicesRouter } from './routes/devices'
import { roomsRouter } from './routes/rooms'

export function createApp() {
    const app = express()

    app.disable('x-powered-by')
    app.use(express.json({ limit: '10kb' }))

    app.get('/api/health', async (_req, res) => {
        try {
            await sql`select 1`.execute(db)
            res.json({ status: 'ok' })
        } catch {
            res.status(503).json({ status: 'unavailable' })
        }
    })

    app.use('/api/rooms', roomsRouter)
    app.use('/api/devices', devicesRouter)

    app.use(notFoundHandler)
    app.use(errorHandler)

    return app
}
