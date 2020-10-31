import {
  ILobbyPlayers,
  ILobbySettings,
  LobbyMaker
} from '.';

interface ILobyInput<T> {
  id: string;
  players: ILobbyPlayers<T>;
  name: string;
  tags?: string | string[];
  settings: ILobbySettings;
  lobbyMaker: LobbyMaker<T>;
}

export class Lobby<T> {

  /** Unique lobby id, composed of 5 letters */
  public id: string;
  /** A map of the current players in the lobby */
  public players: ILobbyPlayers<T>;
  /** The player that hosted the lobby
   * Can be undefined if no one joined the lobby while it was being created
  */
  public host?: T;
  /** The name of the lobby
   * Can be shown on the lobbies list
  */
  public name: string;
  /** Can be used to filter matches, use at your own imagination */
  public tags: string[] = [];
  /** Lobby settings */
  public settings: ILobbySettings;
  private lobbyMaker: LobbyMaker<T>;

  public isInMatch = false;

  constructor({
    id,
    players,
    name,
    settings,
    tags,
    lobbyMaker
  }: ILobyInput<T>) {
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
    if (playersArray.length == 1) {
      this.host = playersArray[0];
    }
  }

  public startGame = (): void => {
    this.lobbyMaker.startGame(this.id);
  }

  public addPlayer = (player: T) => {
    this.lobbyMaker.joinPlayerInLobby(this.id, player);
  }

  public removePlayer = (player: T): void => {
    this.lobbyMaker.removePlayerFromLobby(this.id, player)
  }

  public closeLobby = () => {
    this.lobbyMaker.deleteLobby(this.id);
  }

  public playersArray = () => {
    return Object.values(this.players);
  }

  public playersLength = () => {
    return Object.keys(this.players).length;
  }

}