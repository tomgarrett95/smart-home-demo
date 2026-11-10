import { z } from 'zod';

export const DeviceTypeSchema = z.enum(['light', 'plug']);
export const DeviceStatusSchema = z.enum(['on', 'off']);

const nameField = z.string().trim().min(1, 'Name is required').max(100);
const roomField = z.string().trim().min(1, 'Room is required').max(100);

// What the API returns
export const DeviceSchema = z.object({
  id: z.number().int().positive(),
  deviceType: DeviceTypeSchema,
  name: z.string(),
  room: z.string(),
  status: DeviceStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// POST /api/devices body
export const CreateDeviceSchema = z.strictObject({
  deviceType: DeviceTypeSchema,
  name: nameField,
  room: roomField,
  status: DeviceStatusSchema.default('off'),
});

// PATCH /api/devices/:id body: deviceType is deliberately not updatable
export const UpdateDeviceSchema = z
  .strictObject({
    name: nameField,
    room: roomField,
    status: DeviceStatusSchema,
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });

// :id route parameter
export const DeviceIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type DeviceType = z.infer<typeof DeviceTypeSchema>;
export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;
export type Device = z.infer<typeof DeviceSchema>;

// What the client sends (status optional) vs what the server has after parsing (status filled in)
export type CreateDevicePayload = z.input<typeof CreateDeviceSchema>;
export type CreateDeviceInput = z.output<typeof CreateDeviceSchema>;
export type UpdateDeviceInput = z.output<typeof UpdateDeviceSchema>;

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
