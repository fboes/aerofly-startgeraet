#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as ApplicationService from "../core/services/getApplicationInformation.js";
import { Config } from "../core/io/Config.js";
import { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";
import { registerResourceHandlers } from "./registry/registerResourceHandlers.js";
import { registerFlightHandlers, TOOL_GET_FLIGHT, TOOL_SAVE_FLIGHT } from "./registry/registerFlightHandlers.js";
import { registerConfigurationHandlers, TOOL_SET_CONFIG } from "./registry/registerConfigurationHandlers.js";

const server = new McpServer({
    name: ApplicationService.getApplicationSlug(),
    version: ApplicationService.getApplicationVersion(),
    description: `\
Flight plan and mission generator for Aerofly FS 4. This MCP server provides functionality to get the current state of the Aerofly FS 4 main configuration file \`main.mcf\`, adds tools to change these settings, and provides data sources for airports, aircraft and aircraft liveries.
- Always call \`${TOOL_GET_FLIGHT}\` as the first step to read the initial state of \`main.mcf\` to the MCP server.
- Call additional tools to plan the next flight.
- Always call \`${TOOL_SAVE_FLIGHT}\` as the final step to write the state of the MCP server back to the \`main.mcf\` for Aerofly FS 4 to use.
- If the \`main.mcf\` is not readable, call \`${TOOL_SET_CONFIG}\` and make the user provide the path to this file.
`,
});

const config = new Config();
const flightService = new AeroflyFlightService(config);
try {
    flightService.readMainMcf();
} catch (e) {
    process.stderr.write(
        `[${ApplicationService.getApplicationSlug()}] Configuration incomplete: ${e instanceof Error ? e.message : "Unknown error"} - please call \`${TOOL_SET_CONFIG}\`\n`,
    );
}

registerConfigurationHandlers(server, config);
registerFlightHandlers(server, flightService);
registerResourceHandlers(server);

const transport = new StdioServerTransport();
await server.connect(transport);
