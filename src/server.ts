import dotenv from 'dotenv';
import path from 'path';
import fastify from 'fastify';
import cookie from '@fastify/cookie';
import autoload from '@fastify/autoload';
import type { FastifyCookieOptions } from '@fastify/cookie';
dotenv.config();
import cors from 'cors';
import preLoggerMiddleware from './middlewares/pre-logger-mw';
import requestUuid from './middlewares/uuid-mw';
import errorMiddleware from './middlewares/error-mw';
import timerMiddleware from './middlewares/timer-mw';
import postLoggerMiddleware from './middlewares/post-logger-mw';
import { Database } from './services/database/database';

export class Server {
  public app: any;
  constructor() {
    this.app = fastify();
  }

  public async start() {
    await this.config();
    this.routes();
    this.postConfig(); // this MUST be here as is a post validator request
    this.app.listen({ port: 1337 });
  }

  private async config() {
    await this.app.register(import('@fastify/express'));
    this.app.use(cors());
    this.app.use(requestUuid);
    this.app.use(timerMiddleware);
    this.app.use(preLoggerMiddleware);
    this.app.use(postLoggerMiddleware);
    this.app.register(cookie, {
      secret: process.env.COOKIE_KEY,
      parseOptions: {}
    } as FastifyCookieOptions);

    new Database().connect();
    await this.configureSwagger();
  }

  private async configureSwagger() {
    await this.app.register(import('@fastify/swagger'), {
      swagger: {
        info: {
          title: 'Fastify API',
          description: 'Fastify API Template',
          version: '0.1.0'
        },
        externalDocs: {
          url: 'https://swagger.io',
          description: 'Find more info here'
        },
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'Auth', description: 'Auth routes' },
          { name: 'Public', description: 'Public routes' }
        ]
      }
    });
    await this.app.register(import('@fastify/swagger-ui'), {
      routePrefix: '/api-docs'
    });
  }

  private postConfig() {
    this.app.use(errorMiddleware);
  }
  private routes(): void {
    this.definePrivateRoutes();
    this.definePublicRoutes();
  }

  private definePrivateRoutes(): void {
    this.app.register(autoload, {
      dir: path.join(__dirname, 'routes/private')
    });
  }

  private definePublicRoutes(): void {
    this.app.register(autoload, {
      dir: path.join(__dirname, 'routes/public')
    });
  }
}

try {
  const server = new Server();
  server.start();
} catch (err) {
  console.log(err);
}
