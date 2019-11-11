# bucket

Bucket is a collection of handy CRUD methods for working with Mongoose.

## How to install

`yarn add @random-guys/bucket`

## How does it work

Buket exposes a suite of useful classes and interfaces that make CRUD operations a breeze. Simply import the service(s) you need.

## Quick Start

You need to have a model that maps to your Mongoose collection and a Repository to be used in your Controller. Let's go into detail.

Based on the logic of your project you have an interface that will be the basic data unit, say:

```ts
import { Model } from '@random-guys/bucket';

export interface Person extends Model {
  name: string;
  age: string;
}
```

The imported Model adds extra columns `created-at`, `deleted_at` and `updated_at` to your model.

Next up is the Mongooose Schema using the `SchemaFactory`:

```ts
import { Schema } from 'mongoose';
import { SchemaFactory } from '@random-guys/bucket'

export const PersonSchema = SchemaFactory({
  name: {
    type: typeof Schema.Types.String;
    trim: boolean;
  },
  age: {
    type: typeof Schema.Types.String;
    trim: boolean;
  }
});
```

This creates a Schema object of the type `Schema<Model>`. You just add your properties based on your model.

Next is to set up your Repository, which provides a set of methods for reading and writing from your Mongoose database:

```ts
import { Person } from './path/to/model';
import { PersonSchema } from './path/to/schema';
import { BaseRepository } from '@random-guys/bucket';
import mongoose from 'mongoose';

class PersonRepository extends BaseRepository<Person> {
  constructor() {
    super(mongoose, 'Person', PersonSchema);
  }
}

export const PersonRepo = new PersonRepository();
```

The PersonRepo can be used in your controller (or wherever) to carry out CRUD operations on a particular mongoose collection:

```ts
import { PersonRepo } from './path/to/repo';

//other code
const person = await PersonRepo.byID(id));
```

With this, you can begin to make CRUD.

More details can be found in the documentation.
