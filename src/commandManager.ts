import {Client, Interaction, Snowflake} from 'discord.js'
import {Command, ExecutableSubcommand, isSubcommandRoot} from './command.js'
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	Routes
} from 'discord-api-types/v10'
import {REST} from '@discordjs/rest'

const Lazy = function <T>(this: any, provider: () => T): () => T {
	this.provider = provider
	return () => this.thing ?? (this.thing = this.provider())
} as unknown as { new<T>(provider: () => T): () => T }


export class CommandManager {
	private readonly commands: Command<ApplicationCommandType>[]
	private readonly client: Client
	private readonly rest = new Lazy<REST>(() => new REST().setToken(this.client.token!))

	constructor(commands: Command<ApplicationCommandType>[], client: Client) {
		this.commands = commands
		this.client = client
		client.on('interactionCreate', this.listener.bind(this))
	}

	private async setup(route: `/${string}`) {
		await this.rest().put(route, {body: Object.values(this.commands)})
	}


	async setupGlobally(clientId: Snowflake) {
		await this.setup(Routes.applicationCommands(clientId))
	}

	async setupForGuild(clientId: Snowflake, guildId: Snowflake) {
		await this.setup(Routes.applicationGuildCommands(clientId, guildId))
	}

	listener(interaction: Interaction) {
		if (!interaction.isApplicationCommand()) return;
		const handler = this.commands.find(cmd => cmd.name === interaction.commandName);

		if (!handler ||
			(interaction.isCommand() && handler.type !== ApplicationCommandType.ChatInput) ||
			(interaction.isMessageContextMenu() && handler.type !== ApplicationCommandType.Message) ||
			(interaction.isUserContextMenu() && handler.type !== ApplicationCommandType.User)
		) return;

		if (interaction.isCommand() && isSubcommandRoot(handler)) {
			const groupName = interaction.options.getSubcommandGroup(false);
			const commandName = interaction.options.getSubcommand(true);
			const group = (groupName ? handler.options.find(opt =>
				opt.type == ApplicationCommandOptionType.SubcommandGroup &&
				opt.name == groupName)?.options : handler.options) as ExecutableSubcommand[]
			group.find(opt => opt.name == commandName)?.handle(interaction);
		} else handler.handle(interaction as never);
	}
}