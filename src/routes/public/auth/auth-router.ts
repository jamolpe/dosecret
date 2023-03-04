import S from 'fluent-json-schema';
import { FastifyInstance } from 'fastify';
import { AuthController } from '../../../controllers/public/Auth-controller';

export = async function AuthRoutes(fastify: FastifyInstance) {
  const authController = new AuthController();
  fastify.route({
    method: 'POST',
    url: '/register',
    async handler(request, reply) {
      await authController.register(request, reply);
    },
    schema: {
      tags: ['Auth'],
      body: S.object()
        .prop('email', S.string().required())
        .prop('password', S.string().required()),
      response: {
        200: S.object()
          .prop('username', S.string())
          .prop('userConfirmed', S.string()),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string())
      }
    }
  });
  fastify.route({
    method: 'POST',
    url: '/verify',
    async handler(request, reply) {
      await authController.verify(request, reply);
    },
    schema: {
      tags: ['Auth'],
      body: S.object()
        .prop('email', S.string().required())
        .prop('code', S.string().required()),
      response: {
        200: S.object(),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string())
      }
    }
  });
  fastify.route({
    method: 'POST',
    url: '/login',
    async handler(request, reply) {
      await authController.loginUser(request, reply);
    },
    schema: {
      tags: ['Auth'],
      body: S.object()
        .prop('email', S.string().required())
        .prop('password', S.string().required()),
      response: {
        200: S.string(),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string()),
        400: S.object()
      }
    }
  });
  fastify.route({
    method: 'POST',
    url: '/forgot-password',
    async handler(request, reply) {
      await authController.forgotPassword(request, reply);
    },
    schema: {
      tags: ['Auth'],
      body: S.object().prop('email', S.string().required()),
      response: {
        204: S.object(),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string()),
        400: S.object()
      }
    }
  });
  fastify.route({
    method: 'POST',
    url: '/confirm-password',
    async handler(request, reply) {
      await authController.confirmPassword(request, reply);
    },
    schema: {
      tags: ['Auth'],
      body: S.object()
        .prop('email', S.string().required())
        .prop('verificationCode', S.string().required())
        .prop('newPassword', S.string().required()),
      response: {
        200: S.object(),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string()),
        400: S.object()
      }
    }
  });
};
