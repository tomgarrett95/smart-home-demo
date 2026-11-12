import { env } from './env'
import { createApp } from './app'
import { db } from './db/client'

const app = createApp()

const server = app.listen(env.PORT, (error) => {
    if (error) throw error
    console.log(`API listening on http://localhost:${env.PORT}`)
})

function shutdown(signal: string) {
    console.log(`${signal} received, shutting down`)
    server.close(async () => {
        await db.destroy()
        process.exit(0)
    })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
