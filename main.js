const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");

const { ArchipelagoClient, ItemsHandlingFlags } = require("archipelago.js");

const fs = require("node:fs");
const path = require("node:path");

const { token, logChannel } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const APClient = new ArchipelagoClient("archipelago.gg:61345");
const APCredentials = {
  game: "",
  name: "Pab",
  version: {
    major: 0,
    minor: 3,
    build: 7,
  },
  uuid: "testClient",
  items_handling: ItemsHandlingFlags.REMOTE_ALL,
  tags: ["TextOnly"],
};

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

commandFiles.forEach((file) => {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        .yellow
    );
  }
});
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  APClient.connect(APCredentials)
    .then(() => {
      console.log(
        `Connected to room with ${APClient.data.players.size} players.`
      );

      APClient.addListener("print", (packet) => {
        console.log(packet.text);
        client.channels.cache.get(`${logChannel}`).send(packet.text);
      });
      APClient.addListener("printJSON", (packet) => {
        console.log(packet);
      });
    })
    .catch(console.error);
  // const testEmbed = new EmbedBuilder()
  //   .setColor(0x0099ff)
  //   .setTitle("This is a test embed")
  //   .setAuthor({ name: "Archipelago Integrator" })
  //   .addFields(
  //     { name: "Unchecked", value: ":red_square:" },
  //     { name: "Checked", value: ":white_check_mark:" }
  //   );
  // client.channels.cache.get(`${logChannel}`).send({ embeds: [testEmbed] });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.log(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
  // console.log(interaction);
});

client.login(token);
