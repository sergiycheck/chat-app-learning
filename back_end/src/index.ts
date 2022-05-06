import mongoose from 'mongoose';
import { Express } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const dev_db_local_url = 'mongodb://localhost/chat-app-server-db';

async function connectToDb() {
  const connectionStr = process.env.MONGO_DB_ATLAS_CONN;
  try {
    await mongoose.connect(connectionStr);

    mongoose.set('debug', { shell: true });
  } catch (error) {
    console.error(error);
  }
}

const PORT = 3020;

connectToDb().then(async () => {
  const { server } = (await import('./server')) as unknown as { server: Express };
  //
  server.listen(PORT, () => {
    console.log('listening on *:' + PORT);
  });
});
