const { SlashCommandBuilder } = require("discord.js");
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
  tags: ["Discord"],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("Lists all connected users for Archipelago"),
  async execute(interaction) {
    await interaction.reply(
      await getPlayers().then(() => {
        let players = [];
        client.data.players.forEach((player, id) => {
          players.push(player.name);
        });
        client.disconnect();
        return players.toString();
      }, "error")
    );
  },
};

async function getPlayers() {
  return client.connect(credentials);
}
