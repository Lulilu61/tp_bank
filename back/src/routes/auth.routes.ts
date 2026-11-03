import { Router } from 'express';
import { hashPassword, verifyPassword } from '../auth/password.ts';
import { signToken } from '../auth/token.ts';
import { HttpError } from '../errors/http-error.ts';
import { UserModel } from '../models/user.model.ts';
import { parseLogin, parseRegister } from '../validation/auth.validation.ts';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const { password, ...profile } = parseRegister(req.body);
  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({ ...profile, passwordHash });
  res.status(201).json(user);
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password } = parseLogin(req.body);

  // passwordHash has select: false, "+" asks for it explicitly
  const user = await UserModel.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');

  // Same error whether the email is unknown or the password is wrong
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  res.status(200).json({ token: signToken(user.id) });
});