export class DebugPlatformCommand implements ICommand {
	public allowedParameters: ICommandParameter[] = [];

	constructor(private debugService: IDebugService,
		private $devicesService: Mobile.IDevicesService,
		private $injector: IInjector,
		private $logger: ILogger,
		private $childProcess: IChildProcess,
		private $devicePlatformsConstants: Mobile.IDevicePlatformsConstants,
		private $config: IConfiguration,
		private $usbLiveSyncService: ILiveSyncService,
		private $platformService: IPlatformService,
		protected $options: IOptions) { }

	public async execute(args: string[]): Promise<void> {
		if (this.$options.start) {
			return this.debugService.debug();
		}

		await this.$platformService.deployPlatform(this.$devicesService.platform);
		this.$config.debugLivesync = true;
		let applicationReloadAction = async (deviceAppData: Mobile.IDeviceAppData): Promise<void> => {
			let projectData: IProjectData = this.$injector.resolve("projectData");

			await this.debugService.debugStop();

			let applicationId = deviceAppData.appIdentifier;
			if (deviceAppData.device.isEmulator && deviceAppData.platform.toLowerCase() === this.$devicePlatformsConstants.iOS.toLowerCase()) {
				applicationId = projectData.projectName;
			}

			await deviceAppData.device.applicationManager.stopApplication(applicationId);

			await this.debugService.debug();
		};
		return this.$usbLiveSyncService.liveSync(this.$devicesService.platform, applicationReloadAction);
	}

	public async canExecute(args: string[]): Promise<boolean> {
		await this.$devicesService.initialize({ platform: this.debugService.platform, deviceId: this.$options.device });
		// Start emulator if --emulator is selected or no devices found.
		if (this.$options.emulator || this.$devicesService.deviceCount === 0) {
			return true;
		}

		if (this.$devicesService.deviceCount > 1) {
			// Starting debugger on emulator.
			this.$options.emulator = true;

			this.$logger.warn("Multiple devices found! Starting debugger on emulator. If you want to debug on specific device please select device with --device option.".yellow.bold);
		}

		return true;
	}
}

export class DebugIOSCommand extends DebugPlatformCommand {
	constructor($iOSDebugService: IDebugService,
		$devicesService: Mobile.IDevicesService,
		$injector: IInjector,
		$logger: ILogger,
		$childProcess: IChildProcess,
		$devicePlatformsConstants: Mobile.IDevicePlatformsConstants,
		$config: IConfiguration,
		$usbLiveSyncService: ILiveSyncService,
		$platformService: IPlatformService,
		$options: IOptions) {
		super($iOSDebugService, $devicesService, $injector, $logger, $childProcess, $devicePlatformsConstants, $config, $usbLiveSyncService, $platformService, $options);
	}
}

$injector.registerCommand("debug|ios", DebugIOSCommand);

export class DebugAndroidCommand extends DebugPlatformCommand {
	constructor($androidDebugService: IDebugService,
		$devicesService: Mobile.IDevicesService,
		$injector: IInjector,
		$logger: ILogger,
		$childProcess: IChildProcess,
		$devicePlatformsConstants: Mobile.IDevicePlatformsConstants,
		$config: IConfiguration,
		$usbLiveSyncService: ILiveSyncService,
		$platformService: IPlatformService,
		$options: IOptions) {
		super($androidDebugService, $devicesService, $injector, $logger, $childProcess, $devicePlatformsConstants, $config, $usbLiveSyncService, $platformService, $options);
	}
}

$injector.registerCommand("debug|android", DebugAndroidCommand);
