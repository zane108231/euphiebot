const { SlashCommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require("discord.js");
const { startIfIdle, setAnnounceChannel } = require("../utils/playback");
const { getGuildData } = require("../utils/playerStore");
const { requireMusicAction } = require("../utils/permissions");
const { getMusicDenial } = require("../utils/permissions");
const { endSession } = require("../utils/statsTracker");

module.exports = {
    aliases: ["s", "next"],
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skip the current track"),

    async execute(interaction, client) {
        const player = await requireMusicAction(interaction, client, "skip");
        if (!player) return;

        const denial = getMusicDenial(interaction.member, player, "skip");
        if (denial) {
            return interaction.reply({ content: denial, flags: MessageFlags.Ephemeral });
        }

        const skippedTitle = player.current?.info?.title || "Unknown";
        const guildData = getGuildData(interaction.guild.id);
        setAnnounceChannel(player, guildData, interaction.channel.id);

        // End statistics session (skipped manually - not natural completion)
        try {
            if (guildData.currentSessionId) {
                console.log("[euphire] skip: ending session (manual skip)");
                endSession(guildData.currentSessionId, false);
                guildData.currentSessionId = null;
            }
        } catch (err) {
            console.error("[euphire] Failed to end stats session on skip:", err.message);
        }

        if (player.playing || player.paused) {
            player.stop();
        } else if (player.queue.length) {
            await startIfIdle(player);
        } else {
            return interaction.reply({
                content: "❌ Nothing is playing and the queue is empty.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                "### ⏭ Skipped\n\n" +
                "**Track**\n" +
                `-# ${skippedTitle}`
            )
        );
        await interaction.reply({
            components: [container],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
    },
};
