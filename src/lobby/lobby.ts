import {
  ILobbyPlayers,
  ILobbySettings,
  LobbyMaker
} from '.';

interface ILobyInput<P> {
  id: string;
  players: ILobbyPlayers<P>;
  name: string;
  tags?: string | string[];
  settings: ILobbySettings;
  lobbyMaker: LobbyMaker<P>;
}

export class Lobby<P> {

  /** Unique lobby id, composed of 5 letters */
  public id: string;
  /** A map of the current players in the lobby */
  public players: ILobbyPlayers<P>;
  /** The player that hosted the lobby
   * Can be undefined if no one joined the lobby while it was being created
  */
  public host?: P;
  /** The name of the lobby
   * Can be shown on the lobbies list
  */
  public name: string;
  /** Can be used to filter matches, use at your own imagination */
  public tags: string[] = [];
  /** Lobby settings */
  public settings: ILobbySettings;
  private lobbyMaker: LobbyMaker<P>;

  public isInMatch = false;

  constructor({
    id,
    players,
    name,
    settings,
    tags,
    lobbyMaker
  }: ILobyInput<P>) {
    this.id = id;
    this.players = players;
    this.name = name;
    this.settings = settings;
    this.lobbyMaker = lobbyMaker;

    if (tags) {
      if (typeof tags === 'string') {
        this.tags.push(tags);
      }
      else {
        this.tags.push(...tags);
      }
    }

    const playersArray = Object.values(players);
    if (playersArray.length === 1) {
      this.host = playersArray[0];
    }
  }

  public startMatch = () => {
    return this.lobbyMaker.startMatch(this.id).mapErr(this.mapLobbyError);
  }

  public addPlayer = (player: P) => {
    return this.lobbyMaker.joinPlayerInLobby(this.id, player).mapErr(this.mapLobbyError);
  }

  public removePlayer = (player: P) => {
    return this.lobbyMaker.removePlayerFromLobby(this.id, player).mapErr(this.mapLobbyError);
  }

  public closeLobby = () => {
    return this.lobbyMaker.deleteLobby(this.id);
  }

  public playersArray = () => {
    return Object.values(this.players);
  }

  public playersLength = () => {
    return Object.keys(this.players).length;
  }

  mapLobbyError = <T>(err: T) => err as Exclude<T, 'LOBBY_NOT_FOUND'>;

}