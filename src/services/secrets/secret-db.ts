import { Secret } from '../../core/models/secret';
import { ISecretDB } from '../../core/secret/secret';
import SecretDB from './secret-db-model';

export class ProjectDatabase implements ISecretDB {
  save(secret: Secret) {
    const scrDB = new SecretDB(secret);
    scrDB.expires = secret.expires;
    return scrDB.save();
  }
  async getSecret(uuid: string): Promise<Secret | undefined> {
    const scr = await SecretDB.findOne({ uuid }).lean();
    return {
      ...scr,
      id: scr._id
    };
  }

  async getSecretByAdmin(admUuid: string): Promise<Secret | undefined> {
    const scr = await SecretDB.findOne({ admUuid }).lean();
    return {
      ...scr,
      id: scr._id
    };
  }
  async deleteSecret(uuid: string): Promise<void> {
    return SecretDB.remove({ uuid }).lean();
  }

  async updateSecret(id: string, secret: Secret): Promise<Secret> {
    const newSecret = await SecretDB.findByIdAndUpdate(id, secret, {
      new: true
    }).lean();
    return newSecret;
  }
}
