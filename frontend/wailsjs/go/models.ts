export namespace main {
	
	export class fileInfo {
	    name: string;
	    description: string;
	    path: string;
	    destination: string;
	    iconDestination: string;
	    iconIndex: number;
	    extension: string;
	    isFolder: boolean;
	    iconId: string;
	
	    static createFrom(source: any = {}) {
	        return new fileInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.description = source["description"];
	        this.path = source["path"];
	        this.destination = source["destination"];
	        this.iconDestination = source["iconDestination"];
	        this.iconIndex = source["iconIndex"];
	        this.extension = source["extension"];
	        this.isFolder = source["isFolder"];
	        this.iconId = source["iconId"];
	    }
	}
	export class profile {
	    name: string;
	    id: string;
	    value: fileInfo[];
	
	    static createFrom(source: any = {}) {
	        return new profile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.id = source["id"];
	        this.value = this.convertValues(source["value"], fileInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	export class profileInfo {
	    value: any;
	    label: string;
	
	    static createFrom(source: any = {}) {
	        return new profileInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.value = source["value"];
	        this.label = source["label"];
	    }
	}

}

