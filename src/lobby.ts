interface ILobbyMakerSettings {
	maxLobbySize: number;
	minLobbySize: number;
	hasPassword: boolean;
	password: string
	autoStartWithMinSize: boolean;
	autoStartWithMaxSize: boolean;
}

export interface ILobbyMakerOptions {
	maxLobbySize?: number;
	minLobbySize?: number;
	hasPassword?: boolean
	password?: string;
	autoStartWithMinSize?: boolean;
	autoStartWithMaxSize?: boolean;
	useDefaultSettings?: boolean;
}

interface Room {
	players: any[];
	settings: ILobbyMakerSettings;
}

export class Lobbymaker {

	resolver: (...players: any[]) => void;
	protected rooms: Map<number, Room>;
	getKey: (player: any) => string; // key should be unique
	nextFreeId: number;

	constructor(resolver: (...players: any[]) => void, getKey: (player: any) => string, options?: ILobbyMakerOptions) {
		this.resolver = resolver;
		this.rooms = new Map<number, any>();
		this.getKey = getKey;
		this.nextFreeId = Number.MIN_SAFE_INTEGER;

	}

	public createRoom = (player: any, options?: ILobbyMakerOptions): number => {
		let settings: ILobbyMakerSettings = this.getRoomSettings(options);
		if (settings.hasPassword && settings.password == "")
			throw "Password cant be empty";
		this.rooms.set(this.nextFreeId, { players: [player], settings });
		return this.nextFreeId++;
	}

	public joinRoom = (roomId: number, newPlayer: any, password?: string) => {
		if (!this.rooms.has(roomId))
			throw "Room not found";
		//@ts-ignore
		let room: Room = this.rooms.get(roomId);
		if (room.settings.maxLobbySize == room.players.length)
			throw "Room is full";
		if (room.settings.hasPassword && (!password || password != room.settings.password))
			throw "Password problem";
		let newPlayerKey = this.getKey(newPlayer);
		for (let player of room.players) {
			if (this.getKey(player) == newPlayerKey) {
				throw "Player already in room"
			}
		}
		room.players.push(newPlayer);
		if (room.settings.minLobbySize <= room.players.length && room.settings.autoStartWithMinSize)
			this.start(roomId);
		else if (room.settings.maxLobbySize == room.players.length && room.settings.autoStartWithMaxSize)
			this.start(roomId);
	}

	public start = (roomId: any) => {
		if (!this.rooms.has(roomId))
			throw "Room not found";
		//@ts-ignore
		let room: Room = this.rooms.get(roomId);
		this.resolver(room.players);
	}

	private getRoomSettings(options?: ILobbyMakerOptions): ILobbyMakerSettings {
		if (!options || options.useDefaultSettings)
			return this.defaultSettings();

		let returnSetings: ILobbyMakerSettings = {
			autoStartWithMinSize: (options && options.autoStartWithMinSize) || false,
			autoStartWithMaxSize: (options && options.autoStartWithMaxSize) || false,
			hasPassword: (options && options.hasPassword) || false,
			password: (options && options.password) || "",
			maxLobbySize: (options && options.maxLobbySize && options.maxLobbySize > 0 && options.maxLobbySize) || 2,
			minLobbySize: (options && options.minLobbySize && options.minLobbySize > 0 && options.minLobbySize) || (options && options.maxLobbySize && options.maxLobbySize > 0 && options.maxLobbySize) || 2,
		};

		return returnSetings;
	}

	private defaultSettings(): ILobbyMakerSettings {
		let settings: ILobbyMakerSettings = {
			autoStartWithMinSize: false,
			autoStartWithMaxSize: false,
			hasPassword: false,
			password: "",
			maxLobbySize: 2,
			minLobbySize: 2
		};
		return settings
	}

}