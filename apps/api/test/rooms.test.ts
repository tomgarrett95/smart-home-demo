import { RoomSummarySchema } from '@smart-home/packages/rooms'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { db } from '../src/db/client'
import { insertDevice, insertRoom, resetDatabase } from './helpers'

const app = createApp()

beforeEach(resetDatabase)

describe('GET /api/rooms', () => {
    it('returns an empty array when there are no rooms', async () => {
        const res = await request(app).get('/api/rooms')

        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })

    it('returns rooms sorted by name, with a device count for each', async () => {
        const kitchen = await insertRoom('Kitchen')
        const bedroom = await insertRoom('Bedroom')
        await insertDevice({ name: 'Kettle', room_id: kitchen.id })
        await insertDevice({ name: 'Pendant', room_id: kitchen.id })
        await insertDevice({ name: 'Lamp', room_id: bedroom.id })

        const res = await request(app).get('/api/rooms')

        expect(res.status).toBe(200)
        expect(res.body).toEqual([
            { id: bedroom.id, name: 'Bedroom', deviceCount: 1 },
            { id: kitchen.id, name: 'Kitchen', deviceCount: 2 },
        ])
    })

    // This is what the LEFT join is for: an INNER join would drop the empty room entirely
    it('includes rooms with no devices, with a count of 0', async () => {
        await insertRoom('Garage')

        const res = await request(app).get('/api/rooms')

        expect(res.body).toEqual([{ id: 1, name: 'Garage', deviceCount: 0 }])
    })

    it('returns counts as numbers, matching the shared schema', async () => {
        const room = await insertRoom('Kitchen')
        await insertDevice({ room_id: room.id })

        const res = await request(app).get('/api/rooms')

        expect(typeof res.body[0].deviceCount).toBe('number')
        expect(() => RoomSummarySchema.array().parse(res.body)).not.toThrow()
    })
})

describe('POST /api/rooms', () => {
    it('creates a room and returns it with 201 and a device count of 0', async () => {
        const res = await request(app).post('/api/rooms').send({ name: 'Office' })

        expect(res.status).toBe(201)
        expect(res.body).toEqual({ id: 1, name: 'Office', deviceCount: 0 })
        expect(await db.selectFrom('rooms').select('name').execute()).toEqual([
            { name: 'Office' },
        ])
    })

    it('trims whitespace from the name', async () => {
        const res = await request(app).post('/api/rooms').send({ name: '  Office  ' })

        expect(res.status).toBe(201)
        expect(res.body.name).toBe('Office')
    })

    it.each([
        ['a missing name', {}],
        ['a blank name', { name: '   ' }],
        ['a non-string name', { name: 42 }],
        ['unknown fields', { name: 'Office', floor: 2 }],
    ])('returns 400 for %s', async (_label, body) => {
        const res = await request(app).post('/api/rooms').send(body)

        expect(res.status).toBe(400)
        expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 409 for a name that already exists', async () => {
        await insertRoom('Kitchen')

        const res = await request(app).post('/api/rooms').send({ name: 'Kitchen' })

        expect(res.status).toBe(409)
        expect(res.body.error).toEqual({
            code: 'CONFLICT',
            message: 'A room with this name already exists',
        })
    })

    it('treats names that differ only by case as duplicates', async () => {
        await insertRoom('Kitchen')

        const res = await request(app).post('/api/rooms').send({ name: 'kitchen' })

        expect(res.status).toBe(409)
    })
})
