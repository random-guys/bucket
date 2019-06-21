import {
  Schema,
  SchemaDefinition,
  SchemaOptions,
  SchemaTypes
} from 'mongoose';
import { readMapper, timestamps, uuid } from './utils';
import { Model } from '../model';

export const SchemaFactory = <T extends Model>(
  schema: SchemaDefinition,
  options?: SchemaOptions,
  autoIndex: boolean = true
) => {
  if (!schema || Object.keys(schema).length === 0) {
    throw new Error('Please specify schema definition')
  }

  const mongooseSchema = new Schema<T>(
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
  )

  if (autoIndex) {
    for (const prop of getUniqueProps(schema)) {
      mongooseSchema.index({ deleted_at: 1, [prop]: 1 }, { unique: true })
    }
  }
  return mongooseSchema
};

export function getUniqueProps(schema: SchemaDefinition) {
  const uniqueProps = []
  for (const k of Object.keys(schema)) {
    const propType = schema[k]
    if (propType['unique']) {
      uniqueProps.push(k)
      delete propType['unique']
    }
  }
  return uniqueProps
}