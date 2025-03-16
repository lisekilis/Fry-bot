export enum PillowType {
	BODY = 'BODY',
	NORMAL = 'NORMAL',
}
export type PillowData = {
	discordApproverId: string;
	discordUserId: string;
	pillowName: string;
	pillowType: PillowType;
	submittedAt: string;
	userName: string;
};
export type PhotoData = {
	date: string;
	discordUserId: string;
	key: string;
	submittedAt: string;
	userName: string;
};
export type Settings = {
	modRoleId: string;
	photoChannelId: string;
	pillowChannelId: string;
};
