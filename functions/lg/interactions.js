const Discord = require("discord.js");
const { readyUp, credits } = require("./embeds");
const { createGame, forceEnd, getSessions, start, manage } = require("./game");
const {
	sendWarn,
	sendLoading,
	sendError,
	sendConfirmation,
} = require("./other");
const { lg } = require("../config.json");

const msg = lg.messages;

module.exports = {
	async buttons(client, interaction, game) {
		if (interaction.customId === "joinLg") {
			await interaction.reply({
				content: sendLoading(),
				ephemeral: true,
			});
			if (game.inGame(interaction.member.user) === true) {
				return interaction.editReply({
					content: sendError(msg.errorMessages.inSession),
					ephemeral: true,
				});
			} else {
				if (interaction.member.user.bot === false) {
					game.preparing.forEach(async (lg) => {
						if (
							interaction.message.embeds[0].timestamp ==
							lg.joinMessage.embeds[0].timestamp
						) {
							// await interaction.member.roles.add(lg.session.role);
							await lg.permsManager.addPerms(interaction.member);
							// await lg.channels[0].permissionOverwrites.create(
							// 	interaction.member,
							// 	{
							// 		SEND_MESSAGES: true,
							// 		VIEW_CHANNEL: true,
							// 		CONNECT: true,

							// 		USE_PUBLIC_THREADS: true,
							// 		USE_PRIVATE_THREADS: true,
							// 		SEND_MESSAGES_IN_THREADS: true,
							// 	}
							// );
							await lg.players.push(interaction.member);

							let embed = readyUp();

							let desc = readyUp()
								.description.replace("%max", lg.maxPlayers)
								.replace("%players", lg.players.length);
							let footerName = lg.joinMessage.embeds[0].footer.text;
							let footerIcon = lg.joinMessage.embeds[0].footer.iconURL;

							embed = embed
								.setFooter(footerName, footerIcon)
								.setDescription(desc)
								.setTimestamp(lg.joinMessage.embeds[0].timestamp);

							var btns = null;

							if (lg.players.length >= lg.maxPlayers) {
								let joinBtn = lg.joinMessage.components[0].components[0];
								let leaveBtn = lg.joinMessage.components[0].components[1];
								joinBtn.disabled = true;

								btns = new Discord.MessageActionRow().setComponents([
									joinBtn,
									leaveBtn,
								]);
							} else {
								let joinBtn = lg.joinMessage.components[0].components[0];
								let leaveBtn = lg.joinMessage.components[0].components[1];
								joinBtn.disabled = false;

								btns = new Discord.MessageActionRow().setComponents([
									joinBtn,
									leaveBtn,
								]);
							}

							await lg.channels.forEach((channel) => {
								if (channel.type !== "GUILD_TEXT") return;
								else {
									channel.send({
										content: `<@${interaction.member.user.id}> a rejoins la session, cette session contient ${lg.players.length} participants sur ${lg.maxPlayers}.\nPensez à regarder le message épinglé dans ce channel.`,
									});
								}
							});
							// .send({
							// 	content: `<@&${sessionRole.id}>`,
							// 	components: [leaveBtn],
							// 	embeds: [instructSession().setTimestamp(sessionId)],
							// });

							await lg.joinMessage.edit({
								content: `\n`,
								embeds: [embed],
								components: [btns],
							});

							return await interaction.editReply({
								content: sendConfirmation(msg.successMessages.joinedSession),
								ephemeral: true,
							});
						} else {
							sendError();
						}
					});
				} else {
					return;
				}
			}
		} else if (interaction.customId === "leaveLg") {
			await interaction.reply({
				content: sendLoading(),
				ephemeral: true,
			});
			if ((await game.inGame(interaction.member.user, true).matches) === true) {
				return interaction.editReply({
					content: sendError(msg.errorMessages.sessionStarted),
					ephemeral: true,
				});
			} else if (
				(await game.inGame(interaction.member.user, true).preparing) === false
			) {
				return interaction.editReply({
					content: msg.errorMessages.hasNoSession,
					ephemeral: true,
				});
			} else {
				if (interaction.member.user.bot === false) {
					game.preparing.forEach(async (lg) => {
						if (
							interaction.message.embeds[0].timestamp ==
							lg.joinMessage.embeds[0].timestamp
						) {
							if (lg.host.isHost(interaction.member.user) === true)
								return interaction.editReply({
									content: sendError(
										"Vous êtes l'organisateur ! Pour arrêter la session, vous devez faire `/end`"
									),
									ephemeral: true,
								});

							// await interaction.member.roles.remove(lg.session.role);
							await lg.permsManager.removePerms(interaction.member);
							let i = await lg.players.indexOf(interaction.member);
							if (i > -1) {
								lg.players.splice(i, 1);
							}

							let embed = readyUp();

							let desc = readyUp()
								.description.replace("%max", lg.maxPlayers)
								.replace("%players", lg.players.length);
							let footerName = lg.joinMessage.embeds[0].footer.text;
							let footerIcon = lg.joinMessage.embeds[0].footer.iconURL;

							embed = embed
								.setFooter(footerName, footerIcon)
								.setDescription(desc)
								.setTimestamp(lg.joinMessage.embeds[0].timestamp);

							let joinBtn = lg.joinMessage.components[0].components[0];
							let leaveBtn = lg.joinMessage.components[0].components[1];
							joinBtn.disabled = false;

							var btns = new Discord.MessageActionRow().setComponents([
								joinBtn,
								leaveBtn,
							]);

							await lg.joinMessage.edit({
								content: "\n",
								embeds: [embed],
								components: [btns],
							});

							return await interaction.editReply({
								content: sendConfirmation(msg.successMessages.leftSession),
								ephemeral: true,
							});
						}
					});
				} else {
					return;
				}
			}
		}
	},

	async commands(client, interaction, game) {
		if (interaction.commandName === "create") {
			createGame(interaction, game);
		} else if (interaction.commandName === "end") {
			forceEnd(interaction, game);
		} else if (interaction.commandName === "botsession") {
			createGame(
				interaction,
				game,
				await client.guilds.cache
					.get(interaction.guild.id)
					.members.cache.get(client.user.id)
			);
		} else if (interaction.commandName === "sessions") {
			getSessions(interaction, game);
		} else if (interaction.commandName === "gsessions") {
			getSessions(interaction, game, true);
		} else if (interaction.commandName === "start") {
			start(interaction, game.sessionIndex(interaction, game), game);
		} else if (interaction.commandName === "credits") {
			interaction.reply({
				content: ":heart: sur toi",
				embeds: [credits().setTitle(`Crédits de ${client.user.tag}`)],
			});
		} else if (interaction.commandName === "parametres") {
			manage(interaction, game.sessionIndex(interaction, game));
		}
	},

	async select(client, interaction, game) {
		const session = game.sessionIndex(interaction, game);

		if (session?.host.isHost(interaction.member.user)) {
			if (interaction.customId === "settings") {
				let selectId = interaction.values[0];
				if (selectId === "lock") {
					session.joinMessage = await session.joinMessage.edit({
						components: [
							new Discord.MessageActionRow().addComponents([
								new Discord.MessageButton()
									.setLabel("Rejoindre")
									.setEmoji("<:blurple_join:902283981330972712>")
									.setStyle("SUCCESS")
									.setDisabled(
										session.joinMessage.components[0].components[0].disabled
											? false
											: true
									)
									.setCustomId("joinLg"),

								new Discord.MessageButton()
									.setLabel("Partir")
									.setEmoji("<:blurple_leave:902283934828728380>")
									.setStyle("DANGER")
									.setDisabled(false)
									.setCustomId("leaveLg"),
							]),
						],
					});
				} else if (selectId === "vc") {
					//lock text channel
					//channels[0]
					session.lockLG(session.channels[0]);
				} else if (selectId === "txt") {
					//lock voice channel
					//channels[1]
					session.lockLG(session.channels[1]);
				} else if (selectId === "ban") {
					//ban someone using vote unless owner
				} else {
					throw Error("Hmm");
				}

				interaction.update({
					content: sendConfirmation("Paramètres mis à jour !"),
				});
			}
		} else {
			interaction.reply({
				content: sendError(lg.messages.errorMessages.notHost),
				ephemeral: true,
			});
		}
	},
};
