# Matchmaking

Matchmaking will help you to create matches in games, chats or anything else you can imagine!

## Installing

```bash
npm i matchmaking
```

---

## How to use

[Api reference](https://github.com/Luifr/matchmaking/blob/master/doc/api.md)

### LobbyMaker

Create, list and join lobbies
They can have password or be private (joined by name or id)
With the third argument in the constructor you can customize the lobby settings

```js
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
let id = lobby.createLobby(player1, "Room 0");

// A player joined the room!
lobby.joinRoom(id, player2);

// Lets start the game
lobby.start(id);

// Game started with:
// [ {id:20}, {id:21} ]

```

### FifoMatchMaker

This one is really simple, just push players to the queue, and games will be started automatically!

```js
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

## Author

* **Lui Franco Rocha**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
