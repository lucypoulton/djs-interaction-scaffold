import {
    APIApplicationCommandBasicOption,
    APIApplicationCommandSubcommandGroupOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
    ApplicationCommandType
} from 'discord-api-types/v10';
import {CommandInteraction, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction} from 'discord.js'

export type InteractionFor<T extends ApplicationCommandType> = {
    [ApplicationCommandType.Message]: MessageContextMenuCommandInteraction,
    [ApplicationCommandType.ChatInput]: CommandInteraction,
    [ApplicationCommandType.User]: UserContextMenuCommandInteraction
    [ApplicationCommandType.PrimaryEntryPoint]: never
}[T]

interface BaseCommand<T extends ApplicationCommandType> {
    name: string
    type: T,
    default_permission?: boolean,

    handle(interaction: InteractionFor<T>): unknown
}

interface ChatInputCommand extends BaseCommand<ApplicationCommandType.ChatInput> {
    description: string,
    options:
        APIApplicationCommandBasicOption[] |
        (ExecutableSubcommand | ExecutableSubcommandGroup)[]
}

interface SubcommandRoot extends ChatInputCommand {
    options: (ExecutableSubcommandGroup | ExecutableSubcommand)[]
}

export type Command<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput ?
        ChatInputCommand :
        BaseCommand<T>

export interface ExecutableSubcommandGroup extends APIApplicationCommandSubcommandGroupOption {
    options: ExecutableSubcommand[]
}

export interface ExecutableSubcommand extends APIApplicationCommandSubcommandOption {
    handle(interaction: CommandInteraction): unknown
}

export function isChatInputCommand(command: Command<any>): command is ChatInputCommand {
    return command.type === ApplicationCommandType.ChatInput;
}

export function isSubcommandRoot(command: Command<any>): command is SubcommandRoot {
    return isChatInputCommand(command) &&
        [ApplicationCommandOptionType.SubcommandGroup,
            ApplicationCommandOptionType.Subcommand].includes(command.options[0]?.type)
}
