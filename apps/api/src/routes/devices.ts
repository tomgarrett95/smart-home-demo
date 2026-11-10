import {
  CreateDeviceSchema,
  DeviceIdParamsSchema,
  UpdateDeviceSchema,
  type Device,
} from '@devices/shared';
import { Router, type Response } from 'express';
import { NotFoundError } from '../errors';
import { parse } from '../middleware/validate';
import { devicesRepo } from '../repositories/devicesRepo';

export const devicesRouter = Router();

devicesRouter.get('/', async (_req, res: Response<Device[]>) => {
  res.json(await devicesRepo.list());
});

devicesRouter.get('/:id', async (req, res: Response<Device>) => {
  const { id } = parse(DeviceIdParamsSchema, req.params);
  const device = await devicesRepo.findById(id);
  if (!device) throw new NotFoundError(`Device ${id} not found`);
  res.json(device);
});

devicesRouter.post('/', async (req, res: Response<Device>) => {
  const input = parse(CreateDeviceSchema, req.body);
  const device = await devicesRepo.create(input);
  res.status(201).json(device);
});

devicesRouter.patch('/:id', async (req, res: Response<Device>) => {
  const { id } = parse(DeviceIdParamsSchema, req.params);
  const input = parse(UpdateDeviceSchema, req.body);
  const device = await devicesRepo.update(id, input);
  if (!device) throw new NotFoundError(`Device ${id} not found`);
  res.json(device);
});

devicesRouter.delete('/:id', async (req, res) => {
  const { id } = parse(DeviceIdParamsSchema, req.params);
  const deleted = await devicesRepo.remove(id);
  if (!deleted) throw new NotFoundError(`Device ${id} not found`);
  res.status(204).end();
});
