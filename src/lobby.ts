interface ILobbyMakerSettings {
	maxLobbySize: number;
	minLobbySize: number;
	password: string
	private: boolean;
	autoStartWithMinSize: boolean;
	autoStartWithMaxSize: boolean;
}

export interface ILobbyMakerOptions {
	maxLobbySize?: number;
	minLobbySize?: number;
	password?: string;
	private?: boolean;
	autoStartWithMinSize?: boolean;
	autoStartWithMaxSize?: boolean;
}

export interface RoomInfo {
	id: number;
	name: string;
	passwordIsRequired: boolean;
	currentPlayers: number;
	maxPlayers: number;
}

interface Room {
	players: any[];
	name: string;
	settings: ILobbyMakerSettings;
}

export class LobbyMaker {

	resolver: (...players: any[]) => void;
	protected rooms: Map<number, Room>;
	getKey: (player: any) => string; // key should be unique
	nextFreeId: number;

	constructor(resolver: (...players: any[]) => void, getKey: (player: any) => string) {
		this.resolver = resolver;
		this.rooms = new Map<number, any>();
		this.getKey = getKey;
		this.nextFreeId = Number.MIN_SAFE_INTEGER;

	}

	public createRoom = (player: any, roomName: string, options?: ILobbyMakerOptions): number => {
		let settings: ILobbyMakerSettings = this.getRoomSettings(options);
		this.rooms.set(this.nextFreeId, { players: [player], settings, name: roomName });
		return this.nextFreeId++;
	}

	public joinRoom = (roomId: number, newPlayer: any, password?: string) => {
		if (!this.rooms.has(roomId))
			throw "Room not found";
		//@ts-ignore
		let room: Room = this.rooms.get(roomId);
		if (room.settings.maxLobbySize == room.players.length)
			throw "Room is full";
		if (room.settings.password != "" && (!password || password != room.settings.password))
			throw "Password problem";
		let newPlayerKey = this.getKey(newPlayer);
		for (let player of room.players) {
			if (this.getKey(player) == newPlayerKey) {
				throw "Player already in room"
			}
		}
		room.players.push(newPlayer);
		if (room.settings.minLobbySize <= room.players.length && room.settings.autoStartWithMinSize)
			this.startGame(roomId);
		else if (room.settings.maxLobbySize == room.players.length && room.settings.autoStartWithMaxSize)
			this.startGame(roomId);
	}

	public joinRoomByName(roomName: string, newPlayer: any, password?: string) {
		for (let room of this.rooms) {
			let [id, { name }] = room;
			if (name == roomName) {
				this.joinRoom(id, newPlayer, password);
			}
		}
	}

	public startGame = (roomId: any) => {
		if (!this.rooms.has(roomId))
			throw "Room not found";
		//@ts-ignore
		let room: Room = this.rooms.get(roomId);
		if (room.settings.minLobbySize > room.players.length)
			throw "Lobby needs more players to start";
		this.resolver(room.players);
	}

	public deleteRoom = (roomId: number) => {
		this.rooms.delete(roomId);
	}

	public listRooms = (): RoomInfo[] => {
		let rooms: RoomInfo[] = [];

		for (let room of this.rooms) {
			let [id, { players, settings, name }] = room;
			if (settings.private)
				continue;
			rooms.push({ id, name, passwordIsRequired: settings.password != "", currentPlayers: players.length, maxPlayers: settings.maxLobbySize });
		}

		return rooms;
	}

	private getRoomSettings(options?: ILobbyMakerOptions): ILobbyMakerSettings {
		if (!options)
			return this.defaultSettings();

		let returnSetings: ILobbyMakerSettings = {
			autoStartWithMinSize: (options && options.autoStartWithMinSize) || false,
			autoStartWithMaxSize: (options && options.autoStartWithMaxSize) || false,
			password: (options && options.password) || "",
			private: (options && options.private) || false,
			maxLobbySize: (options && options.maxLobbySize && options.maxLobbySize > 0 && options.maxLobbySize) || 2,
			minLobbySize: (options && options.minLobbySize && options.minLobbySize > 0 && options.minLobbySize) || (options && options.maxLobbySize && options.maxLobbySize > 0 && options.maxLobbySize) || 2,
		};

		return returnSetings;
	}

	private defaultSettings(): ILobbyMakerSettings {
		let settings: ILobbyMakerSettings = {
			autoStartWithMinSize: false,
			autoStartWithMaxSize: false,
			password: "",
			private: false,
			maxLobbySize: 2,
			minLobbySize: 2
		};
		return settings
	}

}