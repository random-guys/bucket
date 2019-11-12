# bucket

Bucket is a collection of handy CRUD methods for working with Mongoose with TypeScript.

## How to install

`yarn add @random-guys/bucket` or
`npm add @random-guys/bucket`

## How does it work

Bucket exposes a suite of useful classes and interfaces that make CRUD operations a breeze. This library was created to work with a model and repository pattern.

## Quick Start

You need to have a model that maps to your Mongoose collection and a Repository to be used in your Controller.

No matter the logic of your project you more than likely have an interface that will be the basic data unit, such as:

```ts
import { Model } from '@random-guys/bucket';

export interface Person extends Model {
  name: string;
  age: string;
}
```

The imported Model adds extra properties `created_at`, `deleted_at` and `updated_at` to your model.

Next up is creating the Mongooose [Schema](https://mongoosejs.com/docs/guide.html#definition). This can be done easily using Bucket's `SchemaFactory` method which, in addition to creating your Model, adds the code to include the properties that your model extended from Bucket's `Model`:

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

This creates a Schema object of the type `Schema<Model>` which represents a Mongoose [Model](https://mongoosejs.com/docs/models.html). You just add your properties to your model in the factory.

Next is to set up your Repository, which provides a set of methods for reading and writing from your Mongoose database. You can think of this as some abstraction/wrapper around your Mongoose [Document](https://mongoosejs.com/docs/documents.html):

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
const people = await PersonRepo.all({}); //this takes a query object. More on that later.
```

With this, you can begin to make CRUD operations.
