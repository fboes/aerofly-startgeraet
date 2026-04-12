#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AeroflyFlightMcpResourceService } from "./services/AeroflyFlightMcpResourceService.js";
import { ApplicationService } from "../core/services/ApplicationService.js";
import { ResourceRegistry } from "./registry/ResourceRegistry.js";
import { ConfigurationRegistry } from "./registry/ConfigurationRegistry.js";
import { FlightRegistry } from "./registry/FlightRegistry.js";
import { Config } from "../core/io/Config.js";
import { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";
const server = new McpServer({
    name: ApplicationService.getApplicationSlug(),
    version: ApplicationService.getApplicationVersion(),
    description: `\
Flight plan and mission generator for Aerofly FS 4. This MCP server provides functionality to get the current state of the Aerofly FS 4 main configuration file \`main.mcf\`, adds tools to change these settings, and provides data sources for airports, aircraft and aircraft liveries.
- Call \`${FlightRegistry.METHOD_GET_FLIGHT}\` on starting the MCP server, as it will contain the initial state of \`main.mcf\`.
- Call tools to plan the next flight.
- Call \`${FlightRegistry.METHOD_SAVE_FLIGHT}\` to save the planning for the next flight back to the \`main.mcf\`.
- If the \`main.mcf\` is not readable, call \`${ConfigurationRegistry.METHOD_SET_CONFIG}\`.\
`,
});
const resourceService = new AeroflyFlightMcpResourceService();
ResourceRegistry.registerResources(server, resourceService);
ResourceRegistry.registerTools(server, resourceService);
const config = new Config();
ConfigurationRegistry.registerTools(server, config);
const flightService = new AeroflyFlightService(config);
try {
    flightService.readMainMcf();
}
catch (e) {
    process.stderr.write(`[${ApplicationService.getApplicationSlug()}] Configuration incomplete: ${e instanceof Error ? e.message : "Unknown error"} - please call \`${ConfigurationRegistry.METHOD_SET_CONFIG}\`\n`);
}
FlightRegistry.registerTools(server, flightService);
//FlightRegistry.registerPrompts(server);
const transport = new StdioServerTransport();
await server.connect(transport);
