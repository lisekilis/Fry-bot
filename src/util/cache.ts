import process from 'node:process';
import type { Settings } from '../types.js';

const settingsCache = new Map<string, any>();

export async function getSettings(guildId: string): Promise<Settings> {
	if (settingsCache.has(guildId)) {
		return settingsCache.get(guildId);
	}

	const response = await fetch(`https://fry.api.lisekilis.dev/settings/${guildId}`, {
		headers: {
			Authorization: `Bearer ${process.env.FRY_API_TOKEN}`,
		},
	});
	if (response.status !== 200) {
		throw new Error(`Failed to fetch settings: ${response.statusText}`);
	}

	const settings = (await response.json()) as Settings;
	settingsCache.set(guildId, settings);
	return settings;
}

export async function patchSettings(guildId: string, updatedSettings: object): Promise<Settings> {
	const response = await fetch(`https://fry.api.lisekilis.dev/settings/${guildId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.FRY_API_TOKEN}`,
		},
		body: JSON.stringify(updatedSettings),
	});
	if (response.status !== 200) {
		throw new Error(`Failed to patch settings: ${response.statusText}`);
	}

	const newSettings = (await response.json()) as Settings;
	settingsCache.set(guildId, newSettings);
	return newSettings;
}

export function updateSettingsCache(guildId: string, settings: any) {
	settingsCache.set(guildId, settings);
}
