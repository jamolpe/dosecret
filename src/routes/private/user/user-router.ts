import S from 'fluent-json-schema';
import { FastifyInstance } from 'fastify';
import { UserController } from '../../../controllers/private/user-controller';
import { verifyUser } from '../../../middlewares/auth-mw';

export = async function UserRoutes(fastify: FastifyInstance) {
  const userController = new UserController();
  fastify.route({
    method: 'GET',
    url: '/info',
    preValidation: (request, reply, next) => {
      verifyUser(request, reply, next, ['freemium']);
    },
    async handler(request, reply) {
      await userController.getUserInformation(request, reply);
    },
    schema: {
      tags: ['User'],
      response: {
        200: S.object().prop('email', S.string()).prop('cognitoId', S.string()),
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
    url: '/change-password',
    preValidation: (request, reply, next) => {
      verifyUser(request, reply, next, ['freemium']);
    },
    async handler(request, reply) {
      await userController.modifyPassword(request, reply);
    },
    schema: {
      tags: ['User'],
      bod: S.object()
        .prop('newPassword', S.string().required())
        .prop('oldPassword', S.string().required()),
      response: {
        204: S.object(),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string())
      }
    }
  });
};
