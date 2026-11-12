import { z } from 'zod'
import { idField, nameField } from './fields'

export const RoomSchema = z.object({
    id: idField,
    name: z.string(),
})

export const RoomSummarySchema = RoomSchema.extend({
    deviceCount: z.number().int().nonnegative(),
})

export const CreateRoomSchema = z.strictObject({
    name: nameField,
})

export type Room = z.infer<typeof RoomSchema>
export type RoomSummary = z.infer<typeof RoomSummarySchema>
export type CreateRoomInput = z.output<typeof CreateRoomSchema>
