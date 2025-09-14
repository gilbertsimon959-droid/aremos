import { FastifyInstance } from 'fastify';
import { checkValidRequest } from '../helpers/auth.helper';
import { 
  startSession, 
  getSessionStatus, 
  submitAnswer, 
  endSession 
} from '../controllers/practice.controller';

async function practiceRouter(fastify: FastifyInstance) {
  // All practice endpoints require authentication
  fastify.post('/sessions', { 
    preHandler: [fastify.rateLimit('practice', 100, 60000), checkValidRequest] 
  }, startSession);
  
  fastify.get('/sessions/:sessionId', { 
    preHandler: checkValidRequest 
  }, getSessionStatus);
  
  fastify.post('/sessions/:sessionId/answer', { 
    preHandler: [fastify.rateLimit('practice', 100, 60000), checkValidRequest] 
  }, submitAnswer);
  
  fastify.post('/sessions/:sessionId/end', { 
    preHandler: checkValidRequest 
  }, endSession);
}

export default practiceRouter;