import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { Express } from 'express';

console.log(`process.env.NODE_ENV`, process.env.NODE_ENV);

async function connectToDb() {
  const connectionStr = process.env.MONGO_DB_ATLAS_CONN;
  try {
    console.log('connectionStr', connectionStr);
    await mongoose.connect(connectionStr);
    if (process.env.NODE_ENV === 'dev') mongoose.set('debug', { shell: true });
  } catch (error) {
    console.error(error);
  }
}

const PORT = process.env.PORT;

connectToDb().then(async () => {
  const { server } = (await import('./server')) as unknown as { server: Express };
  server.listen(PORT, () => {
    console.log('listening on *:' + PORT);
  });
});
