export interface Secret {
  id?: string;
  secret: string;
  date: Date;
  expires: Date;
  maxUsages: number;
  uuid?: string;
}

export interface SecretOwner extends Secret {
  ownerUuid: string;
  usages: number;
}
