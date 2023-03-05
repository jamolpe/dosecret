import { FastifyReply } from 'fastify';
import { INTERNAL_SERVER_ERROR } from '../../models/constants';
import { CommonError } from '../../models/error';

export const manageResults = <T>(
  res: FastifyReply,
  result: T,
  error: CommonError
) => {
  if (error) {
    return res.status(422).send(error);
  }
  if (!result) {
    return res.status(400).send();
  }
  if (result) {
    return res.status(200).send(result);
  }
  return res.status(500).send(INTERNAL_SERVER_ERROR);
};
