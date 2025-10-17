#!/usr/bin/env python3
"""
Claude Agent SDK Backend for Twenty CRM
Provides advanced AI capabilities with tool execution, file system access, and MCP integration
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from crm_graphql import crm_client

# Load environment variables
load_dotenv()

app = FastAPI(title="Twenty CRM AI Agent Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
CRM_DATA_PATH = Path(__file__).parent.parent.parent / "twenty-via"

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Claude Agent SDK Backend",
        "features": [
            "AI Chat",
            "Tool Execution",
            "File System Access",
            "MCP Integration"
        ]
    }

@app.post("/api/chat")
async def chat(request: Request):
    """
    Chat endpoint using Claude Agent SDK
    Supports streaming responses with tool execution capabilities
    """
    try:
        body = await request.json()
        messages = body.get("messages", [])

        if not messages:
            return {"error": "No messages provided"}

        print(f"[Agent] Received {len(messages)} messages")

        from anthropic import Anthropic

        client = Anthropic(api_key=ANTHROPIC_API_KEY)

        async def generate_stream():
            """Generate streaming response with tool execution"""
            try:
                # Initial request with tools
                response = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=4096,
                    messages=messages,
                    tools=TOOLS,
                    system="You are a helpful AI assistant integrated into Twenty CRM. You help users manage their contacts, companies, and workflows. When users ask about companies or people, use the available tools to search the CRM database. Be concise and helpful."
                )

                # Handle tool use in agentic loop
                while response.stop_reason == "tool_use":
                    print(f"[Agent] Tool use detected: {response.stop_reason}")

                    # Process tool calls
                    tool_results = []
                    for block in response.content:
                        if block.type == "tool_use":
                            tool_name = block.name
                            tool_input = block.input
                            print(f"[Agent] Executing tool: {tool_name} with input: {tool_input}")

                            # Execute the tool
                            result = execute_tool(tool_name, tool_input)
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": result
                            })

                    # Continue conversation with tool results
                    messages.append({"role": "assistant", "content": response.content})
                    messages.append({"role": "user", "content": tool_results})

                    response = client.messages.create(
                        model="claude-3-5-sonnet-20241022",
                        max_tokens=4096,
                        messages=messages,
                        tools=TOOLS,
                        system="You are a helpful AI assistant integrated into Twenty CRM. You help users manage their contacts, companies, and workflows. When users ask about companies or people, use the available tools to search the CRM database. Be concise and helpful."
                    )

                # Stream final text response
                final_text = ""
                for block in response.content:
                    if hasattr(block, "text"):
                        final_text += block.text

                # Send the final response in AI SDK data stream format
                if final_text:
                    for char in final_text:
                        yield f'0:"{char}"\n'

                print("[Agent] Stream completed")
            except Exception as e:
                print(f"[Agent] Stream error: {e}")
                import traceback
                traceback.print_exc()
                yield f'0:"Sorry, I encountered an error: {str(e)}"\n'

        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "X-Content-Type-Options": "nosniff",
                "Transfer-Encoding": "chunked"
            }
        )

    except Exception as e:
        print(f"[Agent] Error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

# Tool definitions for Claude Agent SDK
TOOLS = [
    {
        "name": "search_companies",
        "description": "Search for companies in the CRM database",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query for company name or domain"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_company_details",
        "description": "Get detailed information about a specific company",
        "input_schema": {
            "type": "object",
            "properties": {
                "company_id": {
                    "type": "string",
                    "description": "The ID of the company"
                }
            },
            "required": ["company_id"]
        }
    },
    {
        "name": "search_contacts",
        "description": "Search for contacts/people in the CRM",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query for contact name or email"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "create_task",
        "description": "Create a new task in the CRM",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Task title"
                },
                "description": {
                    "type": "string",
                    "description": "Task description"
                },
                "assignee": {
                    "type": "string",
                    "description": "Person to assign the task to"
                }
            },
            "required": ["title"]
        }
    }
]

# Tool execution handlers
def execute_tool(tool_name: str, tool_input: Dict[str, Any]) -> str:
    """Execute a tool and return the result"""
    try:
        if tool_name == "search_companies":
            query = tool_input.get("query", "")
            print(f"[Tool] Searching companies for: {query}")

            companies = crm_client.search_companies(query, limit=5)

            if not companies:
                return f"No companies found matching '{query}'."

            results = [f"Found {len(companies)} companies matching '{query}':\n"]
            for company in companies:
                results.append(crm_client.format_company_for_display(company))
                results.append("\n")

            return "\n".join(results)

        elif tool_name == "get_company_details":
            company_id = tool_input.get("company_id", "")
            print(f"[Tool] Getting company details for ID: {company_id}")

            company = crm_client.get_company_by_id(company_id)

            if not company:
                return f"Company with ID '{company_id}' not found."

            return crm_client.format_company_for_display(company)

        elif tool_name == "search_contacts":
            query = tool_input.get("query", "")
            print(f"[Tool] Searching contacts for: {query}")

            people = crm_client.search_people(query, limit=5)

            if not people:
                return f"No contacts found matching '{query}'."

            results = [f"Found {len(people)} contacts matching '{query}':\n"]
            for person in people:
                results.append(crm_client.format_person_for_display(person))
                results.append("\n")

            return "\n".join(results)

        elif tool_name == "create_task":
            title = tool_input.get("title", "")
            description = tool_input.get("description", "")
            print(f"[Tool] Creating task: {title}")
            # TODO: Implement task creation via GraphQL mutation
            return f"Task creation feature coming soon. Would create: '{title}'"

        return f"Tool '{tool_name}' not implemented"

    except Exception as e:
        print(f"[Tool] Error executing {tool_name}: {e}")
        import traceback
        traceback.print_exc()
        return f"Error executing tool: {str(e)}"

if __name__ == "__main__":
    print("\n🤖 Claude Agent SDK Backend Starting...")
    print(f"📡 Chat endpoint: http://localhost:3002/api/chat")
    print(f"💚 Health check: http://localhost:3002/health")
    print(f"🔧 Features: Tool Execution, File Access, MCP Integration\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3002,
        log_level="info"
    )
