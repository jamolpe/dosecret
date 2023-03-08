import { Result } from '../../models/result';
import { Secret, SecretOwner } from '../models/secret';
import { ERROR_CODES, manageDbCreateErrors } from './secret-error';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface ISecretDB {
  save(secret: SecretOwner): Promise<SecretOwner>;
  getSecret(uuid: string): Promise<SecretOwner | undefined>;
  getSecretByAdmin(ownerUuid: string): Promise<SecretOwner | undefined>;
  deleteSecret(uuid: string): Promise<void>;
  updateSecret(id: string, secret: SecretOwner): Promise<SecretOwner>;
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
  ): Promise<Result<{ uuid: string; ownerUuid: string }>> {
    try {
      const validation = this.validateSecret(secret);
      if (validation) {
        return { error: validation };
      }
      const newSecret: SecretOwner = {
        ...secret,
        usages: 0,
        uuid: uuidv4(),
        ownerUuid: uuidv4(),
        secret: this.secureSecret(secret.secret)
      };
      const result = await this.secretDb.save(newSecret);
      return { result: { uuid: result.uuid, ownerUuid: newSecret.ownerUuid } };
    } catch (error) {
      return { error: manageDbCreateErrors(error) };
    }
  }

  private async getSecretAsOwner(adminUuid: string): Promise<SecretOwner> {
    try {
      const secret = await this.secretDb.getSecretByAdmin(adminUuid);
      return secret;
    } catch (error) {
      return null;
    }
  }

  private async getSecretAsUser(uuid: string): Promise<Secret> {
    try {
      const secret = await this.secretDb.getSecret(uuid);
      const updatedSecret = await this.secretDb.updateSecret(secret.id, {
        ...secret,
        usages: secret.usages + 1
      });
      updatedSecret.ownerUuid = undefined;
      updatedSecret.usages = undefined;
      if (updatedSecret.usages >= updatedSecret.maxUsages)
        await this.secretDb.deleteSecret(updatedSecret.uuid);
      return updatedSecret;
    } catch (error) {
      return null;
    }
  }

  async getSecretByUuid(uuid: string): Promise<Result<Secret | SecretOwner>> {
    let secret: Secret | SecretOwner | null = null;
    secret = await this.getSecretAsOwner(uuid);
    if (!secret) {
      secret = await this.getSecretAsUser(uuid);
    }
    if (!secret) return { error: ERROR_CODES.NOT_FOUND };
    secret.id = undefined;
    secret.secret = this.decryptSecret(secret.secret);
    return { result: secret };
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
