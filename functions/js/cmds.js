const Discord = require("discord.js");
const Embeds = require("./embeds");
const config = require("../config.json");
const { checkConfig } = require("./other");

module.exports = {
	showHelp(
		interaction,
		user,
		reply = true,
		description = "Select a command in the menu bellow\n\nThis bot is entirely new, and you might not get along with the commands, so that's why we made the `/help` better than ever!"
	) {
		options = [];
		let cmds = config.cmds.sort();
		cmds.forEach((cmd) => {
			let option = {
				label: `/${cmd.name}`,
				description: cmd.description,
				value: cmd.name,
			};
			options.push(option);
		});

		const helpEmbed = new Discord.MessageEmbed()
			.setTitle("Help Menu")
			.setColor(Embeds.randomColor())
			.setDescription(description)
			.setFooter(user.tag, user.displayAvatarURL({ dynamic: true }));

		const cmdMenu = new Discord.MessageActionRow().addComponents(
			new Discord.MessageSelectMenu()
				.setCustomId("helpcmds")
				.setPlaceholder("Select a command")
				.addOptions(options)
		);

		if (reply === true)
			interaction.reply({ embeds: [helpEmbed], components: [cmdMenu] });
		if (reply === false) {
			interaction.deferReply();
			interaction.deleteReply();
			interaction.channel.send({ embeds: [helpEmbed], components: [cmdMenu] });
		}
	},

	async selectHelpMenu(interaction, value = interaction.values[0]) {
		checkConfig();
		const cmdhelp = value;
		config.cmds.forEach((cmd) => {
			if (cmdhelp == cmd.name) {
				if (typeof cmd.options !== "undefined") {
					output = "";
					cmd.options.forEach((option) => {
						if (option.required === true) {
							output = `${output} ${option.name} [Arg]`;
						}
					});
					var example = `${output}`;
				} else {
					var example = "";
				}
				cmdEmbed = new Discord.MessageEmbed()
					.setTitle(`/${cmd.name}`)
					.setDescription(
						`Description: \`${cmd.description}\`\nExample: \`/${cmd.name}${example}\``
					);
			}
		});
		if (typeof cmdEmbed !== "undefined") {
			interaction.reply({
				content: `Informations on /${cmdhelp}`,
				embeds: [cmdEmbed],
				ephemeral: true,
			});
			cmdEmbed = undefined;
		}
	},

	async initiate(client, message) {
		checkConfig();
		if (
			message.author.id === config.ownerId &&
			message.content === `${config.devPrefix}deploy`
		) {
			var a = [];
			config.cmds.forEach((cmd) => {
				a.push(cmd);
			});
			config.cmdsAdmin.forEach((cmd) => {
				a.push(cmd);
			});
			await client.guilds.cache.get(message.guild.id)?.commands.set(a);
			console.log("Initialized all commands");
			message.react("✅");
		} else if (
			message.author.id === config.ownerId &&
			message.content === `${config.devPrefix}gdeploy`
		) {
			await client.application?.commands.set(config.cmds);
			console.log("Initialized everywhere default commands");
			message.react("✅");
		}
	},
};
