# Supabase MCP Server Setup Guide

## What is Supabase MCP?

The Supabase MCP (Model Context Protocol) server allows you to connect AI tools like Cursor directly to your Supabase database. This enables your AI assistant to:

- Create and manage database tables
- Execute SQL queries
- Fetch project configuration
- Generate TypeScript types from your schema
- Manage database migrations
- Access project logs for debugging
- Create new Supabase projects

## Prerequisites

1. **Node.js** (already installed ✓)
2. **Supabase Project** (you already have one ✓)
3. **Cursor IDE** (you're using this ✓)

## Step 1: Create Personal Access Token

1. Go to [supabase.com](https://supabase.com)
2. Click on your profile (top right)
3. Go to "Account Settings"
4. Navigate to "Access Tokens" tab
5. Click "Create new token"
6. Give it a name like "MCP Server Token"
7. Copy the token immediately (you won't see it again!)

## Step 2: Get Your Project Reference

1. Go to your Supabase project dashboard
2. Navigate to "Settings" → "General"
3. Find your "Project ID" - this is your project reference
4. Copy this ID

## Step 3: Update MCP Configuration

Edit the file `.cursor/mcp.json` and replace the placeholders:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_ID_HERE"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN_HERE"
      }
    }
  }
}
```

## Step 4: Configure Cursor

1. Open Cursor
2. Go to "Settings" (Cmd/Ctrl + ,)
3. Navigate to "MCP" section
4. You should see your Supabase MCP server listed
5. It should show a green "active" status

## Step 5: Test the Connection

Try asking Cursor to:
- "List all tables in my Supabase database"
- "Show me the schema for the landing_pages table"
- "Generate TypeScript types for my database"

## Available MCP Tools

The Supabase MCP server provides these tools:

### Database Operations
- `list_tables`: List all tables in your database
- `execute_sql`: Run SQL queries (read-only mode)
- `apply_migration`: Apply database migrations
- `list_extensions`: List installed PostgreSQL extensions

### Project Management
- `get_project_url`: Get your project's API URL
- `get_anon_key`: Get anonymous API key
- `create_project`: Create new Supabase projects
- `pause_project`: Pause a project
- `restore_project`: Restore a paused project

### Development Tools
- `generate_typescript_types`: Generate TypeScript types from schema
- `get_logs`: Access project logs for debugging
- `get_advisors`: Get security and performance advisories

### Documentation
- `search_docs`: Search Supabase documentation

## Security Features

The MCP server is configured with:
- **Read-only mode**: Prevents accidental data modification
- **Project scoping**: Limited to your specific project
- **Token-based authentication**: Uses your personal access token

## Troubleshooting

### Server Not Connecting
1. Check your personal access token is valid
2. Verify your project reference is correct
3. Restart Cursor after configuration changes

### Permission Errors
1. Ensure your personal access token has sufficient permissions
2. Check if your Supabase project is active (not paused)

### Command Not Found
1. Ensure Node.js is installed and in PATH
2. The MCP server will auto-download on first use via npx

## Advanced Configuration

### Remove Read-Only Mode (Use with Caution)
If you want to allow write operations, remove the `--read-only` flag:

```json
"args": [
  "-y",
  "@supabase/mcp-server-supabase@latest",
  "--project-ref=YOUR_PROJECT_ID_HERE"
]
```

### Enable Specific Feature Groups
You can limit which tools are available:

```json
"args": [
  "-y",
  "@supabase/mcp-server-supabase@latest",
  "--project-ref=YOUR_PROJECT_ID_HERE",
  "--features=database,docs,development"
]
```

Available feature groups:
- `account`: Project and organization management
- `database`: Database operations
- `docs`: Documentation search
- `development`: Development tools
- `functions`: Edge Functions management
- `debug`: Logging and debugging
- `branching`: Database branching (experimental)

## Next Steps

Once configured, you can:
1. Ask Cursor to analyze your database schema
2. Generate TypeScript types for your project
3. Create database migrations through AI
4. Debug issues using project logs
5. Search Supabase documentation contextually

## Support

If you encounter issues:
1. Check the [Supabase MCP documentation](https://supabase.com/docs/guides/getting-started/mcp)
2. Visit the [GitHub repository](https://github.com/supabase/mcp-server-supabase)
3. Ask questions in the Supabase Discord community 