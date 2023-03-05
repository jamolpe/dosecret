import { FastifyRequest } from 'fastify';

export interface RequestUuid extends FastifyRequest {
  uuid?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  start?: any;
  user?: UserSession;
  accessToken?: any;
  params: any;
}

export interface UserSession {
  email: string;
  cognitoId: string;
}
