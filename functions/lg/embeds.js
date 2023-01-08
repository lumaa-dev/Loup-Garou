const { MessageEmbed, ColorResolvable } = require("discord.js");
const { sendError } = require("./other");

module.exports = {
	readyUp() {
		return new MessageEmbed()
			.setTitle("<:lg_check:902290122739970058> Une session vas commencer !")
			.setColor("RED")
			.setDescription(
				"Cliquez sur le bouton en dessous de ce message pour rejoindre la session\n\nIl y a actuellement %players joueur(s) sur %max dans la partie !"
			)
			.setFooter("%host organise cette session");
	},

	forceEnd() {
		return new MessageEmbed()
			.setTitle("<:lg_cross:902288945239441479> Cette session a été arrêtée")
			.setColor("RED")
			.setDescription(
				"Cette session a été arrêtée par son organisateur, de force"
			);
	},

	instructSession() {
		return new MessageEmbed()
			.setTitle(
				"<:lg_information:902941757606604851> Le déroulement d'une session :"
			)
			.setDescription(
				"**En tant qu'organisateur** :\n\n- Regardez la liste des commandes (/help) et leur description pour gérer la session\n\n**En tant que participant** :\n\n- Lors du départ de la partie, vous aurez un channel dédié à votre rôle/action avec l'annonce, donc, de votre rôle\n\n- __Toutes interactions textuelles se déroule dans le salon \"loup-garou\"__\n\n- À l'aube du premier jour, les villageois élisent le capitaine (ou maire) du village. Le capitaine peut être n'importe quel joueur (incluant les loups-garous), et sa voix lors du vote de la journée compte double en cas d'égalité. Si le capitaine meurt, dans son dernier souffle, il désigne un successeur qui devient automatiquement le nouveau capitaine du village.\n\n- Après l'élection du capitaine, il vous faudras voté contre qui tuer dans un temps imparti.\n\n- La nuit tombera, et les loup-garous, la sorcière, etc, feront leur actions pendant la nuit.\n\n- Cela ce répète jusqu'à ce que les villageois, ou les loup-garous gagnent"
			)
			.setColor("dced84");
	},

	sessionStarted() {
		return new MessageEmbed()
			.setTitle(sendError("Cette session à déjà démarrée."))
			.setColor("BLURPLE")
			.setDescription(
				"Vous ne pouvez pas rejoindre une session lorsqu'elle a déjà commencée."
			);
	},
	introPerso() {
		return new MessageEmbed()
			.setTitle("Comment ce channel marche ?")
			.setColor("RANDOM")
			.setDescription(
				"Ce channel n'est qu'à vous. Aucune informations dans ce channel ne doivent être révélées.\nVous pouvez écrire des notes, faire des rappels, etc..."
			)
			.setTimestamp();
	},
	revealRole() {
		return new MessageEmbed()
			.setTitle("Vous êtes %role")
			.setDescription("%desc")
			.setColor("#2f3136");
	},

	credits() {
		return new MessageEmbed()
			.setTitle(`Crédits de %bot`)
			.addFields([
				{
					name: "Créateur :",
					value: "- _Lumination#5240",
					inline: true,
				},
				{
					name: "Testeurs.euses :",
					value: "- _Shiro_#2975",
					inline: false,
				},
				{
					name: "Remerciments :",
					value:
						"- Bee\n- Luvaa\n- Luki\n- Hyacinth\n- Nats\n- Shatoons\n- Patate\n- Dapper Tots",
					inline: true,
				},
			])
			.setColor("RED")
			.setFooter("Et un merci à ceux qui utilise le bot !");
	},
};
