import {
	APIApplicationCommandOption,
	ApplicationCommandType
} from 'discord-api-types/v10'
import {
	ApplicationCommandPermissionData,
	CommandInteraction,
	MessageContextMenuInteraction,
	UserContextMenuInteraction
} from 'discord.js'


export type InteractionFor<T extends ApplicationCommandType> = {
	[ApplicationCommandType.Message]: MessageContextMenuInteraction,
	[ApplicationCommandType.ChatInput]: CommandInteraction,
	[ApplicationCommandType.User]: UserContextMenuInteraction
}[T]

interface BaseCommand<T extends ApplicationCommandType> {
	name: string
	type: T,
	permissions: ApplicationCommandPermissionData[],
	default_permission?: boolean,

	handle(interaction: InteractionFor<T>): unknown
}

export type Command<T extends ApplicationCommandType> = BaseCommand<T> &
	(T extends ApplicationCommandType.ChatInput ?
	{ description: string, options?: APIApplicationCommandOption[] } :
	{})