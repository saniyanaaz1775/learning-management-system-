import { Router } from 'express';
import { register, login, refresh, logout } from './auth.controller';
import { validateRegister, validateLogin } from './auth.validator';

export const authRoutes = Router();
authRoutes.post('/register', validateRegister, register);
authRoutes.post('/login', validateLogin, login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
