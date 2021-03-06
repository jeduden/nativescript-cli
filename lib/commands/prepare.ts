export class PrepareCommand implements ICommand {
	constructor(private $errors: IErrors,
		private $platformService: IPlatformService,
		private $platformCommandParameter: ICommandParameter) { }

	execute(args: string[]): IFuture<void> {
		return (() => {
			this.$platformService.preparePlatform(args[0]).wait();
		}).future<void>()();
	}

	public canExecute(args: string[]): IFuture<boolean> {
		return this.$platformService.validateOptions(args[0]);
	}

	allowedParameters = [this.$platformCommandParameter];
}
$injector.registerCommand("prepare", PrepareCommand);
