const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("test").setDescription("Test"),
  async execute(interaction) {
    await interaction.reply(client.data.items.toString());
  },
};
