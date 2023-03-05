export interface Secret {
  secret: string;
  date: Date;
  expires: Date;
  maxUsages: number;
  uuid?: string;
}
