## `djs-slash-helper`

Handles the faffy bit of setting up interaction-based command with Discord.js

## Usage

#### Defining command objects

Commands follow Discord's native format by implementing `Command<T>`.

```ts
import {InteractionFor} from './command.js'
import {MessageInteraction} from 'discord.js'

const command: Command<ApplicationCommandType.ChatInput> = {
	type: ApplicationCommandType.ChatInput,
	name: 'example',
	description: 'Example command',
	options: [{
		type: ApplicationCommandOptionType.String,
		name: "exampleArg",
		description: "hello",
	}],
	permissions: [{
		type: "ROLE",
		id: "role-id-goes-here",
		permission: true
	}],
	// optional, defaults to true
	default_permission: false,

	// this function may return anything and/or be async.
	// the type of interaction changes depending on the type
	// set earlier, see InteractionFor<T>
	handle(interaction: MessageInteraction) {
		// do something
	}
}
```

#### Registering commands

```ts
const manager = new CommandManager([yourCommand, anotherCommand], client);

// set up your bot first and set a token
await manager.setupGlobally('your-client-id');
// or
await manager.setupForGuild('your-client-id', 'your-guild-id')

```

#### Using subcommands

```ts
import {MessageInteraction} from 'discord.js'

const command: Command<ApplicationCommandType.ChatInput> = {
	// ...
    // you may also nest subcommands inside groups
	options: [{
		type: ApplicationCommandOptionType.Subcommand,
		name: "exampleArg",
		description: "hello",
		async handle(interaction: MessageInteraction) {
			// do something
		}
	}],
    // this method should be defined, however it will not be called
    // when subcommands are present
    handle() {}
}
```