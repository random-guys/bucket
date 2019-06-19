import generateUUID from 'uuid/v4';
import { SchemaTypes } from 'mongoose';

/**
 * Removes _id field in subdocuments and allows virtual fields to be returned
 */
export const readMapper = {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret, options) => {
      delete ret._id;
      if (ret.password) delete ret.password;
      return ret;
    },
  },
};

/**
 * Defines timestamps fields in a schema
 */
export const timestamps = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

/**
 * Replaces the default mongoose id with a uuid string
 */
export const uuid = {
  type: SchemaTypes.String,
  default: generateUUID,
};

/**
 * Defines a schema type with a lowercased trimmed string
 */
export const trimmedLowercaseString = {
  type: SchemaTypes.String,
  trim: true,
  lowercase: true,
};

/**
 * Defines a schema type with a trimmed string
 */
export const trimmedString = {
  type: SchemaTypes.String,
  trim: true,
};

/**
 * Defines a schema type with a lowercased string
 */
export const lowercaseString = {
  type: SchemaTypes.String,
  lowercase: true,
};
