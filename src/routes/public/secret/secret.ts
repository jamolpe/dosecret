import S from 'fluent-json-schema';
import { FastifyInstance } from 'fastify';
import { SecretController } from '../../../controllers/public/secret-controller';

export = async function SecretRoutes(fastify: FastifyInstance) {
  const secretController = new SecretController();
  fastify.route({
    method: 'POST',
    url: '/',
    async handler(request, reply) {
      await secretController.generateSecret(request, reply);
    },
    schema: {
      tags: ['Secret'],
      body: S.object()
        .prop('secret', S.string().required())
        .prop('date', S.string())
        .prop('expires', S.string())
        .prop('maxUsages', S.number()),
      response: {
        200: S.object().prop('uuid', S.string()),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string())
      }
    }
  });
  fastify.route({
    method: 'GET',
    url: '/:uuid',
    async handler(request, reply) {
      await secretController.getSecret(request, reply);
    },
    schema: {
      tags: ['Secret'],
      params: S.object().prop('uuid', S.string().required()),
      response: {
        200: S.object()
          .prop('secret', S.string().required())
          .prop('date', S.not(S.array()))
          .prop('expires', S.not(S.array()))
          .prop('maxUsages', S.number())
          .prop('uuid', S.string())
          .prop('usages', S.number()),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string())
      }
    }
  });
  fastify.route({
    method: 'DELETE',
    url: '/:uuid',
    async handler(request, reply) {
      await secretController.deleteSecret(request, reply);
    },
    schema: {
      tags: ['Secret'],
      params: S.object().prop('uuid', S.string().required()),
      response: {
        200: S.boolean(),
        500: S.string(),
        422: S.object()
          .prop('message', S.string())
          .prop('code', S.string())
          .prop('name', S.string())
      }
    }
  });
};
