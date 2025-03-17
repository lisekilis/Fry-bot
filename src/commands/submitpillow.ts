import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { PillowType } from '../types.js';
import { getSettings } from '../util/cache.js';
import type { Command } from './index.js';

export default {
	data: new SlashCommandBuilder()
		.setName('submitpillow')
		.setDescription('Submit a pillow texture for approval')
		.addStringOption((option) =>
			option.setName('pillowname').setDescription('The name of the pillow').setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('pillowtype')
				.setDescription('The type of the pillow')
				.setRequired(true)
				.addChoices({ name: 'Normal', value: PillowType.NORMAL }, { name: 'Dakimakura', value: PillowType.BODY }),
		)
		.addAttachmentOption((option) =>
			option.setName('texture').setDescription('The texture file to submit').setRequired(true),
		)
		.addStringOption((option) =>
			option.setName('username').setDescription('Override, defaults to your username').setRequired(false),
		)
		.setContexts(0)
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) {
			await interaction.reply({ content: 'This command can only be used in a guild', ephemeral: true });
			return;
		}

		const settings = await getSettings(interaction.guildId);
		const channel = interaction.guild.channels.cache.get(settings.pillowChannelId);
		if (!channel?.isTextBased()) {
			await interaction.reply({ content: 'Submission channel not found', ephemeral: true });
			return;
		}

		if (interaction.channelId !== settings.pillowChannelId) {
			await interaction.reply({
				content: 'This command can only be used in the pillow submission channel',
				ephemeral: true,
			});
			return;
		}

		const pillowName = interaction.options.getString('pillowname', true);
		const pillowType = interaction.options.getString('pillowtype', true);
		const texture = interaction.options.getAttachment('texture', true);
		const username = interaction.options.getString('username', false) ?? interaction.user.username;
		const embed = new EmbedBuilder()
			.setTitle(`${username}'s Pillow Submission`)
			.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
			.addFields(
				{ name: 'Pillow Name', value: pillowName },
				{ name: 'Pillow Type', value: pillowType },
				{ name: 'Submitted By', value: interaction.user.toString() },
			)
			.setImage(texture.url)
			.setTimestamp();

		const approveButton = new ButtonBuilder().setCustomId('approve').setLabel('Approve').setStyle(ButtonStyle.Success);

		const denyButton = new ButtonBuilder().setCustomId('deny').setLabel('Deny').setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, denyButton);

		if (texture.contentType !== 'image/png') {
			await interaction.reply({ content: 'Only PNG images are allowed', ephemeral: true });
			return;
		}

		await channel.send({ embeds: [embed], components: [row] });
		await interaction.reply({
			content: `Your pillow texture has been submitted for approval in ${channel}`,
			ephemeral: true,
		});
	},
} satisfies Command;
