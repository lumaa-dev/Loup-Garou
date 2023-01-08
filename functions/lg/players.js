const Discord = require("discord.js");
const { introPerso, revealRole } = require("./embeds");
const { shuffle } = require("../js/other");

module.exports = {
	/**
	 * Donne les rôles au joueur
	 * @deprecated Deprecated due to easy-ratelimit
	 */
	async assignRoles(match, player, i) {
		let { role, info } = match.session.unusedRoles[i];

		let title = revealRole().title.replace("%role", info.name);
		let description = revealRole().description.replace(
			"%desc",
			info.description
		);

		//let index = match.players.indexOf(player);
		await match.personnalChannels[i].send({
			content: /*`<@${player.user.id}>`*/ "\n",
			embeds: [revealRole().setTitle(title).setDescription(description)],
		});

		match.session.unusedRoles.splice(i, 1);
		match.session.usedRoles.push({ role: role, info: info });

		await player.roles.add(role);
	},

	async assignTags(match, player, i) {
		let { tag, info } = match.session.unusedRoles[i];

		let title = revealRole().title.replace("%role", info.name);
		let description = revealRole().description.replace(
			"%desc",
			info.description
		);

		//let index = match.players.indexOf(player);
		await match.personnalChannels[i].send({
			content: /*`<@${player.user.id}>`*/ "\n",
			embeds: [revealRole().setTitle(title).setDescription(description)],
		});

		match.session.unusedRoles.splice(i, 1);
		match.session.usedRoles.push({ tag: tag, info: info });

		tag.has.push(player);
		// await player.roles.add(role);
	},

	async createChannel(match, category, player) {
		let persoChannel = await match._wholeGuild.channels.create(
			"channel-perso",
			{
				type: "GUILD_TEXT",
				topic: player.id,
				nsfw: false,
				position: 2,
				parent: category,
				// permissionOverwrites: [
				// 	{
				// 		id: match.session.role,
				// 		deny: [
				// 			Discord.Permissions.FLAGS.SEND_MESSAGES,
				// 			Discord.Permissions.FLAGS.VIEW_CHANNEL,
				// 			Discord.Permissions.FLAGS.CONNECT,
				// 		],
				// 	},
				// 	{
				// 		id: match._wholeGuild.id,
				// 		deny: [
				// 			Discord.Permissions.FLAGS.SEND_MESSAGES,
				// 			Discord.Permissions.FLAGS.VIEW_CHANNEL,
				// 			Discord.Permissions.FLAGS.CONNECT,
				// 		],
				// 	},
				// 	{
				// 		id: player.user.id,
				// 		allow: [
				// 			Discord.Permissions.FLAGS.SEND_MESSAGES,
				// 			Discord.Permissions.FLAGS.VIEW_CHANNEL,
				// 		],
				// 	},
				// ],
			}
		);
		await persoChannel.send({
			content: `<@${player.id}>`,
			embeds: [introPerso()],
		});
		match.personnalChannels.push(persoChannel);
	},
};
