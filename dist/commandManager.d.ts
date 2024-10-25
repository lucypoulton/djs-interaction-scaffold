import { Client, Interaction, Snowflake } from 'discord.js';
import { Command } from './command.js';
import { ApplicationCommandType } from 'discord-api-types/v10';
export declare class CommandManager {
    private readonly commands;
    private readonly client;
    private readonly rest;
    constructor(commands: Command<ApplicationCommandType>[], client: Client);
    private setup;
    setupGlobally(clientId: Snowflake): Promise<void>;
    setupForGuild(clientId: Snowflake, guildId: Snowflake): Promise<void>;
    listener(interaction: Interaction): void;
}
//# sourceMappingURL=commandManager.d.ts.map