import { FastifyReply, FastifyRequest } from 'fastify';
import * as JWT from 'jsonwebtoken';
import { signAccessToken } from '../utils/auth-tokens';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../utils';
import { ERRORS, handleServerError, AppError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { IRegisterDto, ILoginDto } from '../schemas/Auth';

const loginAttempts = new Map<string, { count: number; until?: number }>();
const MAX_ATTEMPTS = 10;
const LOCK_MS = 10 * 60 * 1000;

function keyFor(req: FastifyRequest, name: string) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
  return `${ip}:${name}`;
}
function assertNotLocked(req: FastifyRequest, name: string) {
  const entry = loginAttempts.get(keyFor(req, name));
  if (entry && entry.until && Date.now() < entry.until) throw new AppError('Zu viele Fehlversuche – bitte später erneut versuchen', 429);
}
function registerFailure(req: FastifyRequest, name: string) {
  const key = keyFor(req, name);
  const entry = loginAttempts.get(key) || { count: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) { entry.until = Date.now() + LOCK_MS; entry.count = 0; }
  loginAttempts.set(key, entry);
}
function resetFailures(req: FastifyRequest, name: string) {
  loginAttempts.delete(keyFor(req, name));
}
async function checkLicense(code: string) {
  const hash = process.env.LICENSE_CODE_HASH;
  const plain = process.env.LICENSE_CODE || '1185131519';
  if (hash) return await bcrypt.compare(code, hash);
  return code === plain;
}

export const register = async (request: FastifyRequest<{ Body: IRegisterDto }>, reply: FastifyReply) => {
  const { name, password, code } = request.body;
  try {
    const ok = await checkLicense(code);
    if (!ok) throw new AppError('Code stimmt nicht', 401);
    const exists = await prisma.user.findUnique({ where: { name } });
    if (exists) throw new AppError('Name bereits vergeben', 409);
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, password: hashed } });
    const token = signAccessToken({ id: user.id, name: user.name, tokenVersion: 0 });
    return reply.code(STANDARD.CREATED.statusCode).send({ accessToken: token, user: { id: user.id, name: user.name } });
  } catch (err) { return handleServerError(reply, err); }
};

export const login = async (request: FastifyRequest<{ Body: ILoginDto }>, reply: FastifyReply) => {
  const { name, password, code } = request.body;
  try {
    assertNotLocked(request, name);
    const user = await prisma.user.findUnique({ where: { name } });
    if (!user) { registerFailure(request, name); throw new AppError('Name existiert nicht', 404); }
    const codeOk = await checkLicense(code);
    if (!codeOk) { registerFailure(request, name); throw new AppError('Code stimmt nicht', 401); }
    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) { registerFailure(request, name); throw new AppError('Passwort stimmt nicht', 401); }
    resetFailures(request, name);
    const token = signAccessToken({ id: user.id, name: user.name, tokenVersion: 0 });
    return reply.code(STANDARD.OK.statusCode).send({ accessToken: token, user: { id: user.id, name: user.name } });
  } catch (err) { return handleServerError(reply, err); }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = (request.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
    if (token) {
      const decoded: any = JWT.decode(token);
      const jti = decoded?.jti; const exp = decoded?.exp;
      if (jti && exp && typeof (request.server as any).blacklistToken === 'function') {
        (request.server as any).blacklistToken(jti, exp);
      }
    }
    return reply.code(STANDARD.OK.statusCode).send({ message: 'OK' });
  } catch (err) { return handleServerError(reply, err); }
};
export const deleteAccount = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser'];
    if (!authUser) throw ERRORS.unauthorizedAccess;
    await prisma.post.deleteMany({ where: { author_id: authUser.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: authUser.id } });
    return reply.code(STANDARD.OK.statusCode).send({ message: 'Account gelöscht' });
  } catch (err) { return handleServerError(reply, err); }
};

export const tokenInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) return reply.code(STANDARD.UNAUTHORIZED.statusCode).send(ERRORS.unauthorizedAccess);
    const token = (request.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
    const decoded: any = JWT.decode(token) || {};
    return reply.code(STANDARD.OK.statusCode).send({ exp: decoded.exp || null, jti: decoded.jti || null, tokenVersion: decoded.tokenVersion ?? null });
  } catch (err) { return handleServerError(reply, err); }
};

export const logoutAll = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authUser = (request as any)['authUser']; if (!authUser) return reply.code(STANDARD.UNAUTHORIZED.statusCode).send(ERRORS.unauthorizedAccess);
    await prisma.user.update({ where: { id: authUser.id }, data: { tokenVersion: { increment: 1 } } });
    return reply.code(STANDARD.OK.statusCode).send({ ok: true });
  } catch (err) { return handleServerError(reply, err); }
};
