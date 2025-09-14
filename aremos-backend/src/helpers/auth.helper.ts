import { FastifyReply, FastifyRequest } from 'fastify';
import { ERRORS } from './errors.helper';
export function checkValidRequest(req: FastifyRequest, reply: FastifyReply) {
  // Placeholder: assumes authHardening plugin has set req['authUser'] when needed
  // If an authenticated route is hit without authUser, we block
  const user = (req as any)['authUser'];
  if (!user && req.headers.authorization) throw ERRORS.unauthorizedAccess;
  return true;
}
