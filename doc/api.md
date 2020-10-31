# Api Reference

## Player

- The player will be mentioned here
- By player i mean a generic object
  - As use in the example above, just a plain object with an id
  - The player can be anything and depends on your project/game

## FifoMatchmaker

- `constructor(resolver, getKey, options)`
  - `resolver(players)` - A function that will be called whenever there are enough players to start a game
    - `players` - a array with all the players in that game
  - `getKey(player)` - A function that will extract the id of a player
    - `player` - The player whose id will be extrected
  - `options` - [OPTIONAL] - A object with settings for the matchmaker
    - `checkInterval` - The interval in milliseconds to try to start new games
    - `maxMatchSize` - Maximum number of players in a room
    - `minMatchSize` - Minimum number of players in a room
- `push(player)`
  - `parameters`
    - `player` - The object containing all player information
  - `return`
    - void
- `leaveQueue(player)`
  - `parameters`
    - `player` - The player with its ID
  - `return`
    - void

## LobbyMaker

- [LobbyMaker](#LobbyMaker)
  - [new LobbyMaker(startCallback, getPlayerKey)](#LobbyMaker+new)
  - instance
    - [createLobby(newPlayer, lobbyName, [options])](#LobbyMaker+createLobby) ⇒ `Lobby<T>`
    - [getLobby()](#LobbyMaker+getLobby) ⇒ `void`
    - [joinPlayerInLobby()](#LobbyMaker+joinPlayerInLobby) ⇒ `void`
    - [joinPlayerInLobbyByName()](#LobbyMaker+joinPlayerInLobbyByName) ⇒ `void`
    - [startGame()](#LobbyMaker+startGame) ⇒ `void`
    - [removePlayerFromLobby()](#LobbyMaker+removePlayerFromLobby) ⇒ `void`
    - [deleteLobby()](#LobbyMaker+deleteLobby) ⇒ `void`
    - [listLobbies()](#LobbyMaker+listLobbies) ⇒ `void`

<a name="LobbyMaker+new" ></a>

### new LobbyMaker(startCallback, getKey)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| startCallback | (player: T[]) => void | | The callback function that will run whenever the game starts |
| getPlayerKey | (player: T) => string | | Auxiliar function that gets a unique identifier from a player |

<a name="LobbyMaker+new" ></a>

### createLobby(newPlayer, lobbyName, [options]) ⇒ `Lobby<T>`

Create a new lobby and returns it

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| newPlayer | T | | The host of the lobby |
| lobbyName | string | | The name of the lobby, to be shown on a lobby list for exemple |
| [options.maxLobbySize] | number | 2 | The maximum number os players in a lobby |
| [options.minLobbySize] | number | 2 | The minimum number os players in a lobby needed to start a game |
| [options.password] | string | "" | Password needed to join a lobby |
| [options.private] | boolean | false | Private lobbies wont be listed in public matches, but can be joined by id or name |
| [options.canBeJoinedInMatch] | boolean | false | Players can join this lobby even after the match has started |
| [options.autoStartWithMinSize] | boolean | false | Causes the match to start automatically when the minimum number of player has been reached |
| [options.autoStartWithMaxSize] | boolean | false | Causes the match to start automatically when the lobby is full |
| [options.autoDeleteWhenEmpty] | boolean | false | If the last player leaves the lobby it gets deleted |
| [options.tags] | string \| string[] | | Initialises the lobby with some tags, they can be used to filter lobbies by type, mode or anything else |


- `leaveRoom = (roomId, player)`
  - `parameters`
    - `roomId` - The room to be leaved
    - `player` - The player that will leave the room
- `deleteRoom(roomId)`
  - `parameters`
    - `roomId` - The room id that will be deleted
  - `return`
    - void
- `listRooms()`
  - `return`
    - `RoomInfo[]` - A array of RoomInfo objects, each containing: {id, name, passwordIsRequired, currentPlayers, MaxPlayers}
- `joinRoom(roomId, newPlayer, password)`
  - `parameters`
    - `roomId` - Room to be joined
    - `newPlayer` - the player object that will join
    - `password` - [OPTIONAL] - If the room require password
- `startGame(roomId)`
  - `parameters`
    - `roomId` - The room to start the game, this will call the `resolver` function passed in constructor
  - `return` - void

---
