# Kwizz MCP Server Configuration

This is a dedicated Model Context Protocol (MCP) server for the **Kwizz** project.

## Purpose
Provides AI agents with direct access to the Kwizz Supabase database for:
- Querying quiz packs and questions
- Managing active game sessions
- Monitoring player activity
- Creating new quiz content

## Configuration

### Local Development
Add to your `.cursor/mcp.json` or Claude Desktop config:

```json
{
  "mcpServers": {
    "kwizz-local": {
      "command": "python",
      "args": ["c:/Users/jonny/Desktop/AgOS 3.0 template/execution/mcp_supabase_kwizz.py"]
    }
  }
}
```

### Remote Access
The Kwizz Supabase instance also has a remote MCP endpoint:

```json
{
  "mcpServers": {
    "kwizz-remote": {
      "url": "https://mcp.supabase.com/mcp?project_ref=japkqygktnubcrmlttqt"
    }
  }
}
```

## Available Tools

### `list_quizzes(category?: string)`
List all quiz packs, optionally filtered by category.

### `get_quiz_details(quiz_id: string)`
Get full details including all questions for a specific quiz.

### `get_active_games()`
List all currently active game sessions with player counts.

### `create_quiz_pack(title: string, category: string, questions: array)`
Create a new quiz pack with questions (admin only).

## Environment Variables
Required in `Clients/kwizz/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Notes
- This MCP server uses the Service Role key for full database access
- For production, implement proper RLS policies and use anon key for client-side
- The server is project-specific and isolated from other Supabase instances
