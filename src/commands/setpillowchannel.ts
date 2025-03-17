import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder, ChannelType, MessageFlags } from 'discord.js';
import { patchSettings } from '../util/cache.js';
import type { Command } from './index.js';

export default {
	data: new SlashCommandBuilder()
		.setName('setpillowchannel')
		.setDescription('Sets the channel for pillow submissions')
		.addChannelOption((option) =>
			option.setName('channel').setDescription('The channel to set as the pillow submission channel').setRequired(true),
		)
		.setContexts(0)
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) {
			await interaction.reply({ content: 'This command can only be used in a guild', flags: MessageFlags.Ephemeral });
			return;
		}

		if (!interaction.memberPermissions?.has('Administrator')) {
			await interaction.reply({
				content: 'Only Administrators can use this command',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		const channel = interaction.options.getChannel('channel');
		if (!channel || channel.type !== ChannelType.GuildText) {
			await interaction.reply({ content: 'The provided channel is invalid', flags: MessageFlags.Ephemeral });
			return;
		}

		try {
			await patchSettings(interaction.guildId!, { pillowChannel: channel.id });
			await interaction.reply({
				content: `The channel ${channel.name} has been set as the image moderator channel`,
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			console.error(`Failed to set the channel: ${error}`);
			await interaction.reply({
				content: 'An error occurred while setting the channel',
				flags: MessageFlags.Ephemeral,
			});
		}
	},
} satisfies Command;
