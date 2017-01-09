export class PrepareCommand implements ICommand {
	public allowedParameters = [this.$platformCommandParameter];

	constructor(private $errors: IErrors,
		private $platformService: IPlatformService,
		private $platformCommandParameter: ICommandParameter) { }

	public async execute(args: string[]): Promise<void> {
		await this.$platformService.preparePlatform(args[0]);
	}

	public canExecute(args: string[]): Promise<boolean> {
		return this.$platformService.validateOptions(args[0]);
	}
}

$injector.registerCommand("prepare", PrepareCommand);
