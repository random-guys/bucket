import { Db, MongoClient } from "mongodb";

export async function up(db: Db, conn: MongoClient) {
  // TODO write your migration here.
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
}

export async function down(db: Db, conn: MongoClient) {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}
