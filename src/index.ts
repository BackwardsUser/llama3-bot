import { Client, Events, GatewayIntentBits, Guild, Message } from "discord.js";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { botMemory } from "./interfaces";
import { getResponse } from "./ollama";
import conf from "./data/config.json";
import * as ollama from "ollama";
import { join } from "node:path";
import { config } from "dotenv";
config();

const intents: GatewayIntentBits[] = [
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.Guilds
];

const serverDataFile = join(__dirname, 'data', 'serverdata.json');

const defaultMessage: ollama.Message = { role: "system", content: conf.BOT_DATA.PROGRAM_STRING };

// Contains the local server memory,
// storing each servers data for quick
// access while the server is running
let localServerMemory: botMemory[] = []; // :)

const client = new Client({ intents: intents });

client.once(Events.ClientReady, async (client) => {
  console.log(`Successfully logged in as ${client.user.tag}!`);
  readFromFile();
});

function checkServer(guild: Guild) {
  const guild_id = guild.id;
  if (serverInDatabase(guild_id))
    return;
  console.log(`${guild.name} does not have a memory slot, generating one!`);
  const item: botMemory = {
    guildID: guild_id,
    messages: [defaultMessage]
  }
  if (!Array.isArray(localServerMemory))
    return false;
  localServerMemory.push(item);
  lsmUpdate();
}

function lsmUpdate() {
  console.log("Writing local memory to file.");
  try {
    writeFileSync(serverDataFile, JSON.stringify(localServerMemory, null, 4));
    console.log("Successfully Wrote Memory to file.");  
  } catch (err) {
    if (err) console.log(err);
  }
}

async function readFromFile() {
  if (!existsSync(serverDataFile))
    writeFileSync(serverDataFile, JSON.stringify([]))
  const file = readFileSync(serverDataFile);
  const data = JSON.parse(file.toString());
  localServerMemory = data;
}

function serverInDatabase(guildID: string) {
  if (!Array.isArray(localServerMemory))
    return false;
  return localServerMemory.filter(memItem => memItem.guildID === guildID).length > 0;
}

function isBotCall(message: Message): boolean {
  return message.content.toLowerCase().startsWith(conf.BOT_DATA.PREFIX_LOWER);
}

client.on(Events.GuildUpdate, (oldGuild, newGuild) => {
  if (!newGuild)
    return;
  checkServer(newGuild);
})

client.on(Events.MessageCreate, async (message: Message) => {
  if (!message.guild) {
    message.reply("This message appears to be sent from outside a server.\nI am only configured to work in servers...");
    return;
  }
  checkServer(message.guild); // Check if server called has data file. Create one if not.
  if (!isBotCall(message) || message.author.bot) // Check if user is requesting the bot or if requester is a bot.
    return; // end code if not.

  const guilds = localServerMemory.filter(memItem => memItem.guildID === message.guildId);
  const thisGuild = guilds[0]; // Assume first because fuck you.

  thisGuild.messages.push({ role: "user", content: message.content.split(conf.BOT_DATA.PREFIX_LOWER).join("")})

  message.channel.sendTyping()
  const response = await getResponse(thisGuild.messages);
  if (!response || response == "")
    message.reply("Failed to get a response to your query, try again later.");
  message.reply(response);
  thisGuild.messages.push({ role: "assistant", content: response });
  lsmUpdate();
});

client.login(process.env.TOKEN);