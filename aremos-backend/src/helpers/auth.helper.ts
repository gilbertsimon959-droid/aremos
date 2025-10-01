import { FastifyReply, FastifyRequest } from 'fastify';
import { ERRORS } from './errors.helper';
import { AuthUser } from '../types/auth.types';

export function checkValidRequest(req: FastifyRequest, reply: FastifyReply) {
  // Assumes authHardening plugin has set req['authUser'] when needed
  // If an authenticated route is hit without authUser, we block
  const user = (req as any)['authUser'] as AuthUser | undefined;
  if (!user && req.headers.authorization) throw ERRORS.unauthorizedAccess;
  return true;
}

/**
 * Type guard to get authenticated user from request
 */
export function getAuthUser(req: FastifyRequest): AuthUser {
  const user = (req as any)['authUser'] as AuthUser | undefined;
  if (!user) throw ERRORS.unauthorizedAccess;
  return user;
}
