
import { FifoMatchmaker } from './fifo';
import { LobbyMaker } from './lobby';

export { FifoMatchmaker, LobbyMaker };

// function runGame(players: any[]) { // GAME TEST
// 	console.log("Game started with:");
// 	console.log(players);
// }

// LOBBY TEST //////////////////////////////////////////////////////////
// let lobby = new LobbyMaker(runGame, (player) => { return player.id });

// lobby.createRoom({ id: 20 }, "Sala 0");
// lobby.createRoom({ id: 21 }, "Sala 0");
// lobby.createRoom({ id: 20 }, "Sala 0");

// let id = lobby.createRoom({ id: 22 }, "Bacon", { password: "bacon" });
// lobby.createRoom({ id: 25 }, "Nao vo aparecer", { private: true });

// console.log(lobby.listRooms());
// lobby.joinRoom(id, { id: 21 }, "bacon");
// console.log(lobby.listRooms());
// lobby.leaveRoom(id, { id: 22 });
// lobby.leaveRoom(id, { id: 21 });
// console.log(lobby.listRooms());
// lobby.startGame(id);
////////////////////////////////////////////////////////////////////////



// FIFO TEST ////////////////////////////////
// let mm = new FifoMatchmaker(runGame, p => p.id, { checkInterval: 2000, maxMatchSize: 3, minMatchSize: 2 });
// mm.push({ id: 1 });
// mm.push({ id: 2 });
// mm.push({ id: 3 });
// mm.push({ id: 4 });
// mm.push({ id: 5 });

// setTimeout(() => mm.push({ id: 2 }), 4000);
// setTimeout(() => mm.push({ id: 2 }), 4000);
//////////////////////////////////////////////