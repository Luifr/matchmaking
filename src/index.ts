
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
// let id = lobby.createRoom({ id: 22 }, "Bacon", { password: "bacon" });
// lobby.createRoom({ id: 25 }, "Nao vo aparecer", { private: true });

// console.log(lobby.listRooms());
// lobby.joinRoom(id, { id: 21 }, "bacon");
// lobby.start(id);
////////////////////////////////////////////////////////////////////////



// FIFO TEST ////////////////////////////////
// let mm = new FifoMatchmaker(runGame, { checkInterval: 2000 });
// mm.push({ id: 1 });
// mm.push({ id: 2 });
// mm.push({ id: 3 });

// setTimeout(() => mm.push({ id: 2 }), 4000);
// setTimeout(() => mm.push({ id: 2 }), 4000);
//////////////////////////////////////////////