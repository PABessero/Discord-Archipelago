const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");

hintData = [];

async function hints_scraper() {
  const response = await axios(
    "https://archipelago.gg/tracker/pNTmlS7cRA-bvc4DUVxoqw"
  );
  const html = await response.data;
  const $ = cheerio.load(html);
  const allRows = $("table#hints-table > tbody > tr");
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
  // console.log(hintData);
  return hintData;
}

function hintsToEmbed(hints) {
  let embeds = [];
  const chunkSize = 25;
  for (let i = 0; i < hints.length; i += chunkSize) {
    const chunk = hints.slice(i, i + chunkSize);
    console.log(chunk);
    const hintsEmbed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle(
        `Hints (Page ${~~(i / chunkSize) + 1} / ${
          ~~(hints.length / chunkSize) + 1
        })`
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
    .setDescription("Sends either all hints, or one player's"),
  async execute(interaction) {
    const embeds = hintsToEmbed(
      await hints_scraper().then((hintData) => {
        return hintData;
      })
    );
    await interaction.reply({
      embeds: embeds,
    });
  },
};
