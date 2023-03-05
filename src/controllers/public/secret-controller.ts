import { FastifyReply } from 'fastify';
import { Secret } from '../../core/models/secret';
import { SecretCore } from '../../core/secret/secret';
import { RequestUuid } from '../../models/requester';
import { ProjectDatabase } from '../../services/secrets/secret-db';
import { manageResults } from '../utils/manage-result';

export class SecretController {
  secretCore = new SecretCore(new ProjectDatabase());
  async generateSecret(req: RequestUuid, res: FastifyReply) {
    const { secret, date, expires, maxUsages } = <Secret>req.body;
    const { result, error } = await this.secretCore.generateSecret({
      secret,
      date: new Date(date),
      expires: new Date(expires),
      maxUsages
    });
    return manageResults<string>(res, result, error);
  }

  async getSecret(req: RequestUuid, res: FastifyReply) {
    const { uuid } = req.params;
    const { result, error } = await this.secretCore.getSecretByUuid(uuid);
    return manageResults<Secret>(res, result, error);
  }

  async deleteSecret(req: RequestUuid, res: FastifyReply) {
    const { uuid } = req.params;
    const { result, error } = await this.secretCore.deleteSecretByUuid(uuid);
    return manageResults<boolean>(res, result, error);
  }
}
