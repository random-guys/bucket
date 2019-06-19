import { SchemaDefinition, SchemaOptions, Schema, SchemaTypes } from 'mongoose';
import { uuid, readMapper, timestamps } from '.';

export const SchemaFactory = <T = any>(
  schema: SchemaDefinition,
  options?: SchemaOptions
) => {
  if (!schema || Object.keys(schema).length === 0) {
    throw new Error('Please specify schema definition');
  }

  return new Schema<T>(
    {
      ...schema,
      _id: { ...uuid },
      deleted_at: { type: SchemaTypes.Date },
    },
    {
      ...options,
      ...readMapper,
      ...timestamps,
      // @ts-ignore
      selectPopulatedPaths: false,
    }
  );
};
