#!/usr/bin/env python3
"""
CRM Tools for Claude Agent SDK
Defines tools for interacting with Twenty CRM
"""

from typing import Any, Dict
from claude_agent_sdk import tool
from crm_graphql import crm_client


@tool(
    "search_companies",
    "Search for companies in the Twenty CRM database by name or domain",
    {"query": str}
)
async def search_companies(args: Dict[str, Any]) -> Dict[str, Any]:
    """Search for companies in CRM"""
    try:
        query = args.get("query", "")
        print(f"[CRM Tool] Searching companies for: {query}")

        companies = crm_client.search_companies(query, limit=5)

        if not companies:
            return {
                "content": [{
                    "type": "text",
                    "text": f"No companies found matching '{query}'."
                }]
            }

        results = [f"Found {len(companies)} companies matching '{query}':\n\n"]
        for company in companies:
            results.append(crm_client.format_company_for_display(company))
            results.append("\n")

        return {
            "content": [{
                "type": "text",
                "text": "\n".join(results)
            }]
        }
    except Exception as e:
        print(f"[CRM Tool] Error in search_companies: {e}")
        import traceback
        traceback.print_exc()
        return {
            "content": [{
                "type": "text",
                "text": f"Error searching companies: {str(e)}"
            }]
        }


@tool(
    "search_contacts",
    "Search for contacts/people in the Twenty CRM by name or email",
    {"query": str}
)
async def search_contacts(args: Dict[str, Any]) -> Dict[str, Any]:
    """Search for contacts in CRM"""
    try:
        query = args.get("query", "")
        print(f"[CRM Tool] Searching contacts for: {query}")

        people = crm_client.search_people(query, limit=5)

        if not people:
            return {
                "content": [{
                    "type": "text",
                    "text": f"No contacts found matching '{query}'."
                }]
            }

        results = [f"Found {len(people)} contacts matching '{query}':\n\n"]
        for person in people:
            results.append(crm_client.format_person_for_display(person))
            results.append("\n")

        return {
            "content": [{
                "type": "text",
                "text": "\n".join(results)
            }]
        }
    except Exception as e:
        print(f"[CRM Tool] Error in search_contacts: {e}")
        import traceback
        traceback.print_exc()
        return {
            "content": [{
                "type": "text",
                "text": f"Error searching contacts: {str(e)}"
            }]
        }


@tool(
    "get_company_details",
    "Get detailed information about a specific company by ID",
    {"company_id": str}
)
async def get_company_details(args: Dict[str, Any]) -> Dict[str, Any]:
    """Get detailed company information"""
    try:
        company_id = args.get("company_id", "")
        print(f"[CRM Tool] Getting company details for ID: {company_id}")

        company = crm_client.get_company_by_id(company_id)

        if not company:
            return {
                "content": [{
                    "type": "text",
                    "text": f"Company with ID '{company_id}' not found."
                }]
            }

        return {
            "content": [{
                "type": "text",
                "text": crm_client.format_company_for_display(company)
            }]
        }
    except Exception as e:
        print(f"[CRM Tool] Error in get_company_details: {e}")
        import traceback
        traceback.print_exc()
        return {
            "content": [{
                "type": "text",
                "text": f"Error getting company details: {str(e)}"
            }]
        }


@tool(
    "create_task",
    "Create a new task in the CRM (coming soon)",
    {
        "title": str,
        "description": str,
        "assignee": str
    }
)
async def create_task(args: Dict[str, Any]) -> Dict[str, Any]:
    """Create a task in CRM"""
    try:
        title = args.get("title", "")
        description = args.get("description", "")
        assignee = args.get("assignee", "")

        print(f"[CRM Tool] Creating task: {title}")

        # TODO: Implement task creation via GraphQL mutation
        return {
            "content": [{
                "type": "text",
                "text": f"Task creation feature coming soon. Would create task: '{title}'"
            }]
        }
    except Exception as e:
        print(f"[CRM Tool] Error in create_task: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"Error creating task: {str(e)}"
            }]
        }
