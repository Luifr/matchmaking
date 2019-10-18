import { Matchmaker, IMatchMakerOptions } from './matchMaker'

interface IFifoMatchMakerOptions extends IMatchMakerOptions {

}

export class FifoMatchmaker extends Matchmaker {

	constructor(resolver: (players: any[]) => void, getKey: (player: any) => string, options?: IFifoMatchMakerOptions) {
		super(resolver, getKey, options);

		setInterval(this.FifoMatch, this.checkInterval);
	}

	private FifoMatch = (): void => {
		let players: any[];
		while (this.queue.length >= this.minMatchSize) {
			players = [];
			while (this.queue.length > 0 && players.length < this.maxMatchSize) {
				players.push(this.queue.pop());
			}
			this.resolver(players);
		}
	}

}