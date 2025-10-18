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
    ToolUseBlock,
    ToolResultBlock,
    ThinkingBlock,
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
                    system_prompt="""You are a helpful AI assistant integrated into Twenty CRM with comprehensive insurance domain expertise.

You have access to:
1. **Twenty CRM Database** - Search companies and contacts via MCP tools
2. **Insurance Knowledge Skills** - 2,280+ pages of California insurance expertise in .claude/skills/:
   - ca-insurance-code: Producer licensing, CE requirements, agent regulations
   - ca-programs: Proposition 103, FAIR Plan, CEA earthquake insurance
   - coverage-concepts: Auto, home, commercial, liability coverage
   - workers-comp: California workers' compensation system
   - forms-endorsements: ISO and ACORD forms
   - ca-market: Current California insurance market conditions

IMPORTANT: For insurance questions, you MUST use the Read and Grep tools to access the Skills files in .claude/skills/.
DO NOT rely on general knowledge alone. The Skills contain detailed, authoritative information.

Examples:
- CEA deductibles → Read .claude/skills/ca-programs/reference/cea/rates-deductibles.md
- Agent licensing → Read .claude/skills/ca-insurance-code/reference/agent-licensing.md
- FAIR Plan coverage → Read .claude/skills/ca-programs/reference/fair-plan/coverage.md

When users ask about:
- Companies or contacts → Use MCP CRM tools
- Insurance topics → Use Read/Grep tools to access Skills files
- General questions → Provide helpful, concise answers

Be conversational, helpful, and professional. Always cite which Skill file you referenced.""",
                    mcp_servers={"crm": crm_tools_server},
                    allowed_tools=[
                        "mcp__crm__search_companies",
                        "mcp__crm__search_contacts",
                        "mcp__crm__get_company_details",
                        "mcp__crm__create_task",
                        "Read",  # Allow filesystem access for Skills
                        "Grep",  # Allow searching within Skills files
                        "Glob",  # Allow finding Skills files
                    ],
                    # Note: By only allowing specific tools, WebSearch/WebFetch are implicitly blocked
                    permission_mode="acceptEdits",
                    max_turns=10,
                    cwd="/Users/grant/Desktop/twenty-via",  # Project root for Skills access
                    setting_sources=["project"],  # Load Skills from .claude/skills/
                )

                print("[Agent SDK] Starting query with Agent SDK...")

                # Use Claude Agent SDK query function
                async for message in query(prompt=user_message, options=options):
                    # Log ALL message types for debugging
                    print(f"[Agent SDK] Message type: {type(message).__name__}")

                    if isinstance(message, AssistantMessage):
                        # Stream all content blocks
                        for block in message.content:
                            if isinstance(block, TextBlock):
                                # Stream text content as data part
                                text = block.text
                                yield f'0:{json.dumps(text)}\n'

                            elif isinstance(block, ToolUseBlock):
                                # Stream tool use as reasoning event
                                tool_name = block.name
                                tool_input = json.dumps(block.input) if hasattr(block, 'input') else ''
                                reasoning_text = f"🔧 Using tool: {tool_name}"

                                # Add tool input details for Read/Grep tools
                                if tool_name == "Read" and 'file_path' in str(tool_input):
                                    file_path = block.input.get('file_path', '') if hasattr(block, 'input') else ''
                                    if file_path:
                                        reasoning_text = f"📖 Reading Skills file: {file_path}"
                                elif tool_name == "Grep" and 'pattern' in str(tool_input):
                                    pattern = block.input.get('pattern', '') if hasattr(block, 'input') else ''
                                    if pattern:
                                        reasoning_text = f"🔍 Searching Skills for: {pattern}"

                                # Stream as reasoning part
                                yield f'8:{json.dumps(reasoning_text)}\n'
                                print(f"[Agent SDK] Tool use: {tool_name}")

                            elif isinstance(block, ThinkingBlock):
                                # Stream thinking as reasoning event
                                thinking_text = block.thinking if hasattr(block, 'thinking') else str(block)
                                yield f'8:{json.dumps(f"💭 {thinking_text}")}\n'
                                print(f"[Agent SDK] Thinking block")

                            elif isinstance(block, ToolResultBlock):
                                # Optionally stream tool results as reasoning
                                print(f"[Agent SDK] Tool result received")

                            else:
                                # Log other block types
                                print(f"[Agent SDK] Other block type: {type(block).__name__}")
                    else:
                        # Log non-assistant messages
                        print(f"[Agent SDK] Non-assistant message: {message}")

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
