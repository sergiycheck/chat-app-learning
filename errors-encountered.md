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

DONE: EventsTypes.user_enter_get_users hits faster than userModel.findOneAndUpdate <br/> operation ends. combine EventsTypes.chat_update_user and EventsTypes.user_enter_get_users
