#!/usr/bin/env python3
"""
Claude Agent SDK Backend for Twenty CRM
Uses Claude Agent SDK for production-ready AI agent with Skills and tool execution
"""

import os
import json
import anyio
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Claude Agent SDK imports
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    create_sdk_mcp_server,
    AssistantMessage,
    TextBlock,
)

# Import CRM tools
from crm_tools import search_companies, search_contacts, get_company_details, create_task

# Load environment variables
load_dotenv()

app = FastAPI(title="Twenty CRM AI Agent (Claude Agent SDK)")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
SKILLS_PATH = Path(__file__).parent / "skills"

# Create MCP server with CRM tools
crm_tools_server = create_sdk_mcp_server(
    name="twenty-crm",
    version="1.0.0",
    tools=[search_companies, search_contacts, get_company_details, create_task]
)

print(f"✅ CRM Tools MCP Server created with {len([search_companies, search_contacts, get_company_details, create_task])} tools")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Claude Agent SDK Backend",
        "features": [
            "Claude Agent SDK Integration",
            "CRM Tools (MCP)",
            "Insurance Knowledge Skills",
            "Streaming Responses"
        ],
        "tools": [
            "search_companies",
            "search_contacts",
            "get_company_details",
            "create_task"
        ]
    }


@app.post("/api/chat")
async def chat(request: Request):
    """
    Chat endpoint using Claude Agent SDK
    Supports streaming responses with tool execution and Skills
    """
    try:
        body = await request.json()
        messages = body.get("messages", [])

        if not messages:
            return {"error": "No messages provided"}

        # Get the last user message
        user_message = messages[-1]["content"] if messages else ""

        print(f"[Agent SDK] Received query: {user_message[:100]}...")

        async def generate_stream():
            """Generate streaming response using Claude Agent SDK"""
            try:
                # Configure agent options
                options = ClaudeAgentOptions(
                    system_prompt="""You are a helpful AI assistant integrated into Twenty CRM.

You have access to:
1. **Twenty CRM Database** - Search companies and contacts, get detailed information
2. **Insurance Knowledge Base** - Comprehensive insurance domain expertise (life, health, underwriting, claims, compliance)

When users ask about:
- Companies or contacts → Use the CRM tools to search the database
- Insurance topics → Reference your insurance knowledge base
- General questions → Provide helpful, concise answers

Be conversational, helpful, and professional.""",
                    mcp_servers={"crm": crm_tools_server},
                    allowed_tools=[
                        "mcp__crm__search_companies",
                        "mcp__crm__search_contacts",
                        "mcp__crm__get_company_details",
                        "mcp__crm__create_task",
                        "Read",  # Allow filesystem access for Skills
                        "Grep",
                    ],
                    permission_mode="acceptEdits",
                    max_turns=10,
                    cwd="/Users/grant/Desktop/twenty-via",  # Project root for Skills access
                    setting_sources=["project"],  # Load Skills from .claude/skills/
                )

                print("[Agent SDK] Starting query with Agent SDK...")

                # Use Claude Agent SDK query function
                async for message in query(prompt=user_message, options=options):
                    if isinstance(message, AssistantMessage):
                        # Stream text content
                        for block in message.content:
                            if isinstance(block, TextBlock):
                                text = block.text
                                # Send in AI SDK data stream format for frontend compatibility
                                yield f'0:{json.dumps(text)}\n'

                print("[Agent SDK] Stream completed")

            except Exception as e:
                print(f"[Agent SDK] Stream error: {e}")
                import traceback
                traceback.print_exc()
                error_msg = f"Sorry, I encountered an error: {str(e)}"
                yield f'0:{json.dumps(error_msg)}\n'

        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "X-Content-Type-Options": "nosniff",
                "Transfer-Encoding": "chunked"
            }
        )

    except Exception as e:
        print(f"[Agent SDK] Error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


if __name__ == "__main__":
    print("\n🤖 Claude Agent SDK Backend Starting...")
    print(f"📡 Chat endpoint: http://localhost:3002/api/chat")
    print(f"💚 Health check: http://localhost:3002/health")
    print(f"🔧 Features: Agent SDK, CRM Tools (MCP), Insurance Skills")
    print(f"📚 Skills path: {SKILLS_PATH}")
    print()

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3002,
        log_level="info"
    )
