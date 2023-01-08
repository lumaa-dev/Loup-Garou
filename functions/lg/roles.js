const Discord = require("discord.js");
const { lg } = require("../config.json");
const { shuffle } = require("../js/other");

module.exports = {
	/**
	 * Crée les rôles nécessaire
	 * @deprecated Deprecated due to easy-ratelimit
	 * @param {*} session La session qui faut changer
	 * @fires createTags()
	 */
	async createRoles(session) {
		return this.createTags(session);
		const roles = lg.roles;
		const roleNames = [
			"Loup-Garou",
			"Loup-Garou",
			"Loup-Garou",
			"Villageois",
			"Villageois",
			"Voyante",
			"Sorcière",
			"Cupidon",
			"Chasseur",
			"Les deux soeurs",
			"Les deux soeurs",
			"Salvateur",
			"Idiot du village",
			"Bouc émissaire",
			"Joueur de flûte",
			"Loup blanc",
			"Corbeau",
			"l'Ancien du village",
			"Renard",
			"Chaman",
			"Chaman",
		];
		let roleInfo = [
			roles[0],
			roles[0],
			roles[0],
			roles[1],
			roles[1],
			roles[2],
			roles[3],
			roles[4],
			roles[5],
			roles[6],
			roles[6],
			roles[7],
			roles[8],
			roles[9],
			roles[10],
			roles[11],
			roles[12],
			roles[13],
			roles[14],
			roles[15],
			roles[15],
		];
		for (let index = 0; index < roleNames.length; index++) {
			const roleName = roleNames[index];
			const { name, description } = roleInfo[index];
			var newRole = await session._wholeGuild.roles.create({
				name: `${roleName}`,
				color: "RED",
				hoist: false,
				mentionable: false,
			});
			await session.session.unusedRoles.push({
				role: newRole,
				info: { name: name, description: description },
			});
		}
	},

	/**
	 * Crée les rôles nécessaire
	 * @param {*} session La session qui faut changer
	 * @alias createRoles()
	 */
	async createTags(session) {
		const roles = lg.roles;
		const roleNames = [
			"Loup-Garou",
			"Loup-Garou",
			"Loup-Garou",
			"Villageois",
			"Villageois",
			"Voyante",
			"Sorcière",
			"Cupidon",
			"Chasseur",
			"Les deux soeurs",
			"Les deux soeurs",
			"Salvateur",
			"Idiot du village",
			"Bouc émissaire",
			"Joueur de flûte",
			"Loup blanc",
			"Corbeau",
			"l'Ancien du village",
			"Renard",
			"Chaman",
			"Chaman",
		];

		let roleInfo = [
			roles[0],
			roles[0],
			roles[0],
			roles[1],
			roles[1],
			roles[2],
			roles[3],
			roles[4],
			roles[5],
			roles[6],
			roles[6],
			roles[7],
			roles[8],
			roles[9],
			roles[10],
			roles[11],
			roles[12],
			roles[13],
			roles[14],
			roles[15],
			roles[15],
		];
		for (let index = 0; index < roleNames.length; index++) {
			const roleName = roleNames[index];
			const { name, description, winsWith, changed } = roleInfo[index];

			// var newRole = await session._wholeGuild.roles.create({
			// 	name: `${roleName}`,
			// 	color: "RED",
			// 	hoist: false,
			// 	mentionable: false,
			// });

			var tag = {
				name: roleName,
				has: [],
				winsWith: winsWith,
				changed: changed,
				dead: false,
				info: {
					name: name,
					description: description,
				},
				ping() {
					var output = "";
					this.has.forEach((member) => {
						output = `${output}, <@${member.id}>`;
					});
					return output;
				},
				won(winners) {
					if (winners === this.winWith.loup) {
						return true;
					} else {
						return false;
					}
				},
				alive() {
					let remaining = this.has.length;
					let winsWith = this.winsWith;
					var alive = true;

					if (remaining === 0) {
						alive = false;
						this.dead = true;
					}

					return {
						tagAlive: alive,
						winsWith: winsWith,
						remaining: remaining,
					};
				},
			};

			await session.session.unusedRoles.push({
				tag: tag,
				info: { name: name, description: description },
			});
		}
	},

	async userTags(game) {
		// list everyone's tags
	},

	/**
	 * Shuffles the tags
	 * @param tags Tags to shuffle
	 */
	async shuffleTags(tags) {
		tags = shuffle(tags);
		return tags;
	},

	/**
	 * Delete every used roles in a session
	 * @deprecated Easy to get ratelimited & useless
	 */
	async deleteUsedRoles(match) {
		match.session.usedRoles.forEach(async (usedRole) => {
			let { role } = usedRole;
			await role.delete();
		});
	},
};
