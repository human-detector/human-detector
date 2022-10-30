import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';

const options: MikroOrmModuleSyncOptions = {
  autoLoadEntities: true,
  type: 'postgresql',
  dbName: process.env.DB_NAME || undefined,
  host: process.env.DB_HOST || undefined,
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
};
export default options;
