import { CreateRoomSchema, type RoomSummary } from '@smart-home/packages/rooms';
import { Router, type Response } from 'express';
import { parse } from '../middleware/validate';
import { roomsRepo } from '../repositories/roomsRepo';

export const roomsRouter = Router();

roomsRouter.get('/', async (_req, res: Response<RoomSummary[]>) => {
  res.json(await roomsRepo.list());
});

roomsRouter.post('/', async (req, res: Response<RoomSummary>) => {
  const input = parse(CreateRoomSchema, req.body);
  const room = await roomsRepo.create(input);
  res.status(201).json(room);
});
