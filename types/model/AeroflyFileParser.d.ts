export declare class AeroflyFileParser {
    getNumber(subject: string, propertyName: string, defaultValue?: number): number;
    setNumber(subject: string, propertyName: string, value: number): string;
    getNumberArray(subject: string, propertyName: string): number[];
    getValue(subject: string, propertyName: string, defaultValue?: string): string;
    getBoolean(subject: string, propertyName: string): boolean;
    getValues(subject: string, propertyName: string): string[];
    setValue(subject: string, propertyName: string, value: string): string;
    getGroup(subject: string, groupType: string, indent?: number): string;
    getGroups(subject: string, groupType: string, indent?: number): string[];
    /**
     * Replaces the group of the given type in the subject with the provided insertValue. The group is identified by the groupType and the indent level.
     */
    setGroup(subject: string, groupType: string, indent: number, insertValue: string): string;
}
//# sourceMappingURL=AeroflyFileParser.d.ts.map