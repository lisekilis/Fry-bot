import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { patchSettings } from '../util/cache.js';
import type { Command } from './index.js';

export default {
	data: new SlashCommandBuilder()
		.setName('setmodrole')
		.setDescription('Sets the role that is allowed to approve, deny and manage the images')
		.addRoleOption((option) =>
			option.setName('role').setDescription('The role to set as image moderator').setRequired(true),
		)
		.setContexts(0)
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) {
			await interaction.reply({ content: 'This command can only be used in a guild', ephemeral: true });
			return;
		}

		if (!interaction.memberPermissions?.has('Administrator')) {
			await interaction.reply({
				content: 'You do not have the required permissions to use this command',
				ephemeral: true,
			});
			return;
		}

		const role = interaction.options.getRole('role');
		if (!role) {
			await interaction.reply({ content: 'The role provided is invalid', ephemeral: true });
			return;
		}

		try {
			await patchSettings(interaction.guildId!, { modRoleId: role.id });
			await interaction.reply({
				content: `The role ${role.name} has been set as the image moderator role`,
				ephemeral: true,
			});
		} catch (error) {
			console.error(`Failed to set the role: ${error}`);
			await interaction.reply({
				content: 'An error occurred while setting the role',
				ephemeral: true,
			});
		}
	},
} satisfies Command;
