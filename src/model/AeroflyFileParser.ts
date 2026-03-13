export class AeroflyFileParser {
  getNumber(subject: string, propertyName: string, defaultValue: number = 0): number {
    return Number(this.getValue(subject, propertyName, String(defaultValue)));
  }

  setNumber(subject: string, propertyName: string, value: number) {
    return this.setValue(subject, propertyName, String(value));
  }

  getNumberArray(subject: string, propertyName: string): number[] {
    return this.getValue(subject, propertyName)
      .split(" ")
      .map((i) => Number(i));
  }

  getValue(subject: string, propertyName: string, defaultValue: string = ""): string {
    const match = subject.match(new RegExp("(?:\\]\\s*\\[" + propertyName + "\\]\\s*\\[)([^\\]]*)(?:\\])"));
    return match ? match[1] : defaultValue;
  }

  getBoolean(subject: string, propertyName: string): boolean {
    const value = this.getValue(subject, propertyName);
    return value === "true";
  }

  getValues(subject: string, propertyName: string): string[] {
    const match = subject.matchAll(new RegExp("(?:\\]\\s*\\[" + propertyName + "\\]\\s*\\[)([^\\]]*)(?:\\])", "gm"));
    return match
      ? Array.from(match).map((m) => {
          return m[1];
        })
      : [];
  }

  setValue(subject: string, propertyName: string, value: string) {
    return value === undefined
      ? subject
      : subject.replace(new RegExp("(\\]\\[" + propertyName + "\\]\\[)[^\\]]*(\\])"), "$1" + value + "$2");
  }

  getGroup(subject: string, groupType: string, indent: number = 2): string {
    const indentString = "    ".repeat(indent);
    const match = subject.match(
      new RegExp("\\n" + indentString + "<\\[" + groupType + "\\][\\s\\S]+?\\n" + indentString + ">"),
    );
    return match ? match[0] : "";
  }

  getGroups(subject: string, groupType: string, indent: number = 2): string[] {
    const indentString = "    ".repeat(indent);
    const match = subject.matchAll(
      new RegExp("\\n" + indentString + "<\\[" + groupType + "\\][\\s\\S]+?\\n" + indentString + ">", "gm"),
    );
    return match
      ? Array.from(match).map((m) => {
          return m[0];
        })
      : [];
  }

  /**
   * Replaces the group of the given type in the subject with the provided insertValue. The group is identified by the groupType and the indent level.
   */
  setGroup(subject: string, groupType: string, indent: number, insertValue: string) {
    const indentString = "    ".repeat(indent);
    return subject.replace(
      new RegExp("(\\n" + indentString + ")(<\\[" + groupType + "\\]\\S*)([\\s\\S]+?)(\\n" + indentString + ">)"),
      (match: string, p1: string) => {
        return p1 + insertValue.trim();
      },
    );
  }
}
