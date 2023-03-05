import { Result } from '../../models/result';
import { Secret } from '../models/secret';
import { ERROR_CODES, manageDbCreateErrors } from './secret-error';
import { v4 as uuidv4 } from 'uuid';

export interface ISecretDB {
  save(secret: Secret): Promise<Secret>;
  getSecret(uuid: string): Promise<Secret | undefined>;
  deleteSecret(uuid: string): Promise<void>;
}

export class SecretCore {
  secretDb: ISecretDB;
  constructor(db: ISecretDB) {
    this.secretDb = db;
  }

  validateSecret(secret: Secret) {
    const today = new Date();
    if (today > secret.expires || secret.date > secret.expires) {
      return ERROR_CODES.EXPIRATION_DATE_ERROR;
    }
    if (today > secret.date) {
      return ERROR_CODES.SECRET_DATE_ERROR;
    }
    return;
  }
  async generateSecret(secret: Secret): Promise<Result<string>> {
    try {
      const validation = this.validateSecret(secret);
      if (validation) {
        return { error: validation };
      }
      const newSecret = { ...secret, uuid: uuidv4() };
      const result = await this.secretDb.save(newSecret);
      return { result: result.uuid };
    } catch (error) {
      return { error: manageDbCreateErrors(error) };
    }
  }
  async getSecretByUuid(uuid: string): Promise<Result<Secret>> {
    try {
      const secret = await this.secretDb.getSecret(uuid);
      return { result: secret };
    } catch (error) {
      return { error: ERROR_CODES.NOT_FOUND };
    }
  }

  async deleteSecretByUuid(uuid: string): Promise<Result<boolean>> {
    try {
      await this.secretDb.deleteSecret(uuid);
      return { result: true };
    } catch (error) {
      return { error: ERROR_CODES.NOT_REMOVED };
    }
  }
}
