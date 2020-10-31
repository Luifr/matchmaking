import {
  ILobbyPlayers,
  ILobbySettings,
  Lobby,
  LobbyCreateSettings
} from '.';
import { getRandomCharactersCode } from '../utils';

let errorMessages = {
  lobbyIsFull: "Lobby is full",
  lobbyNotFound: "Lobby not found",
  playerAlreadyInLobby: "Player already in lobby",
  playerNotInLobby: "Player is not in lobby",
  wrongPassword: "Wrong password",
  passwordRequried: "Password is required",
  morePlayersToStart: "Lobby needs more players to start",
  cantBeJoinedMidMatch: "Lobby is in match and cant be joined now",
  cantStartMatchInProgress: "Cant start a match that has already started"
};

export interface LobbyInfo {
  id: string;
  name: string;
  hostName?: string;
  passwordIsRequired: boolean;
  currentPlayers: number;
  maxPlayers: number;
}

interface IListLobbyFitler {
  /** Default is false */
  listPrivate: boolean;
  /** Default is true */
  listFull: boolean;
  /** Default is true */
  listEmpty: boolean;
  /** Default is true */
  listWithPassword: boolean;
  /** Only show lobbies that contain one of these tags */
  showTags: string[];
  /** Hide all lobbies that contains any of these tags */
  hideTags: string[];
}

// TODO check for duplicates in lobby name
// TODO expiry time
// TODO idle time
export class LobbyMaker<T> {

  protected lobbies: Map<string, Lobby<T>>;

  constructor(
    private startCallback: (players: T[]) => void,
    private getPlayerKey: (player: T) => string
  ) {
    this.lobbies = new Map<string, any>();
  }

  public createLobby = (newPlayer: T, lobbyName: string, options?: LobbyCreateSettings): Lobby<T> => {
    let playerKey = this.getPlayerKey(newPlayer);

    // for (let player of Array.from(this.lobbies.values()).map(val => val.players)) {
    //   if (this.getKey(player) == playerKey) {
    //     throw Error(errorMessages.playerAlreadyInLobby);
    //   }
    // }
    // TODO: check if player is in a lobby already

    let settings: ILobbySettings = this.getLobbySettings(options);

    let lobbyId = '';
    do {
      lobbyId = getRandomCharactersCode();
    } while(this.lobbies.has(lobbyId));

    const players: ILobbyPlayers<T> = {};
    players[playerKey] = newPlayer;

    const lobby = new Lobby({
      id: lobbyId,
      players,
      name: lobbyName,
      settings,
      lobbyMaker: this,
      tags: options?.tags
    });

    this.lobbies.set(lobbyId, lobby);

    return lobby;
  }

  getLobby = (lobbyId: string) => {
    if (!this.lobbies.has(lobbyId))
      throw Error(errorMessages.lobbyNotFound);
    return  this.lobbies.get(lobbyId);
  }

  public joinPlayerInLobby = (lobbyId: string, newPlayer: T, lobbyPassword?: string): void => {
    if (!this.lobbies.has(lobbyId))
      throw Error(errorMessages.lobbyNotFound);


    const lobby = this.lobbies.get(lobbyId)!;

    const correctLobbyPassword = lobby.settings.password;
    if (correctLobbyPassword) {
      if (!lobbyPassword) {
        throw Error(errorMessages.passwordRequried);
      }
      if (lobbyPassword != correctLobbyPassword) {
        throw Error(errorMessages.wrongPassword);
      }
    }

    const playersInLobby = lobby.playersLength();
    if (playersInLobby >= lobby.settings.maxLobbySize) {
      throw Error(errorMessages.lobbyIsFull);
    }

    if (lobby.isInMatch && !lobby.settings.canBeJoinedInProgress) {
      throw Error(errorMessages.cantBeJoinedMidMatch);
    }

    let newPlayerKey = this.getPlayerKey(newPlayer);
    for (let player of Object.values(lobby.players)) {
      if (this.getPlayerKey(player) == newPlayerKey) {
        throw Error(errorMessages.playerAlreadyInLobby);
      }
    } // TODO: extract this to method
    lobby.players[this.getPlayerKey(newPlayer)] = newPlayer;

    if (playersInLobby + 1 >= lobby.settings.minLobbySize && lobby.settings.autoStartWithMinSize) {
      this.startGame(lobbyId);
    }
    else if (playersInLobby + 1 >= lobby.settings.maxLobbySize && lobby.settings.autoStartWithMaxSize) {
      this.startGame(lobbyId);
    }
  }

  /** Join the first lobby with that name (the name is not unique!) */
  public joinPlayerInLobbyByName(lobbyName: string, newPlayer: T, lobbyPassword?: string) {
    for (let lobby of this.lobbies) {
      let [id, { name }] = lobby;
      if (name == lobbyName) {
        this.joinPlayerInLobby(id, newPlayer, lobbyPassword);
        break;
      }
    }
  }

  public startGame = (lobbyId: any): void => {
    if (!this.lobbies.has(lobbyId))
      throw Error(errorMessages.lobbyNotFound);

    let lobby: Lobby<T> = this.lobbies.get(lobbyId) as Lobby<T>;
    if (lobby.settings.minLobbySize > lobby.playersLength()) {
      throw Error(errorMessages.morePlayersToStart);
    }
    if (lobby.isInMatch) {
      throw Error(errorMessages.cantStartMatchInProgress);
    }
    lobby.isInMatch = true;
    this.startCallback(Object.values(lobby.players));
  }

  public removePlayerFromLobby = (lobbyId: string, player: T | string): void => {
    let playerKey = this.getKeyFromPlayer(player);
    if (!this.lobbies.has(lobbyId)) {
      throw Error(errorMessages.lobbyNotFound);
    }
    let lobby = this.lobbies.get(lobbyId) as Lobby<T>;
    if (!lobby.players[playerKey]) {
      throw Error(errorMessages.playerNotInLobby);
    }
    delete lobby.players[playerKey];
    if (lobby.playersLength() == 0 && lobby.settings.autoDeleteWhenEmpty) {
      this.deleteLobby(lobbyId);
    }
  }

  public deleteLobby = (lobbyId: string) => {
    if (this.lobbies.has(lobbyId)) {
      this.lobbies.get(lobbyId)!.players = {};
      this.lobbies.delete(lobbyId);
    }
  }

  public listLobbies = (filters: Partial<IListLobbyFitler>): LobbyInfo[] => {
    let lobbies: LobbyInfo[] = [];

    for (let lobby of this.lobbies.values()) {
      if (lobby.settings.private && !filters.listPrivate) {
        continue;
      }

      const passwordIsRequired = lobby.settings.password != "";
      if (filters.listWithPassword === false && passwordIsRequired) {
        continue;
      }

      const currentPlayers = lobby.playersLength();
      const maxPlayers = lobby.settings.maxLobbySize;

      if (filters.listFull === false && currentPlayers >= maxPlayers) {
        continue;
      }
      if (filters.listEmpty === false && currentPlayers === 0) {
        continue;
      }


      if (filters.hideTags?.find(tag => lobby.tags.includes(tag))) {
        continue;
      }
      if (!filters.showTags?.find(tag => lobby.tags.includes(tag))) {
        continue;
      }

      lobbies.push({
        id: lobby.id,
        name: lobby.name,
        passwordIsRequired,
        currentPlayers,
        maxPlayers
      });
    }

    return lobbies;
  }

  private getKeyFromPlayer = (player: T | string): string => {
    return typeof player === 'string' ? player : this.getPlayerKey(player);
  }

  private getLobbySettings(options?: LobbyCreateSettings): ILobbySettings {
    if (!options)
      return this.defaultSettings();

    let returnSetings: ILobbySettings = {
      autoStartWithMinSize: (options && options.autoStartWithMinSize) || false,
      autoStartWithMaxSize: (options && options.autoStartWithMaxSize) || false,
      autoDeleteWhenEmpty: (options && options.autoDeleteWhenEmpty) || true,
      canBeJoinedInProgress: (options && options.canBeJoinedInProgress) || false,
      password: (options && options.password) || "",
      private: (options && options.private) || false,
      maxLobbySize: (options && options.maxLobbySize && options.maxLobbySize > 0 && options.maxLobbySize) || 2,
      minLobbySize: (options && options.minLobbySize && options.minLobbySize > 0 && options.minLobbySize) || (options && options.maxLobbySize && options.maxLobbySize > 0 && options.maxLobbySize) || 2,
    };

    return returnSetings;
  }

  private defaultSettings(): ILobbySettings {
    let settings: ILobbySettings = {
      autoStartWithMinSize: false,
      autoStartWithMaxSize: false,
      autoDeleteWhenEmpty: true,
      canBeJoinedInProgress: false,
      password: "",
      private: false,
      maxLobbySize: 2,
      minLobbySize: 2
    };
    return settings
  }

}