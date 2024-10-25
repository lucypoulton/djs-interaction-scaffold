import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
export function isChatInputCommand(command) {
    return command.type === ApplicationCommandType.ChatInput;
}
export function isSubcommandRoot(command) {
    return isChatInputCommand(command) &&
        [ApplicationCommandOptionType.SubcommandGroup,
            ApplicationCommandOptionType.Subcommand].includes(command.options[0]?.type);
}
//# sourceMappingURL=command.js.map