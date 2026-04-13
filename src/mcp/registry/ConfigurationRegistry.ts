import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Config } from "../../core/io/Config.js";
import { McpHelper } from "../util/McpHelper.js";
import { z } from "zod";

export class ConfigurationRegistry {
    static readonly TOOL_GET_CONFIG = "get-config";
    static readonly TOOL_SET_CONFIG = "set-config";

    static registerTools(server: McpServer, config: Config): void {
        server.registerTool(
            this.TOOL_GET_CONFIG,
            {
                title: `Get configuration of MCP server`,
                description: `Show the basic settings of the MCP server. Contains data needed to interface with Aerofly FS 4 as well as the local file system. To change this configuration, call \`${this.TOOL_SET_CONFIG}\`.`,
                annotations: {
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
            },
            async () => ({
                content: [
                    {
                        type: "text",
                        text: McpHelper.JSONstrinigify(config),
                    },
                ],
            }),
        );

        server.registerTool(
            this.TOOL_SET_CONFIG,
            {
                title: `Set configuration of MCP server`,
                description: `Update the basic settings of the MCP server, like data needed to interface with Aerofly FS 4 as well as the local file system. After updating will return the new configuration state.`,
                inputSchema: {
                    mainMcfFilePath: z
                        .string()
                        .optional()
                        .describe(
                            `Absolute path to the \`main.mcf\` file. This file is the main interface to Aerofly FS 4 and is crucial for reading and writting mission data to Aerofly FS 4.`,
                        ),
                    simBriefUserName: z
                        .string()
                        .optional()
                        .describe(
                            `Username or UserID for SimBrief API. Only required if user asks to populate Aerofly FS 4 by importing a Simbrief flightplan.`,
                        ),
                },
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: true,
                    idempotentHint: true,
                    openWorldHint: true,
                },
            },
            async ({ mainMcfFilePath, simBriefUserName }: { mainMcfFilePath?: string; simBriefUserName?: string }) => {
                if (mainMcfFilePath !== undefined) {
                    config.mainMcfFilePath = mainMcfFilePath;
                }
                if (simBriefUserName !== undefined) {
                    config.simBriefUserName = simBriefUserName;
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: McpHelper.JSONstringifyResult(config),
                        },
                    ],
                };
            },
        );
    }
}
