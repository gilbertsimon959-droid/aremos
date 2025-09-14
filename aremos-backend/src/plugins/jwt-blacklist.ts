import { FastifyPluginCallback } from 'fastify';

type Entry = { exp: number };
const blacklist = new Map<string, Entry>();

export const jwtBlacklist: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.decorate('blacklistToken', (jti: string, exp: number) => {
    blacklist.set(jti, { exp });
  });
  fastify.decorate('isTokenBlacklisted', (jti: string) => {
    const e = blacklist.get(jti);
    if (!e) return false;
    if (Date.now() / 1000 > e.exp) { blacklist.delete(jti); return false; }
    return true;
  });
  done();
};

declare module 'fastify' {
  interface FastifyInstance {
    blacklistToken(jti: string, exp: number): void;
    isTokenBlacklisted(jti: string): boolean;
  }
}
