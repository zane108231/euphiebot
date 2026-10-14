const { SlashCommandBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder } = require("discord.js");
const { getGuildData, clearUpdateInterval } = require("../utils/playerStore");
const { requireMusicAction } = require("../utils/permissions");
const { getMusicDenial } = require("../utils/permissions");
const { endSession } = require("../utils/statsTracker");

module.exports = {
    aliases: ["leave"],
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop playback, clear queue, and disconnect"),

    async execute(interaction, client) {
        const player = await requireMusicAction(interaction, client, "stop");
        if (!player) return;

        const denial = getMusicDenial(interaction.member, player, "stop");
        if (denial) {
            return interaction.reply({ content: denial, flags: MessageFlags.Ephemeral });
        }

        // Clean up guild state
        const guildData = getGuildData(interaction.guild.id);
        
        // End statistics session (stopped manually - not natural completion)
        try {
            if (guildData.currentSessionId) {
                console.log("[euphire] stop: ending session (manual stop)");
                endSession(guildData.currentSessionId, false);
                guildData.currentSessionId = null;
            }
        } catch (err) {
            console.error("[euphire] Failed to end stats session on stop:", err.message);
        }
        
        clearUpdateInterval(guildData);
        if (guildData.idleTimeout) {
            clearTimeout(guildData.idleTimeout);
            guildData.idleTimeout = null;
        }
        guildData.suggestions = [];
        guildData.previousTracks = [];

        player.queue.clear();
        player.stop();

        if (guildData.twentyFourSeven) {
            guildData.playerMessageId = null;
            guildData.playerChannelId = null;

            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "### ⏹ Stopped\n\n" +
                    "**Status**\n" +
                    "-# Queue cleared. Staying in voice channel (24/7 mode)."
                )
            );
            return interaction.reply({
                components: [container],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
        }

        guildData.playerMessageId = null;
        guildData.playerChannelId = null;
        player.destroy();

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                "### ⏹ Stopped\n\n" +
                "**Status**\n" +
                "-# Queue cleared and disconnected from voice channel."
            )
        );
        await interaction.reply({
            components: [container],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
    },
};
