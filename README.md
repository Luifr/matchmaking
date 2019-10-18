# Matchmaking

Matchmaking will help you to create matches!

### Installing

```
npm i matchmaking
```
---
## How to use

####LobbyMaker

With this class you can create, list and join lobbies
They can have password or be private (joined by name)

```
const { LobbyMaker } = require('matchmaking');

function runGame(players) {
	console.log("Game started with:");
	console.log(players);
}

function getPlayerKey(player){
	return player.id;
}

let lobby = new LobbyMaker(runGame, getPlayerKey);

let player1 = { id:20 }
let player2 = { id:21 }

// Create a room
let id = lobby.createRoom(player1, "Room 0");

// Other player joined the room
lobby.joinRoom(id, player2);

// Start game
lobby.start(id);

// Game started with:
// [ {id:20}, {id:21} ]

```

####FifoMatchMaker

This one is really simple, just push players to the queue, and games will be started automatically!

```
const { FifoMatchmaker } = require('matchmaking');

function runGame(players) {
	console.log("Game started with:");
	console.log(players);
}

let mm = new FifoMatchmaker(runGame, { checkInterval: 2000 });

let player1 = { id:1 }
let player2 = { id:2 }

// Players join match queue
mm.push(player1);
mm.push(player2);

// When there are enough players, runGame will be called

// Game started with:
// [ {id:1}, {id:2} ]

```
---
## Api

#### Player

- The player will be mentioned a lot here
- By player i mean a generic object
	- As use in the example above, just a plain object with an id
	- The player can be anything and depends on your project/game

#### FifoMatchmaker

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

#### LobbyMaker
- `constructor(resolver, options)`
	- `parameters`
		- `resolver(players)` - A function that will be called manualy or automatically when there are enough players to start a game, if this options hass been set
			- `players` - a array with all the players in that game
		- `getKey(player)` - A function that given a player, returns its unique identifier (id)
- `createRoom(player, roomName, options)`
	- `parameters`
		- `player` - The object containing all player information
		- `roomName` - The name to be displayed in room listing
		- `options` - [OPTIONAL] - A object with settings for the matchmaker
			- `private` - Should this lobby appear in public listing?
			- `password` - If set, players will have to use this password to join the lobby, leavy empty to create a open lobby
			- `maxLobbySize` - Maximum number of players in a room
			- `minLobbySize` - Minimum number of players in a room
			- `autoStartWithMinSize` - If true, the lobby will autostart when MinSize is reached
			- `autoStartWithMaxSize` - If true, the lobby will autostart when lobby is full is reached
	- `return`
		- The unique room Identifier (number)
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

#### Error handling

- All functions that can return error, will do returning e Error object
	- To check for errors do the followig
		- mehtod() instanceof Error
		- [Error class documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Authors

* **Lui Franco Rocha**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details