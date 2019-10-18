export interface IMatchMakerOptions {
	checkInterval?: number;
	maxMatchSize?: number;
	minMatchSize?: number;
}


export class Matchmaker {

	resolver: (...players: any[]) => void;
	protected queue: any[];
	checkInterval: number; // Time to check for players, value in milliseconds defaults to 5000
	maxMatchSize: number;
	minMatchSize: number;

	get playersInQueue(): number {
		return this.queue.length;
	}

	constructor(resolver: (players: any[]) => void, options?: IMatchMakerOptions) {
		this.resolver = resolver;
		this.queue = [];

		this.checkInterval = (options && options.checkInterval && options.checkInterval > 0 && options.checkInterval) || 5000;
		this.maxMatchSize = (options && options.maxMatchSize && options.maxMatchSize > 0 && options.maxMatchSize) || 2;
		this.minMatchSize = (options && options.minMatchSize && options.minMatchSize > 0 && options.minMatchSize) || this.maxMatchSize;

	}

	public push = (player: any) => {
		this.queue.push(player);
	}

}