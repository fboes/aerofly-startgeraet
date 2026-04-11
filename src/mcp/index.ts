#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AeroflyFlightMcpResourceService } from "./services/AeroflyFlightMcpResourceService.js";
import { ApplicationService } from "../core/services/ApplicationService.js";
import { ResourceServer } from "./server/ResourceServer.js";
import { ConfigurationServer } from "./server/ConfigurationServer.js";
import { FlightServer } from "./server/FlightServer.js";
import { Config } from "../core/io/Config.js";
import { AeroflyFlightService } from "../core/services/AeroflyFlightService.js";

const server = new McpServer({
    name: ApplicationService.getApplicationSlug(),
    version: ApplicationService.getApplicationVersion(),
    description: `\
Flight plan and mission generator for Aerofly FS 4. This MCP server provides functionality to get the current state of the Aerofly FS 4 main configuration file \`main.mcf\`, adds tools to change these settings, and provides data sources for airports, aircraft and aircraft liveries.
- Call \`${FlightServer.METHOD_GET_FLIGHT}\` on starting the MCP server, as it will contain the initial state of \`main.mcf\`.
- Call tools to plan the next flight.
- Call \`${FlightServer.METHOD_SAVE_FLIGHT}\` to save the planning for the next flight back to the \`main.mcf\`.
- If the \`main.mcf\` is not readable, call \`${ConfigurationServer.METHOD_SET_CONFIG}\`.\
`,
});

const resourceService = new AeroflyFlightMcpResourceService();
ResourceServer.registerResources(server, resourceService);
ResourceServer.registerTools(server, resourceService);

const config = new Config();
ConfigurationServer.registerTools(server, config);

const flightService = new AeroflyFlightService(config);
FlightServer.registerTools(server, flightService);

const transport = new StdioServerTransport();
await server.connect(transport);
