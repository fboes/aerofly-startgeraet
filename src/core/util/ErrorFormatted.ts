import { fmt } from "../formatter/format.js";

/**
 * Extended `Error` with included formatter for additonal arguments
 * @todo Package candidate
 */
export class ErrorFormatted extends Error {
    /**
     * @see fmt
     * @param messageRaw containing placesholders for args, eg `{{ count }}`
     * @param args can be used in `messageRaw`
     * @param code Optional error code for machine readability
     */
    constructor(
        public readonly messageRaw: string,
        public readonly args: Record<string, string | number> = {},
        public readonly code: string = "",
    ) {
        super(fmt(messageRaw, args));
    }
}
