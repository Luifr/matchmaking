import { Matchmaker, IMatchMakerOptions } from './matchMaker'

interface IFifoMatchMakerOptions extends IMatchMakerOptions {

}


export class FifoMatchmaker extends Matchmaker {

	constructor(resolver: (...players: any[]) => void, options?: IFifoMatchMakerOptions) {
		super(resolver, options);

		setInterval(this.FifoMatch, this.checkInterval);
	}

	FifoMatch = () => {
		let players = [];
		if (this.queue.length < this.minMatchSize)
			return;
		while (this.queue.length > 0 && players.length < this.maxMatchSize) {
			players.push(this.queue.pop());
		}
		this.resolver(players);
	}

}