import mongoose from 'mongoose';
import { Express } from 'express';

async function connectToDb() {
  const dev_db_url = 'mongodb://localhost/chat-app-server-db';
  try {
    await mongoose.connect(dev_db_url);

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
