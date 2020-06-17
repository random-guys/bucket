import { Schema, SchemaDefinition, SchemaOptions, SchemaTypes } from "mongoose";
import { Model } from "./base.model";
import { readMapper, timestamps, uuid } from "./utils.schema";

export const ArrayItemSchema = (schema: SchemaDefinition) => {
  return new Schema(schema, { _id: false });
};

export const SchemaFactory = <T extends Model>(
  schema: SchemaDefinition,
  options?: SchemaOptions,
  autoIndex: boolean = true
) => {
  if (!schema || Object.keys(schema).length === 0) {
    throw new Error("Please specify schema definition");
  }

  const { indexes, definition } = getUniqueProps(schema);

  const mongooseSchema = new Schema<T>(
    {
      ...definition,
      _id: { ...uuid },
      deleted_at: { type: SchemaTypes.Date }
    },
    {
      ...options,
      ...readMapper,
      ...timestamps,
      // @ts-ignore
      selectPopulatedPaths: false
    }
  );

  if (autoIndex) {
    for (const prop of indexes) {
      mongooseSchema.index({ deleted_at: 1, [prop]: 1 }, { unique: true });
    }
  }
  return mongooseSchema;
};

export function getUniqueProps(schema: SchemaDefinition) {
  const indexes = [];
  const newSchema: SchemaDefinition = {};

  Object.keys(schema).forEach(k => {
    const def = schema[k];
    if (def["unique"]) {
      // @ts-ignore
      const { unique, ...rest } = def;

      newSchema[k] = rest;
      indexes.push(k);
    } else {
      newSchema[k] = def;
    }
  });

  return { indexes, definition: newSchema };
}
