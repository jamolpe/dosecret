import { Result } from '../../models/result';
import { Secret } from '../models/secret';
import { ERROR_CODES, manageDbCreateErrors } from './secret-error';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface ISecretDB {
  save(secret: Secret): Promise<Secret>;
  getSecret(uuid: string): Promise<Secret | undefined>;
  getSecretByAdmin(admUuid: string): Promise<Secret | undefined>;
  deleteSecret(uuid: string): Promise<void>;
  updateSecret(id: string, secret: Secret): Promise<Secret>;
}

export class SecretCore {
  secretDb: ISecretDB;
  algorithm: string;

  constructor(db: ISecretDB) {
    this.secretDb = db;
    this.algorithm = 'aes-256-cbc';
  }

  validateSecret(secret: Secret) {
    const today = new Date();
    if (today > secret.expires || secret.date > secret.expires) {
      return ERROR_CODES.EXPIRATION_DATE_ERROR;
    }
    if (today > secret.date) {
      return ERROR_CODES.SECRET_DATE_ERROR;
    }
  }

  private secureSecret(secret: string): string {
    const secretKey = process.env.SECRET_KEY;

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, secretKey, iv);

    let ciphertext = cipher.update(secret, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    ciphertext += iv.toString('hex');
    return ciphertext;
  }

  private decryptSecret(secured: string) {
    const ivFromCiphertext = Buffer.from(secured.slice(-32), 'hex');
    const ciphertextWithoutIv = secured.slice(0, -32);

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      process.env.SECRET_KEY,
      ivFromCiphertext
    );
    let decrypted = decipher.update(ciphertextWithoutIv, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async generateSecret(
    secret: Secret
  ): Promise<Result<{ uuid: string; admUuid: string }>> {
    try {
      const validation = this.validateSecret(secret);
      if (validation) {
        return { error: validation };
      }
      const newSecret = {
        ...secret,
        uuid: uuidv4(),
        admUuid: uuidv4(),
        secret: this.secureSecret(secret.secret)
      };
      const result = await this.secretDb.save(newSecret);
      return { result: { uuid: result.uuid, admUuid: result.admUuid } };
    } catch (error) {
      return { error: manageDbCreateErrors(error) };
    }
  }

  private async getSecretAsAdmin(adminUuid: string) {
    try {
      const secret = await this.secretDb.getSecretByAdmin(adminUuid);
      return secret;
    } catch (error) {
      return;
    }
  }

  async getSecretByUuid(uuid: string): Promise<Result<Secret>> {
    try {
      let secret = await this.getSecretAsAdmin(uuid);
      let updatedSecret = { ...secret };
      if (!secret) {
        secret = await this.secretDb.getSecret(uuid);
        updatedSecret = await this.secretDb.updateSecret(secret.id, {
          ...secret,
          usages: secret.usages + 1
        });
        updatedSecret.admUuid = undefined;
      }
      updatedSecret.id = undefined;
      updatedSecret.secret = this.decryptSecret(secret.secret);
      if (updatedSecret.usages >= updatedSecret.maxUsages)
        await this.secretDb.deleteSecret(updatedSecret.uuid);
      return { result: updatedSecret };
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
