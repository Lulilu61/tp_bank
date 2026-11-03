import { Router } from 'express';
import { HttpError } from '../errors/http-error.ts';
import { validateObjectId } from '../middlewares/validate-object-id.ts';
import { UserModel } from '../models/user.model.ts';
import { parseCreateUser, parseUpdateUser } from '../validation/user.validation.ts';

export const usersRouter = Router();

// Runs before every route containing :id
usersRouter.param('id', validateObjectId);

// GET /api/users
usersRouter.get('/', async (_req, res) => {
  const users = await UserModel.find();
  res.status(200).json(users);
});

// GET /api/users/:id
usersRouter.get('/:id', async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  res.status(200).json(user);
});

// POST /api/users
usersRouter.post('/', async (req, res) => {
  const input = parseCreateUser(req.body);
  const user = await UserModel.create(input);
  res.status(201).json(user);
});

// PATCH /api/users/:id
usersRouter.patch('/:id', async (req, res) => {
  const update = parseUpdateUser(req.body);
  const user = await UserModel.findById(req.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  user.set(update);
  await user.save();
  res.status(200).json(user);
});

// DELETE /api/users/:id
usersRouter.delete('/:id', async (req, res) => {
  // Business rule 5 (user with accounts -> 409) will be added with the BankAccount model
  const user = await UserModel.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  res.status(204).end();
});