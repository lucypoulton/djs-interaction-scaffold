import { isSubcommandRoot } from './command.js';
import { ApplicationCommandOptionType, ApplicationCommandType, Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
const Lazy = function (provider) {
    this.provider = provider;
    return () => this.thing ?? (this.thing = this.provider());
};
export class CommandManager {
    constructor(commands, client) {
        this.rest = new Lazy(() => new REST().setToken(this.client.token));
        this.commands = commands;
        this.client = client;
        client.on('interactionCreate', this.listener.bind(this));
    }
    async setup(route) {
        await this.rest().put(route, { body: Object.values(this.commands) });
    }
    async setupGlobally(clientId) {
        await this.setup(Routes.applicationCommands(clientId));
    }
    async setupForGuild(clientId, guildId) {
        await this.setup(Routes.applicationGuildCommands(clientId, guildId));
    }
    listener(interaction) {
        if (!interaction.isCommand())
            return;
        const handler = this.commands.find(cmd => cmd.name === interaction.commandName);
        if (!handler ||
            (interaction.isChatInputCommand() && handler.type !== ApplicationCommandType.ChatInput) ||
            (interaction.isMessageContextMenuCommand() && handler.type !== ApplicationCommandType.Message) ||
            (interaction.isUserContextMenuCommand() && handler.type !== ApplicationCommandType.User))
            return;
        try {
            if (interaction.isChatInputCommand() && isSubcommandRoot(handler)) {
                const groupName = interaction.options.getSubcommandGroup(false);
                const commandName = interaction.options.getSubcommand(true);
                const group = (groupName ? handler.options.find(opt => opt.type == ApplicationCommandOptionType.SubcommandGroup &&
                    opt.name == groupName)?.options : handler.options);
                group.find(opt => opt.name == commandName)?.handle(interaction);
            }
            else
                handler.handle?.(interaction);
        }
        catch (ex) {
            console.error(ex);
            interaction.reply('An error occurred').catch(() => console.error('Failed to send error message for the above exception'));
        }
    }
}
//# sourceMappingURL=commandManager.js.map