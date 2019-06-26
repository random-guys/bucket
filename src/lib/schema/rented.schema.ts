import { SchemaDefinition } from "mongoose";
import { trimmedString, uniqueIndex } from "./utils";
import { getUniqueProps, SchemaFactory } from "./base.schema";


export function RentedSchema(key: string, schemaDef: SchemaDefinition) {
  schemaDef[key] = { ...trimmedString, required: true, index: true }

  // add indexes to new schema
  const schema = SchemaFactory(schemaDef, {}, false)
  for (const prop of getUniqueProps(schemaDef)) {
    uniqueIndex(schema, key, prop)
  }
  return schema
}