import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getCredentials, callEchoTikApi, buildAuthHeader } from "./client.mjs";
import { routeRequest, searchDocs } from "./router.mjs";
import { runReportWorkflow } from "./report-executor.mjs";

const server = new McpServer({
  name: "echotik-mcp-lite",
  version: "0.1.0"
});

server.tool(
  "echotik_status",
  "Check EchoTik MCP setup status and show the next safe onboarding step.",
  {},
  async () => {
    const credentials = getCredentials();
    const authPreview = credentials.isConfigured
      ? `${(credentials.authHeader || buildAuthHeader(credentials.username, credentials.password)).slice(0, 18)}...`
      : null;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              configured: credentials.isConfigured,
              baseUrl: credentials.baseUrl,
              authPreview,
              nextStep: credentials.isConfigured
                ? "Credentials are configured. You can route or call EchoTik APIs now."
                : "Set ECHOTIK_USERNAME and ECHOTIK_PASSWORD, or ECHOTIK_AUTH_HEADER, then restart the MCP server."
            },
            null,
            2
          )
        }
      ]
    };
  }
);

server.tool(
  "echotik_docs_search",
  "Search EchoTik API capabilities, endpoint families, and documentation pages by natural language.",
  {
    query: z.string().min(1),
    limit: z.number().int().min(1).max(20).default(8)
  },
  async ({ query, limit }) => {
    const results = searchDocs(query, limit);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query,
              results
            },
            null,
            2
          )
        }
      ]
    };
  }
);

server.tool(
  "echotik_route_request",
  "Convert a natural-language business request into the best EchoTik scenario, endpoints, and suggested parameters.",
  {
    request: z.string().min(1)
  },
  async ({ request }) => {
    const result = routeRequest(request);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "echotik_call_api",
  "Call any EchoTik API path directly with Basic Auth using local credentials.",
  {
    path: z.string().startsWith("/api/v3/"),
    method: z.enum(["GET", "POST"]).default("GET"),
    query: z.record(z.string(), z.any()).optional(),
    body: z.record(z.string(), z.any()).optional()
  },
  async ({ path, method, query, body }) => {
    const result = await callEchoTikApi({ path, method, query, body });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "echotik_execute_report",
  "Plan or execute a structured multi-endpoint EchoTik report workflow for creators, products, sellers, or videos.",
  {
    entityType: z.enum(["creator", "product", "seller", "video"]),
    identifier: z.string().min(1),
    identifierType: z.string().optional(),
    includeSections: z.array(z.string()).optional(),
    mode: z.enum(["auto", "offline", "realtime"]).default("auto"),
    region: z.string().optional(),
    pageSize: z.number().int().min(1).max(10).default(10),
    execute: z.boolean().default(false)
  },
  async ({ entityType, identifier, identifierType, includeSections, mode, region, pageSize, execute }) => {
    const result = await runReportWorkflow({
      entityType,
      identifier,
      identifierType,
      includeSections,
      mode,
      region,
      pageSize,
      execute
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
