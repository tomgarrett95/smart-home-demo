import { z } from 'zod';
import { idField, nameField } from './fields';
import { RoomSchema } from './rooms';

export const DeviceTypeSchema = z.enum(['light', 'plug']);
export const DeviceStatusSchema = z.enum(['on', 'off']);

export const DeviceSchema = z.object({
  id: idField,
  deviceType: DeviceTypeSchema,
  name: z.string(),
  room: RoomSchema,
  status: DeviceStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const CreateDeviceSchema = z.strictObject({
  deviceType: DeviceTypeSchema,
  name: nameField,
  roomId: idField,
  status: DeviceStatusSchema.default('off'),
});

export const UpdateDeviceSchema = z
  .strictObject({
    name: nameField,
    roomId: idField,
    status: DeviceStatusSchema,
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });

export type DeviceType = z.infer<typeof DeviceTypeSchema>;
export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;
export type Device = z.infer<typeof DeviceSchema>;

export type CreateDevicePayload = z.input<typeof CreateDeviceSchema>;
export type CreateDeviceInput = z.output<typeof CreateDeviceSchema>;
export type UpdateDeviceInput = z.output<typeof UpdateDeviceSchema>;
