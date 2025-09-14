import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { ERRORS, handleServerError, AppError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';

export const listNotifications = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const now = new Date();
    const page = Math.max(1, parseInt(String((request.query as any)?.page || '1'), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String((request.query as any)?.pageSize || '20'), 10)));
    const skip = (page - 1) * pageSize;
    const total = await prisma.notification.count({ where: { userId: authUser.id, expires_at: { gt: now } } });
    const unread = await prisma.notification.count({ where: { userId: authUser.id, expires_at: { gt: now }, read_at: null } });
    const deckItems = await prisma.notification.findMany({
      where: { userId: authUser.id, expires_at: { gt: now } },
      orderBy: { created_at: 'desc' },
      skip, take: pageSize,
      select: { id: true, deckId: true, created_at: true, read_at: true, expires_at: true, deck: { select: { name: true } } },
    });
    const sysItemsRaw = await prisma.systemNotification.findMany({ where: { userId: authUser.id, expires_at: { gt: now } }, orderBy: { created_at: 'desc' } });
    const sysItems = sysItemsRaw.map(s => ({ id: s.id, created_at: s.created_at, read_at: s.read_at, expires_at: s.expires_at, type: 'system', message: s.message }));
    const deckItemsOut = deckItems.map(d => ({ id: d.id, deckId: d.deckId, created_at: d.created_at, read_at: d.read_at, expires_at: d.expires_at, type: 'deck', deck: d.deck }));
    const merged = [...sysItems, ...deckItemsOut].sort((a,b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    const pageItems = merged.slice(skip, skip + pageSize);
    reply.header('X-Unread-Count', unread);
    return reply.code(STANDARD.OK.statusCode).send({ items: pageItems, total, page, pageSize });
  } catch (err) { return handleServerError(reply, err); }
};
export const markRead = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const id = parseInt(request.params.id, 10);
    const n = await prisma.notification.findFirst({ where: { id, userId: authUser.id } });
    if (!n) throw new AppError('Not found', 404);
    const updated = await prisma.notification.update({ where: { id }, data: { read_at: new Date() } });
    return reply.code(STANDARD.OK.statusCode).send(updated);
  } catch (err) { return handleServerError(reply, err); }
};

export const markReadSystem = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) throw ERRORS.unauthorizedAccess;
    const id = parseInt(request.params.id, 10);
    const n = await prisma.systemNotification.findFirst({ where: { id, userId: authUser.id } });
    if (!n) throw new AppError('Not found', 404);
    const updated = await prisma.systemNotification.update({ where: { id }, data: { read_at: new Date() } });
    return reply.code(STANDARD.OK.statusCode).send(updated);
  } catch (err) { return handleServerError(reply, err); }
};
