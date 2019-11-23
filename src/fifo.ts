import { Matchmaker, IMatchMakerOptions } from './matchMaker'

interface IFifoMatchMakerOptions extends IMatchMakerOptions {

}

export class FifoMatchmaker<P> extends Matchmaker<P> {

	constructor(resolver: (players: P[]) => void, getKey: (player: P) => string, options?: IFifoMatchMakerOptions) {
		super(resolver, getKey, options);

		setInterval(this.FifoMatch, this.checkInterval);
	}

	private FifoMatch = (): void => {
		let players: P[];
		while (this.queue.length >= this.minMatchSize) {
			players = [];
			while (this.queue.length > 0 && players.length < this.maxMatchSize) {
				players.push(this.queue.pop() as P);
			}
			this.resolver(players);
		}
	}

}