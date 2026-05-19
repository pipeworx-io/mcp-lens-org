interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Lens.org MCP — patent + scholarly platform.
 *
 * Auth: Lens Bearer token. Platform: PLATFORM_LENS_KEY. BYO: ?_apiKey=…
 */


const BASE = 'https://api.lens.org';
const UA = 'pipeworx-mcp-lens-org/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'patents_search',
    description: 'Patent search.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text or Lucene-style query.' },
        size: { type: 'number', description: '1-1000 (default 25).' },
        from: { type: 'number' },
      },
      required: ['query'],
    },
  },
  {
    name: 'scholarly_search',
    description: 'Scholarly works search.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        size: { type: 'number' },
        from: { type: 'number' },
      },
      required: ['query'],
    },
  },
  { name: 'patent', description: 'Single patent by lens_id.', inputSchema: { type: 'object', properties: { lens_id: { type: 'string' } }, required: ['lens_id'] } },
  { name: 'scholarly', description: 'Single scholarly work.', inputSchema: { type: 'object', properties: { lens_id: { type: 'string' } }, required: ['lens_id'] } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('Lens.org requires a Bearer token. Get one free for academic use at https://www.lens.org/lens/user/subscriptions and pass via PLATFORM_LENS_KEY or ?_apiKey=…');
  const body = (extra: Record<string, unknown>) => ({
    query: { match: { 'title': reqStr(args, 'query', '"machine learning"') } },
    size: Math.min(1000, Math.max(1, (args.size as number) ?? 25)),
    from: Math.max(0, (args.from as number) ?? 0),
    ...extra,
  });
  switch (name) {
    case 'patents_search':
      return lensPost(apiKey, '/patent/search', body({}));
    case 'scholarly_search':
      return lensPost(apiKey, '/scholarly/search', body({}));
    case 'patent':
      return lensGet(apiKey, `/patent/${encodeURIComponent(reqStr(args, 'lens_id', '"<id>"'))}`);
    case 'scholarly':
      return lensGet(apiKey, `/scholarly/${encodeURIComponent(reqStr(args, 'lens_id', '"<id>"'))}`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function lensGet(apiKey: string, path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA, Authorization: `Bearer ${apiKey}` },
  });
  if (res.status === 401) throw new Error('Lens.org: 401 — invalid or expired token.');
  if (!res.ok) throw new Error(`Lens.org: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

async function lensPost(apiKey: string, path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': UA, Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('Lens.org: 401 — invalid or expired token.');
  if (!res.ok) throw new Error(`Lens.org: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
