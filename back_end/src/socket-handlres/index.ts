import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Socket, Server } from 'socket.io';
import { roomJoinHandler } from './room-join-handler';
import { disconnectionHandlers } from './disconnection-handlers';
import { chatHandlers } from './chat-handlers';

const onConnection = (
  socket: Socket,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  roomJoinHandler(socket, io);
  disconnectionHandlers(socket);
  chatHandlers(socket, io);
};

export default onConnection;
