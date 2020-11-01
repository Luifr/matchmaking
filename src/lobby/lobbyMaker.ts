import {
  ILobbyPlayers,
  ILobbySettings,
  Lobby,
  LobbyCreateSettings
} from '.';
import { err, ok, Result } from '../errorHandling';
import { getRandomCharactersCode } from '../utils';

export interface LobbyInfo {
  id: string;
  name: string;
  hostName?: string;
  isInMatch: boolean;
  passwordIsRequired: boolean;
  currentPlayers: number;
  maxPlayers: number;
}

interface IListLobbyFitler {
  /** Default is false */
  listPrivate: boolean;
  /** Default is false */
  listInMatch: boolean;
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
export class LobbyMaker<P> {

  protected lobbies: Map<string, Lobby<P>>;

  constructor(
    private startCallback: (players: P[]) => void,
    private getPlayerKey: (player: P) => string
  ) {
    this.lobbies = new Map<string, any>();
  }

  public createLobby = (
    newPlayer: P,
    lobbyName: string,
    options?: LobbyCreateSettings
  ): Result<Lobby<P>, 'PLAYER_ALRAEDY_IN_LOBBY'> => {
    const playerKey = this.getPlayerKey(newPlayer);

    for (const lobby of this.lobbies.values()) {
      if (this.isPlayerInALobby(lobby, playerKey)) {
        return err('PLAYER_ALRAEDY_IN_LOBBY');
      }
    }

    const settings: ILobbySettings = this.getLobbySettings(options);

    let lobbyId = '';
    do {
      lobbyId = getRandomCharactersCode(settings.idLength);
    } while (this.lobbies.has(lobbyId));

    const players: ILobbyPlayers<P> = {};
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

    return ok(lobby);
  }

  getLobby = (lobbyId: string): Result<Lobby<P>, 'LOBBY_NO_FOUND'> => {
    if (!this.lobbies.has(lobbyId)) {
      return err('LOBBY_NO_FOUND');
    }
    return ok(this.lobbies.get(lobbyId)!);
  }

  public joinPlayerInLobby = (lobbyId: string, newPlayer: P, lobbyPassword?: string): Result<undefined,
    'LOBBY_NO_FOUND' |
    'PASSWORD_REQUIRED' |
    'WRONG_PASSWORD' |
    'LOBBY_IS_FULL' |
    'CANT_JOIN_IN_PROGRESS' |
    'PLAYER_IS_ALREADY_IN_LOBBY'
  > => {
    if (!this.lobbies.has(lobbyId)) {
      return err('LOBBY_NO_FOUND');
    }

    const lobby = this.lobbies.get(lobbyId)!;

    const correctLobbyPassword = lobby.settings.password;
    if (correctLobbyPassword) {
      if (!lobbyPassword) {
        return err('PASSWORD_REQUIRED');
      }
      if (lobbyPassword != correctLobbyPassword) {
        return err('WRONG_PASSWORD');
      }
    }

    const playersInLobby = lobby.playersLength();
    if (playersInLobby >= lobby.settings.maxLobbySize) {
      return err('LOBBY_IS_FULL');
    }

    if (lobby.isInMatch && !lobby.settings.canBeJoinedInProgress) {
      return err('CANT_JOIN_IN_PROGRESS');
    }

    const newPlayerKey = this.getPlayerKey(newPlayer);
    if (this.isPlayerInALobby(lobby, newPlayerKey)) {
      return err('PLAYER_IS_ALREADY_IN_LOBBY');
    }
    lobby.players[this.getPlayerKey(newPlayer)] = newPlayer;

    if (playersInLobby + 1 >= lobby.settings.minLobbySize && lobby.settings.autoStartWithMinSize) {
      this.startMatch(lobbyId);
    }
    else if (playersInLobby + 1 >= lobby.settings.maxLobbySize && lobby.settings.autoStartWithMaxSize) {
      this.startMatch(lobbyId);
    }

    return ok(undefined);
  }

  /** Join the first lobby with that name (the name is not unique!) */
  public joinPlayerInLobbyByName(lobbyName: string, newPlayer: P, lobbyPassword?: string) {
    for (const lobby of this.lobbies) {
      const [id, { name }] = lobby;
      if (name === lobbyName) {
        this.joinPlayerInLobby(id, newPlayer, lobbyPassword);
        break;
      }
    }
  }

  public startMatch = (lobbyId: any): Result<undefined, 'LOBBY_NOT_FOUND' | 'NEED_MORE_PLAYERS_TO_START' | 'MATCH_HAS_ALREADY_STARTED'> => {
    if (!this.lobbies.has(lobbyId)) {
      return err('LOBBY_NOT_FOUND');
    }

    const lobby: Lobby<P> = this.lobbies.get(lobbyId) as Lobby<P>;
    if (lobby.settings.minLobbySize > lobby.playersLength()) {
      return err('NEED_MORE_PLAYERS_TO_START');
    }
    if (lobby.isInMatch) {
      return err('MATCH_HAS_ALREADY_STARTED');
    }
    lobby.isInMatch = true;
    this.startCallback(Object.values(lobby.players));

    return ok(undefined);
  }

  public removePlayerFromLobby = (lobbyId: string, player: P | string): Result<undefined, 'LOBBY_NOT_FOUND' | 'PLAYER_NOT_IN_LOBBY'> => {
    const playerKey = this.getKeyFromPlayer(player);
    if (!this.lobbies.has(lobbyId)) {
      return err('LOBBY_NOT_FOUND');
    }
    const lobby = this.lobbies.get(lobbyId) as Lobby<P>;
    if (!lobby.players[playerKey]) {
      return err('PLAYER_NOT_IN_LOBBY');
    }
    delete lobby.players[playerKey];
    if (lobby.playersLength() === 0 && lobby.settings.autoDeleteWhenEmpty) {
      this.deleteLobby(lobbyId);
    }
    return ok(undefined);
  }

  public deleteLobby = (lobbyId: string) => {
    if (this.lobbies.has(lobbyId)) {
      this.lobbies.get(lobbyId)!.players = {};
      this.lobbies.delete(lobbyId);
    }
  }

  public listLobbies = (filters?: Partial<IListLobbyFitler>): LobbyInfo[] => {
    const lobbies: LobbyInfo[] = [];

    for (const lobby of this.lobbies.values()) {
      if (lobby.settings.private && !filters?.listPrivate) {
        continue;
      }

      const passwordIsRequired = lobby.settings.password != "";
      if (filters?.listWithPassword === false && passwordIsRequired) {
        continue;
      }

      const currentPlayers = lobby.playersLength();
      const maxPlayers = lobby.settings.maxLobbySize;

      if (filters?.listFull === false && currentPlayers >= maxPlayers) {
        continue;
      }
      if (filters?.listEmpty === false && currentPlayers === 0) {
        continue;
      }

      if (filters?.hideTags?.find(tag => lobby.tags.includes(tag))) {
        continue;
      }
      if (filters?.showTags && !filters?.showTags?.find(tag => lobby.tags.includes(tag))) {
        continue;
      }

      const isInMatch = lobby.isInMatch;
      if (isInMatch && !filters?.listInMatch) {
        continue;
      }

      lobbies.push({
        id: lobby.id,
        name: lobby.name,
        passwordIsRequired,
        isInMatch,
        currentPlayers,
        maxPlayers
      });
    }

    return lobbies;
  }

  private isPlayerInALobby = (lobby: Lobby<P>, playerKey: string) => {
    for (const player of Object.values(lobby.players)) {
      if (this.getPlayerKey(player) === playerKey) {
        return true;
      }
    }
    return false;
  }

  private getKeyFromPlayer = (player: P | string): string => {
    return typeof player === 'string' ? player : this.getPlayerKey(player);
  }

  private getLobbySettings(options?: LobbyCreateSettings): ILobbySettings {
    if (!options)
      return this.defaultSettings();

    const returnSetings: ILobbySettings = {
      autoStartWithMinSize: (options && options.autoStartWithMinSize) || false,
      autoStartWithMaxSize: (options && options.autoStartWithMaxSize) || false,
      idLength: (options && options.idLength && options.idLength > 0 && options.idLength) || 5,
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
    const settings: ILobbySettings = {
      autoStartWithMinSize: false,
      autoStartWithMaxSize: false,
      idLength: 5,
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