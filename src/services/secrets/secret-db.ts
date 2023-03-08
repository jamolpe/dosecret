import { SecretOwner } from '../../core/models/secret';
import { ISecretDB } from '../../core/secret/secret';
import SecretDB from './secret-db-model';

export class ProjectDatabase implements ISecretDB {
  save(secret: SecretOwner) {
    const scrDB = new SecretDB(secret);
    scrDB.expires = secret.expires;
    return scrDB.save();
  }
  async getSecret(uuid: string): Promise<SecretOwner | undefined> {
    const scr = await SecretDB.findOne({ uuid }).lean();
    return {
      ...scr,
      id: scr._id
    };
  }

  async getSecretByAdmin(ownerUuid: string): Promise<SecretOwner | undefined> {
    const scr = await SecretDB.findOne({ ownerUuid }).lean();
    return {
      ...scr,
      id: scr._id
    };
  }
  async deleteSecret(uuid: string): Promise<void> {
    return SecretDB.remove({ uuid }).lean();
  }

  async updateSecret(id: string, secret: SecretOwner): Promise<SecretOwner> {
    const newSecret = await SecretDB.findByIdAndUpdate(id, secret, {
      new: true
    }).lean();
    return newSecret;
  }
}
