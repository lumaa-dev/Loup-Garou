const { lg } = require("../config.json");
const { shuffle } = require("../js/other");

module.exports = {
	sendError(error = "Vous ne pouvez pas faire ça !") {
		return `<:lg_cross:902288945239441479> ${error}`;
	},
	sendWarn(error = "Une erreur est survenue !") {
		return `<:lg_warn:902289016634900500> ${error}`;
	},
	sendConfirmation(message) {
		return `<:lg_check:902290122739970058> ${message}`;
	},
	sendLoading(message = shuffle(lg.messages.loadingMessages)[0]) {
		if (!message.length) message = shuffle(lg.messages.loadingMessages)[0];
		return `<a:loading:902218385369223178> ${message}`;
	},
};
