const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");

hintData = [];

async function hints_scraper(hintType) {
  const response = await axios(
    "https://archipelago.gg/tracker/s64eygZrRw2dyEYgNxIhZg"
  );
  const html = await response.data;
  const $ = cheerio.load(html);
  const allRows = $("table#hints-table > tbody > tr");
  let hintData = [];
  allRows.each((index, element) => {
    const tds = $(element).find("td");
    hintData.push({
      finder: $(tds[0]).text(),
      receiver: $(tds[1]).text(),
      item: $(tds[2]).text(),
      location: $(tds[3]).text(),
      entrance: $(tds[4]).text(),
      found: $(tds[5]).text(),
    });
  });
  hintData.sort((a, b) => {
    return a.finder.localeCompare(b.finder);
  });

  if (hintType === "all") return hintData;
  else if (hintType === "found") {
    return hintData.filter((hint) => hint.found);
  } else if (hintType === "missing") {
    return hintData.filter((hint) => !hint.found);
  }
  // console.log(hintData);
  return hintData;
}

function hintsToEmbed(hints) {
  let embeds = [];
  const chunkSize = 5;
  for (let i = 0; i < hints.length; i += chunkSize) {
    const chunk = hints.slice(i, i + chunkSize);
    // console.log(chunk);
    const hintsEmbed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle(
        `Hints (Page ${~~(i / chunkSize) + 1} / ${Math.ceil(
          hints.length / chunkSize
        )})`
      );
    chunk.forEach((hint) => {
      hintsEmbed.addFields({
        name: `${hint.found ? ":green_square:" : ":red_square:"} ${
          hint.receiver
        }'s ${hint.item}`,
        value: `Chez ${hint.finder} a ${hint.location} ${
          hint.entrance ? `(${hint.entrance})` : ""
        }`,
      });
    });
    embeds.push(hintsEmbed);
  }
  return embeds;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hints")
    .setDescription("Sends either all hints, or one player's")
    .addStringOption((option) =>
      option
        .setName("hint")
        .setDescription("The hints you want")
        .addChoices(
          { name: "All", value: "all" },
          { name: "Found", value: "found" },
          { name: "Missing", value: "missing" }
        )
    ),
  async execute(interaction) {
    const hintType = interaction.options.getString("hint");
    const embeds = hintsToEmbed(
      await hints_scraper(hintType).then((hintData) => {
        // console.log(hintData);
        return hintData;
      })
    );
    await interaction.deferReply();
    const chunkSize = 5;
    for (let i = 0; i < embeds.length; i += chunkSize) {
      const chunk = embeds.slice(i, i + chunkSize);
      if (i === 0) {
        await interaction.editReply({ embeds: chunk });
      } else {
        await interaction.followUp({ embeds: chunk });
      }
    }
    // await interaction.reply({
    //   embeds: embeds,
    // });
  },
};
