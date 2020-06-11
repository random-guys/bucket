import { BaseRepository } from '../src/base.repo';
import mongoose, { Connection } from "mongoose";
import { defaultMongoOpts } from '../src/connect';
import { TestModel, TestModelSchema } from './mocks/data';
import faker from "faker";

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
    await conn.dropDatabase();
  });

  it("should create a document in the database", async () => {
    const obj = {
      testProp: faker.random.uuid()
    }

    const testObj = await dataRepo.create(obj);
    console.log({ testObj });
  });
});