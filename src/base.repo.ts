import { Model as MongooseModel, Schema, Connection } from "mongoose";
import { Model } from "./base.model";
import { DuplicateModelError, ModelNotFoundError } from "./errors";
import { PaginationQuery, PaginationQueryResult, Query } from "./query";

export type MongooseNamespace = typeof import("mongoose");

/**
 * Base Repository class. Provides a CRUD API over Mongoose with some handy helpers.
 */
export class BaseRepository<T extends Model> {
  public readonly model: MongooseModel<T>;

  /**
   * Defines/retrieves a mongoose model using the provided collection `name` and schema definition
   * @param name Collection name
   * @param schema Schema definition
   */
  constructor(mongoose: Connection, public readonly name: string, schema: Schema) {
    this.model = mongoose.model<T>(name, schema);
  }

  /**
   *  Handles the case where a `_id` string is passed as a query
   * @param query string or object query
   */
  getQuery = (query: string | object) => {
    return typeof query === 'string' ? { _id: query } : query;
  };

  /**
   * Convert archived param to a mongo query
   * @param archived archived parameter
   */
  private isArchived(archived?: boolean | string) {
    return !!archived ? { $ne: undefined } : undefined;
  }

  /**
   * Creates one or more documets.
   * Throws a `DuplicateModelError` error if a unique field value is present in any of the documents to be created.
   *
   * @param attributes The document(s) to be created
   */
  create(attributes: object | object[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.model.create(attributes, (err: any, result: T) => {
        if (err && err.code === 11000)
          return reject(new DuplicateModelError(`${this.name} exists already`));

        if (err) return reject(err);

        resolve(result);
      });
    });
  }

  /**
   * Atomically update all the paths in `update` or create a new document
   * if the query fails.
   * @param query MongoDB query object or id string
   * @param update new prop-value mapping
   */
  upsert(query: string | object, update: object): Promise<T> {
    const _query = this.getQuery(query);

    return new Promise((resolve, reject) => {
      this.model.findOneAndUpdate(
        _query,
        { $set: update },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true
        },
        (err, result) => {
          if (err && err.code === 11000)
            return reject(
              new DuplicateModelError(`${this.name} exists already`)
            );

          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  /**
   * Finds a document by its id
   * Returns non-deleted documents by default i.e documents without a `deleted_at` field
   * @param _id Document id
   * @param projections Specifies which document fields to include or exclude
   * @param throwOnNull Whether to throw a `ModelNotFoundError` error if the document is not found. Defaults to true
   * @param archived Whether to return deleted files
   */
  byID(
    _id: string,
    projections?: string | object,
    throwOnNull = true,
    archived?: boolean
  ): Promise<T> {
    return this.byQuery({ _id }, projections, throwOnNull, archived);
  }

  /**
   * Finds a document using a specified query.
   * Returns non-deleted documents by default i.e documents without a `deleted_at` field
   * @param query MongoDB query object
   * @param projections Specifies which document fields to include or exclude
   * @param throwOnNull Whether to throw a `ModelNotFoundError` error if the document is not found. Defaults to true
   * @param archived Whether to return deleted files
   */
  byQuery(
    query: object,
    projections?: any,
    throwOnNull = true,
    archived?: boolean | string
  ): Promise<T> {
    const _query = {
      ...query,
      deleted_at: this.isArchived(archived)
    };

    return new Promise((resolve, reject) => {
      this.model
        .findOne(_query)
        .select(projections)
        .exec((err, result) => {
          if (err) return reject(err);

          if (throwOnNull && !result)
            return reject(new ModelNotFoundError(`${this.name} not found`));

          resolve(result);
        });
    });
  }

  /**
   * Finds all documents that match a specified query
   * @param query Repository query object
   */
  all(query: Query): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const conditions = {
        ...query.conditions,
        deleted_at: this.isArchived(query.archived)
      };

      const sort = query.sort || 'created_at';

      this.model
        .find(conditions)
        .select(query.projections)
        .sort(sort)
        .exec((err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
    });
  }

  /**
   * Finds all documents that match a specified query and returns paginated results.
   * @param query Repository pagination query object
   */
  list(query: PaginationQuery): Promise<PaginationQueryResult<T>> {
    return new Promise((resolve, reject) => {
      const page = Number(query.page) - 1 || 0;
      const per_page = Number(query.per_page) || 20;
      const offset = page * per_page;
      const sort = query.sort || 'created_at';

      const conditions = {
        ...query.conditions,
        deleted_at: this.isArchived(query.archived)
      };

      this.model
        .find(conditions)
        .limit(per_page)
        .select(query.projections)
        .skip(offset)
        .sort(sort)
        .exec((err, result) => {
          if (err) return reject(err);

          const PaginationQueryResult = {
            page: page + 1,
            per_page,
            sort,
            result
          };

          resolve(PaginationQueryResult);
        });
    });
  }

  /**
   * Non-atomically updates a single document that matches a particular query.
   * Does not support MongoDB operators. Calls mongoose `save` method internally which triggers the `save` hook.
   * @param query MongoDB query object or id string
   * @param update Update onbject
   * @param throwOnNull Whether to throw a `ModelNotFoundError` error if the document is not found. Defaults to true
   */
  update(
    query: string | object,
    update: object,
    throwOnNull = true
  ): Promise<T> {
    const _query = this.getQuery(query);

    return new Promise((resolve, reject) => {
      this.model.findOne(_query, (err, result) => {
        if (err) return reject(err);

        if (throwOnNull && !result)
          return reject(new ModelNotFoundError(`${this.name} not found`));

        result.set(update);

        result.save((err, updatedDocument) => {
          if (err && err.code === 11000)
            return reject(
              new DuplicateModelError(`${this.name} exists already`)
            );

          if (err) return reject(err);
          resolve(updatedDocument);
        });
      });
    });
  }

  /**
   * Atomically updates a single document that matches a particular condition and using MongoDB operators such as $inc, $set.
   * Uses the MongoDB `findOneAndUpdate` command so it does not trigger mongoose `save` hooks.
   * @param query MongoDB query object or id string
   * @param update Update object
   * @param throwOnNull Whether to throw a `ModelNotFoundError` error if the document is not found. Defaults to true
   */
  atomicUpdate(
    query: string | object,
    update: object,
    throwOnNull = true
  ): Promise<T> {
    const _query = this.getQuery(query);

    return new Promise((resolve, reject) => {
      this.model.findOneAndUpdate(
        _query,
        update,
        { new: true, runValidators: true },
        (err, result) => {
          if (err && err.code === 11000)
            return reject(
              new DuplicateModelError(`${this.name} exists already`)
            );

          if (err) return reject(err);
          if (throwOnNull && !result)
            return reject(new ModelNotFoundError(`${this.name} not found`));
          resolve(result);
        }
      );
    });
  }

  /**
   * Updates multiple documents that match a particular query
   * @param query MongoDB query object or id string
   * @param update Update onbject
   */
  updateAll(query: string | object, update: any): Promise<T[]> {
    const _query = this.getQuery(query);

    return new Promise((resolve, reject) => {
      this.model.updateMany(_query, update, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  /**
   * Soft deletes a document by creating a `deleted_at` field in the document. The update is performed by calling a MongoDB `findOneAndUpdate`
   * @param query MongoDB query object or id string
   * @param throwOnNull Whether to throw a `ModelNotFoundError` error if the document is not found. Defaults to true
   */
  remove(query: string | object, throwOnNull = true): Promise<T> {
    const update = {
      $set: {
        deleted_at: new Date()
      }
    };

    return this.atomicUpdate(query, update, throwOnNull);
  }

  /**
   * Permanently deletes a document by removing it from the collection(DB)
   * @param query MongoDB query object or id string
   * @param throwOnNull Whether to throw a `ModelNotFoundError` error if the document is not found. Defaults to true
   */
  destroy(query: string | object, throwOnNull = true): Promise<T> {
    return new Promise((resolve, reject) => {
      const _query = this.getQuery(query);

      this.model.findOneAndDelete(_query, (err, result) => {
        if (err) return reject(err);

        if (throwOnNull && !result)
          return reject(new ModelNotFoundError(`${this.name} not found`));

        resolve(result);
      });
    });
  }
}
