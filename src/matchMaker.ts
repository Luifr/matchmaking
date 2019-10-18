export interface IMatchMakerOptions {
	checkInterval?: number;
	maxMatchSize?: number;
	minMatchSize?: number;
}


export class Matchmaker {

	protected resolver: (players: any[]) => void;
	protected getKey: (player: any) => string;
	protected queue: any[];

	checkInterval: number; // Time to check for players, value in milliseconds defaults to 5000
	maxMatchSize: number;
	minMatchSize: number;

	get playersInQueue(): number {
		return this.queue.length;
	}

	constructor(resolver: (players: any[]) => void, getKey: (player: any) => string, options?: IMatchMakerOptions) {
		this.resolver = resolver;
		this.getKey = getKey
		this.queue = [];

		this.checkInterval = (options && options.checkInterval && options.checkInterval > 0 && options.checkInterval) || 5000;
		this.maxMatchSize = (options && options.maxMatchSize && options.maxMatchSize > 0 && options.maxMatchSize) || 2;
		this.minMatchSize = (options && options.minMatchSize && options.minMatchSize > 0 && options.minMatchSize) || this.maxMatchSize;

	}

	public push = (player: any) => {
		let playerKey = this.getKey(player);
		if (this.queue.find((player) => { return this.getKey(player) == playerKey; }))
			throw "User already in queue";
		this.queue.push(player);
	}

	public leaveQueue(player: any) {
		let playerKey = this.getKey(player);
		let index = this.queue.findIndex((player) => { return this.getKey(player) == playerKey; });
		if (index == -1)
			throw "User not in queue";
		this.queue.splice(index, 1);
	}

}