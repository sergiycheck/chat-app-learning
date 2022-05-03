TODO: useBeforeUnload is not calling

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
