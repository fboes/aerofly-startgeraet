import PackageJson from "../../../package.json" with { type: "json" };
export class ApplicationService {
    static getPackageName() {
        return PackageJson.name;
    }
    static getApplicationSlug() {
        return this.getPackageName().replace(/^.*?\//, "");
    }
    static getApplicationName() {
        return "Aerofly Startgerät";
    }
    static getApplicationVersion() {
        return PackageJson.version;
    }
    static getApplicationNameVersion() {
        return this.getApplicationName() + " " + this.getApplicationVersion();
    }
    static getApplicationDescription() {
        return PackageJson.description;
    }
    static toJSON() {
        return {
            name: this.getApplicationName(),
            version: this.getApplicationVersion(),
            description: this.getApplicationDescription(),
        };
    }
}
