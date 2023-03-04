import S from 'fluent-json-schema';
import { FastifyInstance } from 'fastify';
import { verifyUser } from '../../../middlewares/auth-mw';
import { AdminController } from '../../../controllers/private/admin-controller';

export = async function UserRoutes(fastify: FastifyInstance) {
  const adminController = new AdminController();
  fastify.route({
    method: 'GET',
    url: '/users',
    preValidation: (request, reply, next) => {
      verifyUser(request, reply, next, ['admin']);
    },
    async handler(request, reply) {
      await adminController.listUsersInPool(request, reply);
    },
    schema: {
      tags: ['Admin'],
      response: {
        200: S.array().items(
          S.object()
            .prop('id', S.string())
            .prop('cognitoId', S.string())
            .prop('email', S.string())
            .prop('email_verified', S.boolean())
        ),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string())
      }
    }
  });
};
