const Discord = require("discord.js");
const { joinVoiceChannel, createAudioPlayer } = require("@discordjs/voice");
const ytSearch = require("yt-search");
const config = require("../config.json");

module.exports = {
	/**
	 * It takes in a string, evaluates it, and returns the result
	 * @param {Discord.Interaction} interaction - The interaction object that contains the message that triggered the command.
	 * @param {String} evaluation - The code to be evaluated.
	 * @param {Boolean} showPromise - Whether or not to show the promise result.
	 * @param {Object} game - The game object.
	 * @param {Discord.Client} client - The client object.
	 */
	async smartEval(interaction, evaluation, showPromise = true, game, client) {
		if (showPromise === false) {
			await interaction.deferReply({ ephemeral: true });
			interaction.editReply({
				content: "Executing: ```js\n" + evaluation + "```",
				ephemeral: true,
			});
			try {
				await eval(evaluation);
			} catch (e) {
				await interaction.followUp({ content: `${e}`, ephemeral: true });
				console.error(e);
			}
		} else if (showPromise === true) {
			await interaction.deferReply({ ephemeral: true });
			try {
				const promise = await eval(evaluation);
				await interaction.editReply({
					ephemeral: true,
					content: `Successful!\nResult:\n\`\`\`${promise}\`\`\``,
				});
			} catch (e) {
				await interaction.followUp({ content: `${e}`, ephemeral: true });
				console.error(e);
			}
		}
	},

	/**
	 * Create a poll with a question and two choices
	 * @param {Discord.GuildChannel} channel The channel where the poll will be created.
	 * @param {String} question The question of the poll.
	 * @param {String} choice1 The first choice.
	 * @param {String} choice2 The second choice for the poll.
	 * @returns The message object.
	 */
	createPoll(channel, question, choice1 = "✅ - Yes", choice2 = "❌ - No") {
		//Choices format : "[emoji] - [option]"
		if (!question || !channel) return console.error("Error in createPoll()");
		var emoji1 = choice1.charAt(0);
		var emoji2 = choice2.charAt(0);
		let poll = this.createEmbed(
			question,
			`${choice1}\n${choice2}`,
			"Poll",
			this.randomColor(),
			true
		);
		//console.log(`${emoji1} / ${emoji2}`)
		channel
			.send({ embeds: [poll] })
			.then(async (message) => {
				await message.react(emoji1);
				await message.react(emoji2);
			})
			.then(() => {
				return console.log("Poll sent perfectly");
			})
			.catch(console.error);
	},

	async youtubeSearch(query) {
		const videoFinder = async (query) => {
			const videoResult = await ytSearch(query);
			return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
		};
		const video = await videoFinder(query);
		console.log(video);

		if (video) return video;
		if (!video) return console.error('No YT videos found with "' + query + '"');
	},

	/**
	 * Corrects the epoch to the correct format
	 * @param {String | Number} epoch - The epoch timestamp to convert.
	 * @returns The epoch is converted to a string, and then the last three characters are removed.
	 */
	correctEpoch(epoch = "1533135944000") {
		epoch = epoch.toString();
		if (epoch.length !== 13) return console.error("Incorrect Epoch");
		return epoch.substring(0, epoch.length - 3);
	},

	/**
	 * *Converts the first character of a string to uppercase and returns the new string.*
	 * @param {String}string The string to capitalize.
	 * @returns The first character of the string is capitalized.
	 */
	setFirstCap(string) {
		string = string.toLowerCase();

		let firstChar = string.charAt(0).toUpperCase();
		let end = string.substring(1);

		string = `${firstChar}${end}`;
		return string;
	},

	/**
	 * Convert a snowflake to a creation date
	 * @param {Discord.Snowflake} snowflake - The snowflake to convert to a date.
	 * @returns The epoch time in milliseconds.
	 */
	snowflakeToCreation(snowflake) {
		if (!snowflake || typeof snowflake == "undefined" || snowflake < 4194304)
			return console.error("No valid snowflakes provided");

		const epochwords = new Date(snowflake / 4194304 + 1420070400000).toString();
		var epochunix = Date.parse(epochwords).toString();

		const epoch = this.correctEpoch(epochunix);
		return epoch;
	},

	/**
	 * Convert a human readable time to epoch time
	 * @param {String | Number | Date}humanTime - The time you want to convert to epoch.
	 * @param {Boolean} correct - If true, the epoch will be corrected to the nearest second.
	 * @returns The epoch time.
	 */
	humanTimeToEpoch(humanTime, correct = true) {
		date = new Date(humanTime); // Your timezone!
		epoch = date.getTime() / 1000.0;
		epoch = epoch.toString().replace(".", "");
		if (correct === true) epoch = this.correctEpoch(epoch);

		return epoch;
	},

	async prettyMaths(operation) {
		const signs = ["+", "-", "*", "/", "="];
		signs.forEach((sign) => {
			operation = operation.replace(sign, ` ${sign} `);
		});
		return operation;
	},

	async play(channel, resource) {
		const connection = await joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});

		const player = await createAudioPlayer();
		const audioResource = await createAudioResource(resource);

		await player.play(audioResource);
		connection.subscribe(player);

		return player;
	},

	checkConfig() {
		if (typeof config !== "object") throw new Error("Config hasn't been found");
	},

	/**
	 * Randomizes an array
	 * @param {Array} array The array to shuffle
	 * @returns Randomized Array
	 */
	shuffle(array) {
		if (!Array.isArray(array)) throw new Error("Item is not an array");

		let currentIndex = array.length,
			randomIndex;

		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex],
				array[currentIndex],
			];
		}

		return array;
	},
};
