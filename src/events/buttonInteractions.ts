import { Buffer } from 'node:buffer';
import process from 'node:process';
import type { Interaction } from 'discord.js';
import { EmbedBuilder, Events } from 'discord.js';
import { getSettings } from '../util/cache.js';
import type { Event } from './index.js';

export default {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		if (!interaction.inCachedGuild() || !interaction.isButton()) return;

		const { customId, message } = interaction;
		const embed = message.embeds[0];

		if (!embed) {
			await interaction.reply({ content: 'No embed found in the message', ephemeral: true });
			return;
		}

		const settings = await getSettings(interaction.guildId!);
		switch (customId) {
			case 'approve':
				if (!interaction.memberPermissions.has('Administrator')) {
					if (!interaction.member.roles.cache.has(settings.modRoleId)) {
						await interaction.reply({
							content: 'You do not have the required permissions to use this command',
							ephemeral: true,
						});
						return;
					}

					await interaction.reply({
						content: 'You do not have the required permissions to use this command',
						ephemeral: true,
					});
					return;
				}

				try {
					const textureUrl = embed.image!.url;
					const response = await fetch(textureUrl);
					const arrayBuffer = await response.arrayBuffer();
					const buffer = Buffer.from(arrayBuffer);

					const formData = new FormData();
					const fileBlob = new Blob([buffer], { type: 'image/png' });
					formData.append('file', fileBlob, `${crypto.randomUUID()}.png`);
					formData.append(
						'discordUserId',
						embed.fields
							.find((field) => field.name === 'Submitted By')!
							.value.split(' ')[0]
							.slice(3, -1),
					);
					formData.append('discordApproverId', interaction.user.id);
					formData.append('pillowName', embed.fields.find((field) => field.name === 'Pillow Name')!.value);
					formData.append('submittedAt', message.createdTimestamp.toString());
					formData.append('pillowType', embed.fields.find((field) => field.name === 'Pillow Type')!.value);
					formData.append('userName', embed.title!.split("'s")[0]);

					await fetch(`https://fry.api.lisekils.dev/pillows/upload`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${process.env.FRY_API_TOKEN}`,
						},
						body: formData,
					});
				} catch (error) {
					console.error(`Failed to upload the pillow: ${error}`);
				}

				await message.edit({
					embeds: [
						EmbedBuilder.from(embed)
							.setFooter({
								text: `Approved by: ${interaction.user.username}`,
								iconURL: 'https://canary.discord.com/assets/43b7ead1fb91b731.svg',
							})
							.setTimestamp(Date.now()),
					],
					components: [],
				});
				await interaction.reply({ content: 'Submission approved', ephemeral: true });
				break;
			case 'deny':
				await message.edit({
					embeds: [
						EmbedBuilder.from(embed)
							.setFooter({
								text: `Denied by: ${interaction.user.username}`,
								iconURL: 'https://canary.discord.com/assets/4f584fe7b12fcf02.svg',
							})
							.setTimestamp(Date.now()),
					],
					components: [],
				});
				await interaction.reply({ content: 'Submission denied', ephemeral: true });
				break;
			default:
				await interaction.reply({ content: 'Unknown button interaction', ephemeral: true });
				break;
		}
	},
} satisfies Event;
