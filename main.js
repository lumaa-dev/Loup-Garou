const Discord = require("discord.js");
const config = require("./functions/config.json");
const { fixRoles, addMinutesToTimestamp } = require("./functions/dev");

const { createClient, setStatus } = require("./functions/js/client");
const { initiate, showHelp, selectHelpMenu } = require("./functions/js/cmds");
const { smartEval } = require("./functions/js/other");
const { setUp } = require("./functions/lg/game");
const { buttons, commands, select } = require("./functions/lg/interactions");
const { sendWarn } = require("./functions/lg/other");

require("./functions/all");

const client = createClient([
	Discord.Intents.FLAGS.GUILDS,
	Discord.Intents.FLAGS.GUILD_MESSAGES,
	Discord.Intents.FLAGS.GUILD_MEMBERS,
	Discord.Intents.FLAGS.GUILD_INVITES,
	Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
]);

var game = setUp();

/* 
	entre 20-25 joueurs max
	mute lorsque c'est la nuit + ouvrir un text pour les loups
	vote avec menu (25 max)
	dirs[5] > fichier principal (./?)
 */

client.once("ready", () => {
	setStatus(client, "Loup-Garou", "PLAYING");
	console.log(`${client.user.tag} is ready`);
});

client.on("interactionCreate", async (interaction) => {
	try {
		if (interaction.isCommand() && interaction.channel.type !== "DM") {
			console.log(
				`${interaction.member.user.tag} > /${interaction.commandName}`
			);
			if (interaction.commandName === "help") {
				showHelp(
					interaction,
					interaction.member.user,
					true,
					"Séléctionnez en dessous la commande que vous cherchez"
				);
			} else if (interaction.commandName === "temp") {
				await addMinutesToTimestamp(interaction);
			} else if (interaction.commandName === "eval") {
				smartEval(
					interaction,
					interaction.options?.get("code").value,
					true,
					game,
					client
				);
			} else {
				commands(client, interaction, game);
			}
		} else if (interaction.isButton()) {
			buttons(client, interaction, game);
		} else if (interaction.isSelectMenu()) {
			if (interaction.customId === "helpcmds") {
				selectHelpMenu(interaction);
			} else {
				select(client, interaction, game);
			}
		} else if (interaction.isContextMenu()) {
			//menu du clique droit
		}
	} catch (e) {
		console.log(e);
		const errorMsg = {
			content: sendWarn(config.lg.messages.warnMessages.codeError),
			ephemeral: true,
		};
		if (interaction.deferred || interaction.replied) {
			interaction.editReply(errorMsg);
		} else {
			interaction.reply(errorMsg);
		}
	}
});

client.on("messageCreate", async (message) => {
	await initiate(client, message);
});

client.on("rateLimit", (info) => {
	console.log(info);
	console.log("Ratelimited!");
});

client.login(require("./functions/token.json").token);
