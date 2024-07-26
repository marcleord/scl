import io from 'socket.io-client';

const socket = io({ path: "/bridge" });

    
socket.onAnyOutgoing((event, args) => {
    console.log(`->>>>> EMITTED "${event}" `, args);
});

socket.onAny((event, args) => {
    console.log(` <<<<<<-- RECEIVED "${event}" `, args);
});

export default socket;