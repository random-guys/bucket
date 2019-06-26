import { Model } from "../model";
import { BaseRepository } from "./base.repo";
import { Schema } from "mongoose";
import { Query, PaginationQuery } from "./contracts";

/**
 * A wrapper around a normal repo to for company restraints on all
 * `Repository` APIs.
 */
export class RentedRepository<T extends Model> {
  protected readonly repo: BaseRepository<T>

  constructor(name: string, private key: string, schema: Schema) {
    this.repo = new BaseRepository(name, schema)
  }

  /**
   * Limit query based on the base property
   * @param value restraining property
   * @param condition query to extends
   */
  protected attachKey(value: string, condition: string | object) {
    if (typeof (condition) === 'string') {
      return { _id: condition, [this.key]: value }
    }
    return { ...condition, [this.key]: value }
  }

  create(key: string, data: object | object[]) {
    if (Array.isArray(data)) {
      data.forEach(d => {
        d[this.key] = key
      })
    } else {
      data[this.key] = key
    }

    return this.repo.create(data)
  }

  upsert(key: string, query: string | object, data: any) {
    data[this.key] = key
    return this.repo.upsert(this.attachKey(key, query), data)
  }

  byID(key: string, id: string, projections?: any, archived?: boolean) {
    return this.byQuery(key, { _id: id }, projections, archived)
  }

  byQuery(key: string, query: any, projections?: any, archived?: boolean) {
    query[this.key] = key
    return this.repo.byQuery(query, projections, archived)
  }

  all(key: string, query?: Query) {
    query = query
      ? (query.conditions[this.key] = key, query)
      : { conditions: { [this.key]: key } }
    return this.repo.all(query)
  }

  list(key: string, query: PaginationQuery) {
    query.conditions[this.key] = key
    return this.repo.list(query)
  }

  update(
    key: string,
    query: string | object,
    update: object,
    throwOrNull = true
  ) {
    query = this.attachKey(key, query)
    return this.repo.update(query, update, throwOrNull)
  }

  atomicUpdate(
    key: string,
    condition: string | object,
    update: object,
    throwOrNull = true
  ) {
    condition = this.attachKey(key, condition)
    return this.repo.atomicUpdate(condition, update, throwOrNull)
  }

  remove(key: string, condition: string | object, throwOrNull = true) {
    condition = this.attachKey(key, condition)
    return this.repo.remove(condition, throwOrNull)
  }

  destroy(key: string, condition: string | object, throwOrNull = true) {
    condition = this.attachKey(key, condition)
    return this.repo.destroy(condition, throwOrNull)
  }
}