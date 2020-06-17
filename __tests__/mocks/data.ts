import { Model } from "../../src/base.model";
import { trimmedString } from '../../src/utils.schema';
import { SchemaFactory } from '../../src/base.schema';
import faker from 'faker';

export interface TestModel extends Model {
  testProp: string;
}

export const TestModelSchema = SchemaFactory({
  testProp: { ...trimmedString, required: true, unique: true }
});

export async function createTestObject() {
  return {
    testProp: faker.random.uuid()
  }
}