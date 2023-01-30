const { ArchipelagoClient, ItemsHandlingFlags } = require("archipelago.js");

const client = new ArchipelagoClient("archipelago.gg:54285");
const credentials = {
  game: "Rogue Legacy",
  name: "Pab",
  version: {
    major: 0,
    minor: 3,
    build: 7,
  },
  uuid: "testClient",
  items_handling: ItemsHandlingFlags.REMOTE_ALL,
};

client
  .connect(credentials)
  .then(() => {
    console.log(`Connected to room with ${client.data.players.size} players`);

    // client.locations.missing.forEach(missing_loc => console.log(client.locations.name(missing_loc)))
    // console.log(client.data.players)
    // console.log(client.data.items)
    console.log(client.data);
  })
  .catch(console.error);

client.addListener("print", (packet) => {
  console.log(packet.text);
});
