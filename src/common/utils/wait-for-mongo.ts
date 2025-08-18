import { MongoClient } from 'mongodb';

const uri =
  process.env.MONGO_URI ||
  'mongodb://mongo1:27017,mongo2:27017,mongo3:27017/test?replicaSet=rs0';

async function waitForMongo() {
  console.log('⏳ Waiting for MongoDB replica set to be ready...');
  let connected = false;

  while (!connected) {
    try {
      const client = new MongoClient(uri);
      await client.connect();
      const admin = client.db().admin();
      const status = await admin.command({ replSetGetStatus: 1 });
      if (status.ok === 1) {
        console.log('✅ Replica set is ready!');
        connected = true;
      }
      await client.close();
    } catch (err) {
      console.log('🕒 MongoDB not ready yet, retrying in 2s...');
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

waitForMongo();
