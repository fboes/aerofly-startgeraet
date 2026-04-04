import PackageJson from "../../../package.json" with { type: "json" };

export class ApplicationService {
    static getApplicationName(): string {
        return "Aerofly Startgerät";
    }

    static getApplicationVersion(): string {
        return PackageJson.version;
    }

    static getApplicationNameVersion(): string {
        return this.getApplicationName() + " " + this.getApplicationVersion();
    }

    static getApplicationDescription(): string {
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
