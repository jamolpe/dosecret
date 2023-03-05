export interface Secret {
  id?: string;
  secret: string;
  date: Date;
  expires: Date;
  maxUsages: number;
  uuid?: string;
  usages?: number;
}
