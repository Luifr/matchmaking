
import { FifoMatchmaker } from './fifo';

let mm = new FifoMatchmaker(runGame, { checkInterval: 2000 });

function runGame(players: any[]) { // GAME TEST
	console.log("Game started with:");
	console.log(players);
}


// FIFO TEST
mm.push({ id: 1 });
mm.push({ id: 2 });
mm.push({ id: 3 });

setTimeout(() => mm.push({ id: 2 }), 4000);
// setTimeout(() => mm.push({ id: 2 }), 4000);