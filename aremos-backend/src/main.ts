// Ensure default timezone
process.env.TZ = process.env.TZ || 'Europe/Berlin';
// Auto-generated robust bootstrap with DB/Storage toggles (memory/prisma, local/supabase)
import fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import practiceRouter from './routes/practice.router';
import authRouter from './routes/auth.router';
import deckRouter from './routes/deck.router';
import classroomRouter from './routes/classroom.router';
import notificationRouter from './routes/notification.router';
import uploadsRouter from './routes/uploads.router';
import insightsRouter from './routes/insights.router';
import securityRouter from './routes/security.router';
import healthRouter from './routes/health.router';

import { jwtBlacklist } from './plugins/jwt-blacklist';
import { authHardening } from './plugins/auth-hardening';
import { cronWiring } from './plugins/cron-wiring';
import { rateLimit } from './plugins/rate-limit';

// Strict CORS guard in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.FRONTEND_ORIGIN || process.env.FRONTEND_ORIGIN.trim() === '') {
    throw new Error('FRONTEND_ORIGIN required in production');
  }
}

export const app = fastify({ logger: true });

// CORS Configuration
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3001';
app.register(cors, {
  origin: process.env.NODE_ENV === 'production' ? [frontendOrigin] : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});

// Rate limit + Multipart
app.register(rateLimit);
app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

// Security / Auth plugins
app.register(jwtBlacklist);
app.register(authHardening);

// Cron jobs wiring
app.register(cronWiring);

// Routers
app.register(authRouter, { prefix: '/api/auth' });
app.register(deckRouter, { prefix: '/api/decks' });
app.register(classroomRouter, { prefix: '/api/classrooms' });
app.register(notificationRouter, { prefix: '/api/notifications' });
app.register(practiceRouter, { prefix: '/api/practice' });
app.register(uploadsRouter, { prefix: '/api/uploads' });
app.register(insightsRouter, { prefix: '/api/insights' });
app.register(securityRouter, { prefix: '/api/security' });
app.register(healthRouter, { prefix: '/api' });

// Start if run directly
if (require.main === module) {
  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen({ port: PORT, host: HOST }).then(() => {
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
  }).catch(err => {
    app.log.error(err);
    process.exit(1);
  });
}
