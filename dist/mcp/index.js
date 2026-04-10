#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AeroflyFlightMcpResourceService } from "./services/AeroflyFlightMcpResourceService.js";
import { ApplicationService } from "../core/services/ApplicationService.js";
import { ResourceServer } from "./server/ResourceServer.js";
import { ConfigurationServer } from "./server/ConfigurationServer.js";
import { Config } from "../core/io/Config.js";
const server = new McpServer({
    name: ApplicationService.getApplicationSlug(),
    version: ApplicationService.getApplicationVersion(),
    description: `\
Flight plan and mission generator for Aerofly FS 4. This MCP server provides functionality to get the current state of \
the Aerofly FS 4 main configuration file \`main.mcf\`, adds tools to change these settings, and provides data sources for airports, \
aircraft and aircraft liveries. If the \`main.mcf\` is not readable, call \`${ConfigurationServer.METHOD_SET_CONFIG}\` and ask the user to supply the correct path to the \`main.mcf\`.
    `,
});
const resourceService = new AeroflyFlightMcpResourceService();
ResourceServer.registerResources(server, resourceService);
ResourceServer.registerTools(server, resourceService);
const config = new Config();
ConfigurationServer.registerTools(server, config);
const transport = new StdioServerTransport();
await server.connect(transport);
