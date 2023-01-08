const Discord = require("discord.js");
const {
	readyUp,
	forceEnd,
	instructSession,
	sessionStarted,
} = require("./embeds");
const {
	sendError,
	sendLoading,
	sendWarn,
	sendConfirmation,
} = require("./other");
const { lg } = require("../config.json");
const { createChannel, assignTags } = require("./players");
const { createTags, shuffleTags } = require("./roles");
const { correctEpoch } = require("../js/other");

const errors = lg.messages.errorMessages;

module.exports = {
	/**
	 * It returns a JavaScript object that contains the following properties:
	 *
	 * matches: An array of objects that contain the information about the matches.
	 * preparing: An array of objects that contain the information about the preparing sessions.
	 * isGame: A function that returns true.
	 * inGame(user, details = false): A function that returns a boolean value. If details is set to true,
	 * it returns an object that contains the following properties: preparing, matches, and ingame.
	 * sessionIndex(interaction, game): A function that returns the session index
	 * @returns The object that is being returned is the object that is being created in the setup
	 * function.
	 */
	setUp() {
		return {
			matches: [],
			preparing: [],
			// playing(guildId) {
			// 	a = false;
			// 	this.matches.forEach((x) => {
			// 		if (guildId == x.guild) a = true;
			// 	});
			// 	return a;
			// },
			// settingUp(guildId) {
			// 	a = false;
			// 	this.preparing.forEach((x) => {
			// 		if (guildId == x.guild) a = true;
			// 	});
			// 	return a;
			// },
			isGame() {
				return true;
			},
			inGame(user, details = false) {
				var ingame = false;
				var preparing = false;
				var matches = false;

				this.preparing.forEach((lg) => {
					lg.players.forEach((player) => {
						if (player.user.id == user.id) {
							ingame = true;
							preparing = true;
						}
					});
				});
				this.matches.forEach((lg) => {
					lg.players.forEach((player) => {
						if (player.user.id == user.id) {
							ingame = true;
							matches = true;
						}
					});
				});
				if (details === false) return ingame;
				if (details === true)
					return { preparing: preparing, matches: matches, ingame: ingame };
			},

			/**
			 *
			 * @param {*} interaction L'auteur de l'interaction dois être l'organisateur de la session
			 * @param {*} game Utilisé pour les sessions
			 * @returns La session en question
			 */
			sessionIndex(interaction, game) {
				var g = null;

				for (index = 0; index < game.preparing.length; index++) {
					g = game.preparing[index];
					if (
						g.host.user.id !== interaction.member.user.id ||
						g.guild !== interaction.guild.id
					) {
						g = null;
					}
				}
				if (g === null) {
					for (index = 0; index < game.matches.length; index++) {
						g = game.matches[index];
						if (
							g.host.user.id !== interaction.member.user.id ||
							g.guild !== interaction.guild.id
						) {
							g = null;
						}
					}
				}
				return g;
			},
			// sessionIndex(member, options = { hasPreparing: true, hasMatches: true }) {
			// 	var found = false;
			// 	var index = -1;

			// 	if (options.hasPreparing === true && found === false) {
			// 		this.preparing.forEach((lg) => {
			// 			index = index + 1;
			// 			if (lg.host.member === member) {
			// 				found = true;
			// 				console.log(index);
			// 				return index;
			// 			}
			// 		});
			// 	}

			// 	index = -1;

			// 	if (options.hasMatches === true && found === false) {
			// 		this.matches.forEach((lg) => {
			// 			index = index + 1;
			// 			if (lg.host.member === member) {
			// 				found = true;
			// 				return index;
			// 			}
			// 		});
			// 	}
			// },
		};
	},

	/**
	 * It creates a new game
	 * @param {Discord.Interaction} interaction The interaction
	 * @param {Object} game The game object
	 * @param {Discord.GuildMember} member The member that initiated it
	 * @returns
	 */
	async createGame(interaction, game, member = interaction.member) {
		if (game.inGame(interaction.member.user) === true)
			return interaction.reply({
				content: sendError(lg.messages.errorMessages.inSession),
				ephemeral: true,
			});

		var joinMsg = await interaction.reply({
			content: await sendLoading(),
		});
		var embed = readyUp();
		var num = interaction.options?.getInteger("max") ?? 20;
		var sessionId = new Date().getTime();

		//anti-multipleIDs

		if (num > 20 || num < 8) {
			await interaction.editReply({
				content: sendWarn(
					"La session a été limité à 20 car " + num + " n'est pas possible."
				),
			});
			num = 20;
		}

		var desc = readyUp()
			.description.replace("%max", num)
			.replace("%players", "1");
		var footerName = readyUp().footer.text.replace(
			"%host",
			member.nickname ?? member.user.username
		);

		embed
			.setFooter(footerName, member.displayAvatarURL({ dynamic: true }))
			.setDescription(desc)
			.setTimestamp(sessionId);

		const readyBtn = new Discord.MessageActionRow().addComponents([
			new Discord.MessageButton()
				.setLabel("Rejoindre")
				.setEmoji("<:blurple_join:902283981330972712>")
				.setStyle("SUCCESS")
				.setDisabled(false)
				.setCustomId("joinLg"),

			new Discord.MessageButton()
				.setLabel("Partir")
				.setEmoji("<:blurple_leave:902283934828728380>")
				.setStyle("DANGER")
				.setDisabled(false)
				.setCustomId("leaveLg"),
		]);

		// var sessionRole = await interaction.guild.roles.create({
		// 	name: `Session ${sessionId}`,
		// 	color: "RED",
		// 	hoist: false,
		// 	mentionable: false,
		// });
		var sessionCategory = await interaction.guild.channels.create(
			`Session ${sessionId}`,
			{
				type: "GUILD_CATEGORY",
				position: 0,
				permissionOverwrites: [
					{
						id: interaction.member.user.id,
						allow: [
							Discord.Permissions.FLAGS.SEND_MESSAGES,
							Discord.Permissions.FLAGS.VIEW_CHANNEL,
							Discord.Permissions.FLAGS.CONNECT,
						],
						deny: [
							Discord.Permissions.FLAGS.USE_PUBLIC_THREADS,
							Discord.Permissions.FLAGS.USE_PRIVATE_THREADS,
							Discord.Permissions.FLAGS.SEND_MESSAGES_IN_THREADS,
						],
					},
					{
						id: interaction.guild.id,
						deny: [
							Discord.Permissions.FLAGS.SEND_MESSAGES,
							Discord.Permissions.FLAGS.VIEW_CHANNEL,
							Discord.Permissions.FLAGS.CONNECT,
							Discord.Permissions.FLAGS.USE_PUBLIC_THREADS,
							Discord.Permissions.FLAGS.USE_PRIVATE_THREADS,
							Discord.Permissions.FLAGS.SEND_MESSAGES_IN_THREADS,
						],
					},
				],
			}
		);

		var sessionText = await interaction.guild.channels.create("général", {
			type: "GUILD_TEXT",
			topic: "Ce channel sera le channel principal du Loup-Garou",
			nsfw: false,
			position: 1,
			parent: sessionCategory,
		});
		var sessionVoice = await interaction.guild.channels.create("Loup-Garou", {
			type: "GUILD_VOICE",
			userLimit: num,
			position: 2,
			parent: sessionCategory,
		});

		// await member.roles.add(sessionRole);

		const leaveBtn = new Discord.MessageActionRow().addComponents([
			new Discord.MessageButton()
				.setLabel("Partir")
				.setEmoji("<:blurple_leave:902283934828728380>")
				.setStyle("DANGER")
				.setDisabled(false)
				.setCustomId("leaveLg"),
		]);

		var infoMsg = await sessionText.send({
			content: `\n`,
			components: [leaveBtn],
			embeds: [instructSession().setTimestamp(sessionId)],
		});

		var eventBegin = Number(correctEpoch(new Date().getTime())) + 1800;
		interaction.channel.send(`<t:${eventBegin}:R>`);
		await infoMsg.pin();

		/*try {
			 await interaction.guild.scheduledEvents.create({
				name: "Commencement de la partie",
				scheduledStartTime: eventBegin,
				privacyLevel: "GUILD_ONLY",
				entityType: "VOICE",
				description: lg.messages.eventDescription.replace(
					"%host",
					`<@${interaction.member.user.id}>`
				),
				channel: sessionVoice,
				//reason: "Session crée",
			}); 
		} catch (e) {
			interaction.channel.send({
				content: `Scheduled Event creation crashed: \`${e}\`\n\n__Data given__:\n- Timestamp: ${eventBegin}\n- Now Timestamp${correctEpoch(
					Date.now()
				)}\n- Is Timestamp bigger than Now Timestamp: **${
					eventBegin < correctEpoch(Date.now())
				}**`,
			});
		}*/

		setTimeout(async () => {
			await infoMsg.channel.lastMessage.delete();

			joinMsg = await interaction.editReply({
				content: "\n",
				embeds: [embed],
				components: [readyBtn],
			});

			game.preparing.push({
				guild: interaction.guild.id,
				_wholeGuild: interaction.guild,
				session: {
					_repetitive: {
						_guild: interaction.guild,
						_joinMessage: joinMsg,
						_max: num,
					},
					id: sessionId,
					//role: sessionRole,
					unusedRoles: [],
					usedRoles: [],
					async remove(interaction) {
						var embed = forceEnd();
						const btns = new Discord.MessageActionRow().addComponents([
							new Discord.MessageButton()
								.setLabel("Rejoindre")
								.setEmoji("<:blurple_join:902283981330972712>")
								.setStyle("SUCCESS")
								.setDisabled(true)
								.setCustomId("joinLg"),

							new Discord.MessageButton()
								.setLabel("Partir")
								.setEmoji("<:blurple_leave:902283934828728380>")
								.setStyle("DANGER")
								.setDisabled(true)
								.setCustomId("leaveLg"),
						]);

						this._repetitive._joinMessage.edit({
							content: "\n",
							embeds: [embed],
							components: [btns],
						});

						let category = this._repetitive._guild.channels.cache.find(
							(c) => c.name === `Session ${this.id}`
						);

						await category.children.each(async (channel) => {
							await channel.delete();
						});
						category.delete();

						this.unusedRoles = [];
						this.usedRoles = [];

						i = game.sessionIndex(interaction, game);
						game.preparing.splice(i, 1);

						//this.role.delete();
					},
				},
				maxPlayers: num,
				joinMessage: joinMsg,
				infoMessage: infoMsg,
				preparing: true,
				host: {
					member: interaction.member,
					user: interaction.member.user,
					isHost(user) {
						if (user.id === this.user.id) {
							return true;
						} else {
							return false;
						}
					},
				},
				players: [member],
				personnalChannels: [],
				permsManager: {
					channel: sessionCategory,
					async addPerms(member, unlock = false) {
						await this.channel.permissionOverwrites.create(member, {
							SEND_MESSAGES: true,
							VIEW_CHANNEL: true,
							CONNECT: true,
							SPEAK: true,

							CREATE_PUBLIC_THREADS: true,
							CREATE_PRIVATE_THREADS: true,
							SEND_MESSAGES_IN_THREADS: true,
						});
					},
					async removePerms(member, lock = false) {
						await this.channel.permissionOverwrites.create(member, {
							SEND_MESSAGES: false,
							VIEW_CHANNEL: lock,
							CONNECT: false,
							SPEAK: false,

							CREATE_PUBLIC_THREADS: false,
							CREATE_PRIVATE_THREADS: false,
							SEND_MESSAGES_IN_THREADS: false,
						});
					},
					async lockLG(channel) {
						//permissionOverwrites.cache.first().allow.bitfield

						channel.updateOverwrites.cache.each((perm) => {
							let { allow, deny } = perm;
						});

						await channel.permissionOverwrites.create(channel.guild, {
							SEND_MESSAGES: false,
							VIEW_CHANNEL: true,
							CONNECT: false,
							SPEAK: false,

							CREATE_PUBLIC_THREADS: false,
							CREATE_PRIVATE_THREADS: false,
							SEND_MESSAGES_IN_THREADS: false,
						});
					},
				},
				channels: [sessionText, sessionVoice, sessionCategory],
				settings: {
					joinLock: false,
					onlyVc: false,
					onlyTxt: false,
					banned: [],
					guildEvent: null,
				},
			});
		}, 1500);
	},

	/**
	 * It starts a session
	 * @param {Discord.Interaction} interaction - The interaction object that triggered the command.
	 * @param {Object} session - The session object.
	 * @param {Object} game - The game object.
	 * @returns Nothing.
	 */
	async start(interaction, session, game) {
		if (session?.preparing === true) {
			if (session.host.member === interaction.member) {
				await interaction.reply({ content: sendLoading(), ephemeral: false });

				let joinBtn = session.joinMessage.components[0].components[0];
				let leaveBtn = session.joinMessage.components[0].components[1];
				joinBtn.disabled = true;
				leaveBtn.disabled = true;

				btns1 = new Discord.MessageActionRow().addComponents([leaveBtn]);

				session.infoMessage.edit({
					content: "\n",
					embeds: session.infoMessage.embeds,
					components: [btns1],
				});

				btns2 = new Discord.MessageActionRow().setComponents([
					joinBtn,
					leaveBtn,
				]);

				session.joinMessage.edit({
					content: "\n",
					embeds: [
						sessionStarted().setTimestamp(
							session.joinMessage.embeds[0].timestamp
						),
					],
					components: [btns2],
				});

				session.preparing = false;
				await game.preparing.splice(game.sessionIndex(interaction, game), 1);
				await game.matches.unshift(session);

				var category = null;
				game.matches[0].channels.forEach((channel) => {
					if (channel.type === "GUILD_CATEGORY") {
						category = channel;
					}
				});

				if (category === null || typeof category === "undefined")
					return sendError(interaction, errors.channelNotFound);
				try {
					await interaction.editReply({
						content: sendLoading("Bientôt terminée..."),
						ephemeral: false,
					});
					let index = -1;
					await createTags(game.matches[0]);
					game.matches[0].players.forEach(async (player) => {
						index = +1;
						await createChannel(game.matches[0], category, player);
						await shuffleTags(game.matches[0].session.unusedRoles);
						await assignTags(game.matches[0], player, index);
					});
					await interaction.editReply(
						{
							content: sendConfirmation(
								lg.messages.successMessages.sessionStarting.replace(
									"%sec",
									lg.startDelay
								)
							),
							ephemeral: false,
						},
						lg.startDelay * 1000
					);
					setTimeout(async () => {
						game.matches[0].channels.forEach(async (channel) => {
							if (channel.type === "GUILD_TEXT") {
								return await channel.setName("loup-garou");
							}
						});
						await interaction.deleteReply();
					});
				} catch (e) {
					console.log(e);
					return await interaction.editReply({ content: sendWarn() });
				}
			} else {
				interaction.reply(sendError(errors.notHost));
			}
		} else {
			interaction.reply(sendError(errors.noSessionsStart));
		}
	},

	async checkAlive(match) {
		// check roles
		// see if any wolves / villagers are alive
		// if one of any of each > end(winners = [team])
	},

	async nextRound() {
		this.checkAlive();
	},

	async end(winners = "nobody") {
		// reveal everyone's roles
		// delete roles
		// delete channels

		if (end === "nobody") {
			this.forceEnd(interaction, game);
		}
	},

	/**
	 * Envoie un message pour paramétré la session
	 * @returns Discord.Message()
	 */
	/**
	 * It shows the user the settings menu.
	 * @param {Discord.ButtonInteraction} interaction - The interaction object that was created when the user clicked on the button.
	 * @param {Object} session - The session object that was created.
	 */
	async manage(interaction, session) {
		if (
			session?.preparing === true &&
			session?.host.isHost(interaction.member.user) === true
		) {
			//montrer des boutons/menus pour paramétré la session
			const select = new Discord.MessageActionRow().addComponents([
				new Discord.MessageSelectMenu()
					.setCustomId("settings")
					.setMaxValues(1)
					.setMinValues(1)
					.setPlaceholder("Paramètres")
					.setOptions([
						{
							label: "Rendre la session privée",
							description: "Cette options rends la session privée",
							value: "lock",
							emoji: "🔒",
						},
						{
							label: "Vocal seulement",
							description: "Désactive le channel textuel",
							value: "vc",
							emoji: "🔊",
							disabled: true,
						},
						{
							label: "Textuel seulement",
							description: "Désactive le channel vocal",
							value: "txt",
							emoji: "⌨️",
							disabled: true,
						},
						{
							label: "Bannir quelqu'un",
							description: "Séléctionnez la personne à bannir",
							value: "ban",
							emoji: "🟥",
						},
					]),
			]);

			interaction.reply({
				content:
					"<:lg_information:902941757606604851> Seul l'organisateur peut utiliser ce menu",
				components: [select],
			});
		} else {
			// dire que la partie à déjà préparé ou qu'elle n'existe pas
			// OU
			// désactiver les boutons pour changer des paramètres
			interaction.reply({
				content: sendError(
					"Votre session n'a pas été trouvé, ou alors, votre session a été lancé."
				),
				ephemeral: true,
			});
		}
	},

	/**
	 * It checks if the user is the host of a game session, and if so, it deletes the session
	 * @param {Discord.Interaction} interaction - The interaction object.
	 * @param {Object} game - The game object.
	 */
	async forceEnd(interaction, game) {
		var g = null;
		var x = false;

		for (index = 0; index < game.preparing.length; index++) {
			g = game.preparing[index];
			if (
				g.host.user.id !== interaction.member.user.id ||
				g.guild !== interaction.guild.id
			) {
				g = null;
			}
		}
		if (g === null) {
			for (index = 0; index < game.matches.length; index++) {
				g = game.matches[index];
				if (
					g.host.user.id !== interaction.member.user.id ||
					g.guild !== interaction.guild.id
				) {
					g = null;
				}
			}
		}

		g.channels.forEach((channel) => {
			if (channel === interaction.channel) return (x = true);
		});
		try {
			if (g !== null) {
				if (x === false) {
					await interaction.reply({
						content: sendLoading(),
						ephemeral: false,
					});

					await g.channels[0].send({
						content: sendWarn(
							`<@${interaction.member.user.id}> a arrêté la partie de force ! Cette session sera supprimée dans ${lg.deleteTime} secondes.`
						),
					});
				} else {
					await interaction.reply({
						content: sendWarn(
							`<@${interaction.member.user.id}> a arrêté la partie de force ! Cette session sera supprimée dans ${lg.deleteTime} secondes.`
						),
					});
				}
			} else {
				await interaction.reply({
					content: sendError(),
				});
			}

			if (x === false)
				await interaction.editReply({
					content: sendLoading(
						"Votre session sera supprimée dans " + lg.deleteTime + " secondes."
					),
					ephemeral: false,
				});

			setTimeout(async () => {
				try {
					await g.session.remove(interaction);
					if (x === false)
						await interaction.editReply({
							content: sendConfirmation(
								lg.messages.successMessages.deletedSession
							),
							ephemeral: false,
						});
				} catch (e) {
					console.log(e);
					if (x === false) {
						try {
							await interaction.deleteReply(/*{
								content: sendWarn(),
								ephemeral: true,
							}*/);
						} catch (e) {
							console.log(e);
						}
					}
				}
			}, lg.deleteTime * 1000);
		} catch (e) {}
	},

	/**
	 * It gets all the sessions from the game object and sends them to the user
	 * @param {Discord.Interaction} interaction - The interaction object
	 * @param {Object} game - The game object
	 * @param {Boolean} allGuilds - If true, will return all sessions from all guilds.
	 * @returns a promise.
	 */
	async getSessions(interaction, game, allGuilds = false) {
		// //return interaction.reply({
		// 	content: "Toujours en cours fréro",
		// 	ephemeral: true,
		// });
		var all = [];
		var embeds = [];

		if (game.preparing.length < 1 && game.matches.length < 1)
			return interaction.reply({
				content: "Il n'y a aucune session actuellement :'(",
				ephemeral: true,
			});
		game.preparing.forEach((lg) => {
			if (interaction.guild.id === lg.guild || allGuilds === true) all.push(lg);
		});
		game.matches.forEach((lg) => {
			if (interaction.guild.id === lg.guild || allGuilds === true) all.push(lg);
		});

		var count = 0;
		await interaction.deferReply();
		await interaction.deleteReply();
		all.forEach(async (session) => {
			var list = [];
			count = count + 1;

			if (session.players.length < 1) {
				list = ["*Du vent passe dans cette session*"];
			} else {
				session.players.forEach((player) => {
					list.push(player.user.tag);
				});
			}

			let embed = new Discord.MessageEmbed()
				.setTitle(`Session de ${session.host.user.tag}`)
				.addFields([
					{
						name: "Nombre de joueurs",
						value: `${session.players.length}`,
						inline: true,
					},
					{
						name: "Nombre de joueurs maximum",
						value: `${session.maxPlayers}`,
						inline: true,
					},
					{
						name: "Joueurs",
						value: `${list.toString()}`,
						inline: true,
					},
					{
						name: "Rejoindre :",
						value: `[Cliquez ici](${session.joinMessage.url})`,
					},
					{
						name: "Status de la session",
						value: `${session.preparing ? "En préparation" : "Démarrée"}`,
						inline: true,
					},
					{
						name: "Identifiant de la session",
						value: `${session.session.id}`,
						inline: true,
					},
					{
						name: "Identifiant du serveur",
						value: `${session.guild}`,
						inline: true,
					},
				]);

			await embeds.push(embed);
		});
		await interaction.channel.send({
			content: `${count}/${all.length}`,
			embeds: embeds,
		});
	},

	/**
	 * It checks if the game object is valid.
	 * @param game - The game object.
	 * @returns A boolean value.
	 */
	isGame(game) {
		if (!game || !game?.preparing || !game?.matches) return false;
		else true;
	},
};
