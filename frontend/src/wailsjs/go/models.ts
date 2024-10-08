export namespace main {
	
	export class Config {
	    theme?: string;
	    colorScheme?: string;
	    useSystemTitleBar?: boolean;
	    enableLogging?: boolean;
	    enableTrace?: boolean;
	    enableDebug?: boolean;
	    enableInfo?: boolean;
	    enableWarn?: boolean;
	    enableError?: boolean;
	    enableFatal?: boolean;
	    maxLogFiles?: number;
	    language?: string;
	    saveWindowStatus?: boolean;
	    windowStartState?: number;
	    windowStartPositionX?: number;
	    windowStartPositionY?: number;
	    windowStartSizeX?: number;
	    windowStartSizeY?: number;
	    windowScale?: number;
	    opacity?: number;
	    windowEffect?: number;
	    checkForUpdates?: boolean;
	    lastUpdateCheck?: number;
	    matchLnkByDestination?: boolean;
	    matchURLByDestination?: boolean;
	    renameMatchedFiles?: boolean;
	    changeDescriptionOfMathcedLnkFiles?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.theme = source["theme"];
	        this.colorScheme = source["colorScheme"];
	        this.useSystemTitleBar = source["useSystemTitleBar"];
	        this.enableLogging = source["enableLogging"];
	        this.enableTrace = source["enableTrace"];
	        this.enableDebug = source["enableDebug"];
	        this.enableInfo = source["enableInfo"];
	        this.enableWarn = source["enableWarn"];
	        this.enableError = source["enableError"];
	        this.enableFatal = source["enableFatal"];
	        this.maxLogFiles = source["maxLogFiles"];
	        this.language = source["language"];
	        this.saveWindowStatus = source["saveWindowStatus"];
	        this.windowStartState = source["windowStartState"];
	        this.windowStartPositionX = source["windowStartPositionX"];
	        this.windowStartPositionY = source["windowStartPositionY"];
	        this.windowStartSizeX = source["windowStartSizeX"];
	        this.windowStartSizeY = source["windowStartSizeY"];
	        this.windowScale = source["windowScale"];
	        this.opacity = source["opacity"];
	        this.windowEffect = source["windowEffect"];
	        this.checkForUpdates = source["checkForUpdates"];
	        this.lastUpdateCheck = source["lastUpdateCheck"];
	        this.matchLnkByDestination = source["matchLnkByDestination"];
	        this.matchURLByDestination = source["matchURLByDestination"];
	        this.renameMatchedFiles = source["renameMatchedFiles"];
	        this.changeDescriptionOfMathcedLnkFiles = source["changeDescriptionOfMathcedLnkFiles"];
	    }
	}
	export class FileInfo {
	    id: string;
	    name: string;
	    description: string;
	    path: string;
	    destinationPath: string;
	    extension: string;
	    hasIcon: boolean;
	    iconId: string;
	
	    static createFrom(source: any = {}) {
	        return new FileInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.path = source["path"];
	        this.destinationPath = source["destinationPath"];
	        this.extension = source["extension"];
	        this.hasIcon = source["hasIcon"];
	        this.iconId = source["iconId"];
	    }
	}
	export class IconPackSettings {
	    enabled: boolean;
	    cornerRadius: number;
	    opacity: number;
	
	    static createFrom(source: any = {}) {
	        return new IconPackSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.cornerRadius = source["cornerRadius"];
	        this.opacity = source["opacity"];
	    }
	}
	export class Metadata {
	    id: string;
	    name: string;
	    version: string;
	    author: string;
	    license: string;
	    description: string;
	    iconName: string;
	
	    static createFrom(source: any = {}) {
	        return new Metadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.version = source["version"];
	        this.author = source["author"];
	        this.license = source["license"];
	        this.description = source["description"];
	        this.iconName = source["iconName"];
	    }
	}
	export class IconPack {
	    metadata: Metadata;
	    files: FileInfo[];
	    settings: IconPackSettings;
	
	    static createFrom(source: any = {}) {
	        return new IconPack(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.metadata = this.convertValues(source["metadata"], Metadata);
	        this.files = this.convertValues(source["files"], FileInfo);
	        this.settings = this.convertValues(source["settings"], IconPackSettings);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class SelectImage {
	    id: string;
	    path: string;
	    tempPath: string;
	    hasOriginal: boolean;
	    hasTemp: boolean;
	    isRemoved: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SelectImage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.path = source["path"];
	        this.tempPath = source["tempPath"];
	        this.hasOriginal = source["hasOriginal"];
	        this.hasTemp = source["hasTemp"];
	        this.isRemoved = source["isRemoved"];
	    }
	}
	export class UpdateInfo {
	    updateAvailable: boolean;
	    currentVersion: string;
	    latestVersion: string;
	    name: string;
	    releaseNotes: string;
	    downloadUrl: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.updateAvailable = source["updateAvailable"];
	        this.currentVersion = source["currentVersion"];
	        this.latestVersion = source["latestVersion"];
	        this.name = source["name"];
	        this.releaseNotes = source["releaseNotes"];
	        this.downloadUrl = source["downloadUrl"];
	    }
	}

}

