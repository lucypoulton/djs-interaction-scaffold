import {ApplicationCommand, Client, Collection, Interaction, Snowflake} from 'discord.js'
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

	private async setupPermissions(commands: Collection<Snowflake, ApplicationCommand<any>>, guild?: Snowflake) {
		return Promise.all(commands.map(async (cmd) => {
			const localCommand = this.commands.find(localCmd => cmd.name === localCmd.name);
			if (!localCommand || !localCommand.permissions) return
			return cmd.permissions.set({
				guild,
				permissions: localCommand.permissions
			})
		}))
	}

	async setupGlobally(clientId: Snowflake) {
		await this.setup(Routes.applicationCommands(clientId))
		const commands = await this.client.application?.commands.fetch()
		if (!commands) return
		await this.setupPermissions(commands)
	}

	async setupForGuild(clientId: Snowflake, guildId: Snowflake) {
		await this.setup(Routes.applicationGuildCommands(clientId, guildId))
		const guild = await this.client.guilds?.fetch(guildId);
		const commands = await guild.commands.fetch()
		if (!commands) return
		console.log('Setting up ' + commands.size + " commands")
		await this.setupPermissions(commands, guildId)
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