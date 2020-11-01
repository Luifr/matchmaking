export { Lobby } from './lobby';
export { LobbyMaker } from './lobbyMaker';

export interface ILobbyPlayers<T> { [key: string]: T };

export interface ILobbySettings {
  maxLobbySize: number;
  minLobbySize: number;
  /** The lobby id is a random sequence of characters, the default length is 5 */
  idLength: number;
  /**If there is no password it equals to "" */
  password: string
  private: boolean;
  /** Can a player join this lobby if it is currenty in a match? */
  canBeJoinedInProgress: boolean;
  /** When a player join, should the match start if we have the minimum player count? */
  autoStartWithMinSize: boolean;
  /** When a player join, should the match start if the lobby is full? */
  autoStartWithMaxSize: boolean;
  /** If a player leaving causes the lobby to get empty, should it be deleted? */
  autoDeleteWhenEmpty: boolean;
}

export type LobbyCreateSettings = Partial<ILobbySettings> & { tags?: string | string[] };
