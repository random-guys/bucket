# bucket

Bucket is an implementation of the [Repository](https://martinfowler.com/eaaCatalog/repository.html) pattern over mongoose

## How to install

```shell
yarn add @random-guys/bucket
```

or

```
npm install @random-guys/bucket
```

## How does it work

Bucket is made up of 3 parts. An interface that defines the properties of the your model, a repository that defines basic operations and queries as well as custom ones, and a schema to help with conversion of types as well as validate input.

## Quick Start

Define the properties of your model

```ts
import { Model } from "@random-guys/bucket";

export interface Book extends Model {
  isbn: string;
  title: string;
  version: Version;
}

export interface Version {
  major: number;
  minor: number;
  patch: number;
}
```

`Model` is just an extension of mongoose's `Document` with support for timestamps as well as string(UUID) based id, \_id.

Then define a schema for your data using [SchemaTypes](https://mongoosejs.com/docs/schematypes.html) and custom schemas

```ts
import { SchemaTypes, SchemaDefinition } from "mongoose";
import { SchemaFactory } from "@random-guys/bucket";

const VersionSchema: SchemaDefinition = {
  major: { type: SchemaTypes.Number, default: 0 },
  minor: { type: SchemaTypes.Number, default: 1 },
  patch: { type: SchemaTypes.Number, default: 0 }
};

export const BookSchema = SchemaFactory({
  isbn: { type: SchemaTypes.String, trim: true },
  title: { type: SchemaTypes.String, trim: true },
  version: VersionSchema
});
```

`SchemaFactory` gives you automatic UUID for `_id`, the actual definitions for timestamps and a `toJSON` mapper.

Next, extend the `BaseRepository` which gives you access to generic operations and queries.

```ts
import { Book } from "./path/to/model";
import { BookSchema } from "./path/to/schema";
import { BaseRepository } from "@random-guys/bucket";
import mongoose from "mongoose";

class PersonRepository extends BaseRepository<Person> {
  constructor() {
    super(mongoose, "Person", PersonSchema);
  }
}

export const PersonRepo = new PersonRepository();
```

Now we are ready to use the DB.

```ts
import { PersonRepo } from './path/to/repo';
import { defaultMongoOpts } from '@random-guys/bucket';
import mongoose from 'mongoose';

await mongoose.connect(url, defaultMongoOpts)

const person = await PersonRepo.byID(id));
const people = await PersonRepo.all({});
```
