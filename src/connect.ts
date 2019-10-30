import { ConnectionOptions } from 'mongoose';

export interface MongoConfig {
  mongodb_url: string;
  mongodb_username: string;
  mongodb_password: string;
}

export const defaultMongoOpts: ConnectionOptions = {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  // @ts-ignore this language can be extremely stupid
  useUnifiedTopology: true
};

export const secureMongoOpts = (config: MongoConfig): ConnectionOptions => {
  return {
    ...defaultMongoOpts,
    user: config.mongodb_username,
    pass: config.mongodb_password
  };
};

export function createConfig(appEnv: string, config: MongoConfig) {
  return appEnv === 'dev' ? defaultMongoOpts : secureMongoOpts(config);
}
