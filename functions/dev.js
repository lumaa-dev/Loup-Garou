/*
THIS FILE IS NOT SUPPOSED TO BE USED IN THE MAIN ONES
THIS FILE HAS DEBUG/FIXING FUNCTIONS
*/

const { correctEpoch } = require("./js/other");
const { sendLoading, sendConfirmation } = require("./lg/other");

async function fixRoles(interaction) {
	await interaction.reply({
		content: sendLoading("Cleaning..."),
		ephemeral: true,
	});
	await interaction.guild.roles.cache.each(async (role) => {
		if (role.editable === true) {
			try {
				await role.delete();
				console.log("role deleted");
			} catch (e) {
				console.log(role);
			}
		} else {
			console.log("role is admin/bot");
		}
	});
	await interaction.editReply({
		content: sendConfirmation("Cleaned!"),
		ephemeral: true,
	});
}

async function addMinutesToTimestamp(interaction) {
	var timestamp = Number(correctEpoch(new Date().getTime())) + 1800;

	interaction.channel.send(`${timestamp}\n<t:${timestamp}:R>`);
}

module.exports = { fixRoles, addMinutesToTimestamp };
