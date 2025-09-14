import { FastifyPluginCallback } from 'fastify';
import * as JWT from 'jsonwebtoken';
import { prisma } from '../utils';

export const authHardening: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.addHook('preHandler', async (req, reply) => {
    try {
      const auth = (req.headers['authorization'] || '').toString();
      if (!auth.startsWith('Bearer ')) return; // only act on auth routes
      const token = auth.replace(/^Bearer\s+/i, '');
      
      // JWT verification
      const decoded: any = JWT.verify(token, process.env.JWT_SECRET as string);
      
      // Version check (logout-all support)
      const user = await prisma.user.findUnique({ 
        where: { id: decoded.id }, 
        select: { id: true, tokenVersion: true } 
      });
      if (!user) return reply.code(401).send({ message: 'Unauthorized' });
      if ((user as any).tokenVersion !== (decoded.tokenVersion ?? 0)) {
        return reply.code(401).send({ message: 'Token ungültig (Version)' });
      }
      
      // JTI blacklist check (if plugin registered)
      const jti = decoded.jti;
      const isBlacklisted = (typeof (req.server as any).isTokenBlacklisted === 'function') 
        ? (req.server as any).isTokenBlacklisted(jti) 
        : false;
      if (jti && isBlacklisted) return reply.code(401).send({ message: 'Token widerrufen' });
      
      // Set authUser for controllers
      (req as any)['authUser'] = user;
      
      // Update lastActiveAt (best-effort)
      await prisma.user.update({ 
        where: { id: user.id }, 
        data: { lastActiveAt: new Date() } 
      }).catch(() => {});
      
    } catch (_e) {
      // if verification fails, let existing auth guard handle it later
    }
  });
  done();
};