TODO: useBeforeUnload is not calling<br /> useBefore unload is not hitting on the server if we reload initially started page

````js
useBeforeUnload((e) => {
  console.log("calling before unload");
  socketRef.current?.emit(SocketEventsTypes.user_leave_room, {
    userId: socketClientWithData.currentUser?.id,
    roomName: rooms.chat_room,
  });
});
```js
````

DONE: EventsTypes.user_enter_get_users hits faster than userModel.findOneAndUpdate <br/> operation ends. combine EventsTypes.chat_update_user and EventsTypes.user_enter_get_users

messages "room chat room was created" and "socket lxa3zMCdey918vxIAAAQ has joined room chat room" doubling on page reload component mount on socket connected

TODO: messages're doubling on connection of the same socket

```js
io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
```
