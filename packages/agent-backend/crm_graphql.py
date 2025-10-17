"""
GraphQL Client for Twenty CRM
Provides functions to query companies and people from the CRM database
"""

import requests
from typing import List, Dict, Any, Optional
import json

# Twenty CRM GraphQL endpoint
CRM_GRAPHQL_URL = "http://localhost:3000/graphql"

class TwentyCRMClient:
    """Client for querying Twenty CRM via GraphQL"""

    def __init__(self, api_url: str = CRM_GRAPHQL_URL):
        self.api_url = api_url
        self.headers = {
            "Content-Type": "application/json",
        }

    def _execute_query(self, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute a GraphQL query"""
        payload = {"query": query}
        if variables:
            payload["variables"] = variables

        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            result = response.json()

            if "errors" in result:
                error_msg = result["errors"][0].get("message", "Unknown GraphQL error")
                raise Exception(f"GraphQL Error: {error_msg}")

            return result.get("data", {})
        except requests.exceptions.RequestException as e:
            raise Exception(f"HTTP Error: {str(e)}")

    def search_companies(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for companies by name or domain

        Args:
            query: Search query string
            limit: Maximum number of results to return

        Returns:
            List of company records
        """
        graphql_query = """
        query FindManyCompanies($filter: CompanyFilterInput, $limit: Int) {
          companies(filter: $filter, first: $limit) {
            edges {
              node {
                __typename
                id
                name
                domainName {
                  primaryLinkUrl
                  primaryLinkLabel
                }
                address {
                  addressStreet1
                  addressCity
                  addressState
                  addressCountry
                }
                employees
                annualRecurringRevenue {
                  amountMicros
                  currencyCode
                }
                idealCustomerProfile
                linkedinLink {
                  primaryLinkUrl
                }
                createdAt
                updatedAt
              }
            }
            totalCount
          }
        }
        """

        variables = {
            "filter": {
                "or": [
                    {"name": {"ilike": f"%{query}%"}},
                    {"domainName": {"primaryLinkUrl": {"ilike": f"%{query}%"}}}
                ]
            },
            "limit": limit
        }

        try:
            data = self._execute_query(graphql_query, variables)
            companies = data.get("companies", {}).get("edges", [])
            return [edge["node"] for edge in companies]
        except Exception as e:
            print(f"[CRM] Error searching companies: {e}")
            return []

    def get_company_by_id(self, company_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific company

        Args:
            company_id: The UUID of the company

        Returns:
            Company record or None if not found
        """
        graphql_query = """
        query FindManyCompanies($filter: CompanyFilterInput) {
          companies(filter: $filter, first: 1) {
            edges {
              node {
                __typename
                id
                name
                domainName {
                  primaryLinkUrl
                  primaryLinkLabel
                  secondaryLinks
                }
                address {
                  addressStreet1
                  addressStreet2
                  addressCity
                  addressState
                  addressCountry
                  addressPostcode
                  addressLat
                  addressLng
                }
                employees
                annualRecurringRevenue {
                  amountMicros
                  currencyCode
                }
                idealCustomerProfile
                linkedinLink {
                  primaryLinkUrl
                  primaryLinkLabel
                }
                xLink {
                  primaryLinkUrl
                  primaryLinkLabel
                }
                position
                accountOwnerId
                createdAt
                updatedAt
                deletedAt
              }
            }
          }
        }
        """

        variables = {
            "filter": {
                "id": {"eq": company_id}
            }
        }

        try:
            data = self._execute_query(graphql_query, variables)
            companies = data.get("companies", {}).get("edges", [])
            if companies:
                return companies[0]["node"]
            return None
        except Exception as e:
            print(f"[CRM] Error getting company by ID: {e}")
            return None

    def search_people(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for people/contacts by name or email

        Args:
            query: Search query string
            limit: Maximum number of results to return

        Returns:
            List of person records
        """
        graphql_query = """
        query FindManyPeople($filter: PersonFilterInput, $limit: Int) {
          people(filter: $filter, first: $limit) {
            edges {
              node {
                __typename
                id
                name {
                  firstName
                  lastName
                }
                emails {
                  primaryEmail
                  additionalEmails
                }
                phones {
                  primaryPhoneNumber
                  primaryPhoneCountryCode
                }
                jobTitle
                city
                avatarUrl
                companyId
                company {
                  id
                  name
                  domainName {
                    primaryLinkUrl
                  }
                }
                linkedinLink {
                  primaryLinkUrl
                }
                createdAt
                updatedAt
              }
            }
            totalCount
          }
        }
        """

        variables = {
            "filter": {
                "or": [
                    {"name": {"firstName": {"ilike": f"%{query}%"}}},
                    {"name": {"lastName": {"ilike": f"%{query}%"}}},
                    {"emails": {"primaryEmail": {"ilike": f"%{query}%"}}}
                ]
            },
            "limit": limit
        }

        try:
            data = self._execute_query(graphql_query, variables)
            people = data.get("people", {}).get("edges", [])
            return [edge["node"] for edge in people]
        except Exception as e:
            print(f"[CRM] Error searching people: {e}")
            return []

    def get_person_by_id(self, person_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific person

        Args:
            person_id: The UUID of the person

        Returns:
            Person record or None if not found
        """
        graphql_query = """
        query FindManyPeople($filter: PersonFilterInput) {
          people(filter: $filter, first: 1) {
            edges {
              node {
                __typename
                id
                name {
                  firstName
                  lastName
                }
                emails {
                  primaryEmail
                  additionalEmails
                }
                phones {
                  primaryPhoneNumber
                  primaryPhoneCountryCode
                  primaryPhoneCallingCode
                  additionalPhones
                }
                whatsapp {
                  primaryPhoneNumber
                  primaryPhoneCountryCode
                }
                jobTitle
                city
                avatarUrl
                companyId
                company {
                  id
                  name
                  domainName {
                    primaryLinkUrl
                  }
                  address {
                    addressCity
                    addressState
                    addressCountry
                  }
                }
                linkedinLink {
                  primaryLinkUrl
                  primaryLinkLabel
                }
                xLink {
                  primaryLinkUrl
                  primaryLinkLabel
                }
                performanceRating
                intro
                workPreference
                position
                createdAt
                updatedAt
                deletedAt
              }
            }
          }
        }
        """

        variables = {
            "filter": {
                "id": {"eq": person_id}
            }
        }

        try:
            data = self._execute_query(graphql_query, variables)
            people = data.get("people", {}).get("edges", [])
            if people:
                return people[0]["node"]
            return None
        except Exception as e:
            print(f"[CRM] Error getting person by ID: {e}")
            return None

    def format_company_for_display(self, company: Dict[str, Any]) -> str:
        """Format company data for readable display"""
        name = company.get("name", "Unknown")
        domain = company.get("domainName", {})
        domain_url = domain.get("primaryLinkUrl", "N/A") if isinstance(domain, dict) else "N/A"

        employees = company.get("employees", "N/A")

        address = company.get("address", {})
        if isinstance(address, dict):
            city = address.get("addressCity", "")
            state = address.get("addressState", "")
            country = address.get("addressCountry", "")
            location = ", ".join(filter(None, [city, state, country])) or "N/A"
        else:
            location = "N/A"

        arr = company.get("annualRecurringRevenue", {})
        if isinstance(arr, dict) and arr.get("amountMicros"):
            amount = arr["amountMicros"] / 1_000_000  # Convert micros to dollars
            currency = arr.get("currencyCode", "USD")
            revenue = f"${amount:,.2f} {currency}"
        else:
            revenue = "N/A"

        linkedin = company.get("linkedinLink", {})
        linkedin_url = linkedin.get("primaryLinkUrl", "N/A") if isinstance(linkedin, dict) else "N/A"

        icp = company.get("idealCustomerProfile", False)
        icp_status = "Yes" if icp else "No"

        return f"""**{name}**
- ID: {company.get('id', 'N/A')}
- Website: {domain_url}
- Location: {location}
- Employees: {employees}
- ARR: {revenue}
- LinkedIn: {linkedin_url}
- Ideal Customer Profile: {icp_status}"""

    def format_person_for_display(self, person: Dict[str, Any]) -> str:
        """Format person data for readable display"""
        name_obj = person.get("name", {})
        if isinstance(name_obj, dict):
            first_name = name_obj.get("firstName", "")
            last_name = name_obj.get("lastName", "")
            full_name = f"{first_name} {last_name}".strip() or "Unknown"
        else:
            full_name = "Unknown"

        job_title = person.get("jobTitle", "N/A")
        city = person.get("city", "N/A")

        emails = person.get("emails", {})
        email = emails.get("primaryEmail", "N/A") if isinstance(emails, dict) else "N/A"

        phones = person.get("phones", {})
        phone = phones.get("primaryPhoneNumber", "N/A") if isinstance(phones, dict) else "N/A"

        company_obj = person.get("company", {})
        if isinstance(company_obj, dict) and company_obj:
            company_name = company_obj.get("name", "N/A")
        else:
            company_name = "N/A"

        linkedin = person.get("linkedinLink", {})
        linkedin_url = linkedin.get("primaryLinkUrl", "N/A") if isinstance(linkedin, dict) else "N/A"

        return f"""**{full_name}**
- ID: {person.get('id', 'N/A')}
- Job Title: {job_title}
- Company: {company_name}
- Email: {email}
- Phone: {phone}
- City: {city}
- LinkedIn: {linkedin_url}"""


# Global CRM client instance
crm_client = TwentyCRMClient()
