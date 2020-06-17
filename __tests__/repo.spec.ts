// import faker from 'faker';
import mongoose, { Connection } from "mongoose";
import { BaseRepository } from '../src/base.repo';
import { defaultMongoOpts } from '../src/connect';
import { repeat } from "./helpers";
import { createTestObject, TestModel, TestModelSchema } from './mocks/data';
import { DuplicateModelError } from '../src/errors';

describe("Base Repository", () => {
  let dataRepo: BaseRepository<TestModel>;
  let conn: Connection;

  beforeAll(async () => {
    conn = await mongoose.createConnection("mongodb://localhost:27017/bucket-tests", defaultMongoOpts);
    dataRepo = new BaseRepository(conn, "TestModel", TestModelSchema);
  });

  afterAll(async () => {
    await conn.close();
  });

  afterEach(async () => {
    await dataRepo.truncate({});
  });

  describe("Repo should be able to CREATE documents", () => {
    it("should create a single document in the database", async () => {
      const obj = await createTestObject();

      const repoObj = await dataRepo.create(obj);
      expect(obj.testProp).toBe(repoObj.testProp);
    });

    it("should create an array of documents in the database", async () => {
      const objs = <TestModel[]>await repeat(3, createTestObject);

      const repoObjs = await dataRepo.create(objs);
      expect(repoObjs).toBeInstanceOf(Array);
      expect(repoObjs.length).toBe(3);
    });

    it("should throw DuplicateModelError when duplicates are added to the database", async () => {
      const obj = <TestModel>await createTestObject();
      await dataRepo.create(obj);
      try {
        await dataRepo.create(obj);
      } catch (error) {
        expect(error).toBeInstanceOf(DuplicateModelError);
      }
    });
  });
});