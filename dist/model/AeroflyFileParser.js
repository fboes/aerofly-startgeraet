export class AeroflyFileParser {
    getNumber(subject, propertyName, defaultValue = 0) {
        return Number(this.getValue(subject, propertyName, String(defaultValue)));
    }
    setNumber(subject, propertyName, value) {
        return this.setValue(subject, propertyName, String(value));
    }
    getNumberArray(subject, propertyName) {
        return this.getValue(subject, propertyName)
            .split(" ")
            .map((i) => Number(i));
    }
    getValue(subject, propertyName, defaultValue = "") {
        const match = subject.match(new RegExp("(?:\\]\\s*\\[" + propertyName + "\\]\\s*\\[)([^\\]]*)(?:\\])"));
        return match ? match[1] : defaultValue;
    }
    getBoolean(subject, propertyName) {
        const value = this.getValue(subject, propertyName);
        return value === "true";
    }
    getValues(subject, propertyName) {
        const match = subject.matchAll(new RegExp("(?:\\]\\s*\\[" + propertyName + "\\]\\s*\\[)([^\\]]*)(?:\\])", "gm"));
        return match
            ? Array.from(match).map((m) => {
                return m[1];
            })
            : [];
    }
    setValue(subject, propertyName, value) {
        return value === undefined
            ? subject
            : subject.replace(new RegExp("(\\]\\[" + propertyName + "\\]\\[)[^\\]]*(\\])"), "$1" + value + "$2");
    }
    getGroup(subject, groupType, indent = 2) {
        const indentString = "    ".repeat(indent);
        const match = subject.match(new RegExp("\\n" + indentString + "<\\[" + groupType + "\\][\\s\\S]+?\\n" + indentString + ">"));
        return match ? match[0] : "";
    }
    getGroups(subject, groupType, indent = 2) {
        const indentString = "    ".repeat(indent);
        const match = subject.matchAll(new RegExp("\\n" + indentString + "<\\[" + groupType + "\\][\\s\\S]+?\\n" + indentString + ">", "gm"));
        return match
            ? Array.from(match).map((m) => {
                return m[0];
            })
            : [];
    }
    /**
     * Replaces the group of the given type in the subject with the provided insertValue. The group is identified by the groupType and the indent level.
     */
    setGroup(subject, groupType, indent, insertValue) {
        const indentString = "    ".repeat(indent);
        return subject.replace(new RegExp("(\\n" + indentString + ")(<\\[" + groupType + "\\]\\S*)([\\s\\S]+?)(\\n" + indentString + ">)"), (match, p1) => {
            return p1 + insertValue.trim();
        });
    }
}
