#!/usr/bin/env python3
"""
California Insurance Code Scraper
Scrapes the California Insurance Code from the California Legislative Information website
"""

import requests
from bs4 import BeautifulSoup
import time
import os
from pathlib import Path

# Base URL for California Legislative Information
BASE_URL = "https://leginfo.legislature.ca.gov"
INSURANCE_CODE_URL = f"{BASE_URL}/faces/codes_displayexpandedbranch.xhtml?tocCode=INS&division=&title=&part=&chapter=&article="

# Output directory
OUTPUT_DIR = Path(".claude/skills/insurance-knowledge-base/reference/california-insurance-code")


def scrape_insurance_code():
    """Scrape the California Insurance Code table of contents"""
    print("🔍 Scraping California Insurance Code...")
    print(f"📍 URL: {INSURANCE_CODE_URL}")

    try:
        # Make request to get the main page
        response = requests.get(INSURANCE_CODE_URL, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Find all division/chapter links
        # The California legislative site uses a specific structure
        links = soup.find_all('a', href=lambda href: href and 'codes_displaySection' in href)

        print(f"✅ Found {len(links)} sections")

        # Create output directory
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        # For now, let's just scrape the table of contents structure
        # Full scraping would require parsing each section
        divisions = soup.find_all('div', class_='tocDiv')

        toc_content = []
        toc_content.append("# California Insurance Code - Table of Contents\n\n")
        toc_content.append(f"**Source**: {INSURANCE_CODE_URL}\n\n")
        toc_content.append(f"**Last Updated**: {time.strftime('%Y-%m-%d')}\n\n")

        # Parse the structure
        for div in divisions:
            title_elem = div.find('h3') or div.find('h4') or div.find('strong')
            if title_elem:
                title = title_elem.get_text(strip=True)
                toc_content.append(f"## {title}\n\n")

                # Find subsections
                subsections = div.find_all('a')
                for link in subsections[:5]:  # Limit to first 5 for demo
                    text = link.get_text(strip=True)
                    href = link.get('href', '')
                    if href:
                        full_url = BASE_URL + href if href.startswith('/') else href
                        toc_content.append(f"- [{text}]({full_url})\n")

                toc_content.append("\n")

        # Write table of contents
        toc_file = OUTPUT_DIR / "table-of-contents.md"
        with open(toc_file, 'w') as f:
            f.writelines(toc_content)

        print(f"✅ Table of contents saved to: {toc_file}")

        # Now let's scrape a sample section in detail
        print("\n📄 Scraping sample section...")
        scrape_sample_section()

        return True

    except Exception as e:
        print(f"❌ Error scraping: {e}")
        import traceback
        traceback.print_exc()
        return False


def scrape_sample_section():
    """Scrape a sample section (Division 1 - General Rules) in detail"""

    # This is a sample URL for Division 1
    sample_url = f"{BASE_URL}/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=&chapter=1.&article="

    try:
        print(f"📍 Fetching: {sample_url}")
        response = requests.get(sample_url, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract the main content
        content_div = soup.find('div', id='content') or soup.find('div', class_='content')

        if content_div:
            # Get the text content
            text = content_div.get_text(separator='\n', strip=True)

            # Create markdown file
            section_file = OUTPUT_DIR / "division-1-general-rules.md"

            with open(section_file, 'w') as f:
                f.write(f"# California Insurance Code - Division 1: General Rules\n\n")
                f.write(f"**Source**: {sample_url}\n\n")
                f.write(f"**Last Updated**: {time.strftime('%Y-%m-%d')}\n\n")
                f.write("---\n\n")
                f.write(text)

            print(f"✅ Sample section saved to: {section_file}")
            print(f"📊 Length: {len(text)} characters")
        else:
            print("⚠️ Could not find content div")

    except Exception as e:
        print(f"❌ Error scraping sample section: {e}")


def create_ca_insurance_overview():
    """Create an overview file for CA Insurance Code"""

    overview_content = """# California Insurance Code - Overview

**Source**: California Legislative Information
**URL**: https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=INS

## About the California Insurance Code

The California Insurance Code contains the laws governing insurance in California. It is organized into divisions covering different aspects of insurance regulation, licensing, and operations.

## Key Divisions

### Division 1: General Rules
- Definitions and general provisions
- Department of Insurance organization
- Insurance Commissioner powers and duties
- Examination and licensing procedures

### Division 2: Classes of Insurance
- Life and disability insurance
- Fire and marine insurance
- Automobile insurance
- Workers' compensation insurance
- Title insurance
- Health insurance

### Division 3: Financial Provisions
- Capital and surplus requirements
- Reserves and deposits
- Financial reporting
- Investment restrictions

### Division 4: Nonprofit Hospital Service Plans
- Blue Cross and similar plans
- Regulatory requirements
- Financial standards

## Important Sections

### Section 100-139: Department of Insurance
Powers and organization of the California Department of Insurance (CDI)

### Section 700-745: Licenses
Requirements for insurance agents, brokers, and solicitors

### Section 10110-10270: Life and Disability Insurance
Regulations for life insurance policies, riders, and provisions

### Section 11580-11629: Automobile Insurance
Mandatory coverage requirements, uninsured motorist coverage

### Section 12921-12988: Workers' Compensation
Insurance requirements for employers

## Regulatory Authority

The **California Department of Insurance** (CDI) enforces the Insurance Code.

- **Insurance Commissioner**: Elected official who heads the CDI
- **Regulatory Powers**: Rate approval, market conduct, consumer protection
- **Licensing Authority**: Issues licenses to insurance professionals

## How to Use This Reference

For specific regulatory questions:

1. **General Insurance Law**: See Division 1
2. **Specific Product Types**: See Division 2
3. **Financial Requirements**: See Division 3
4. **Licensing Questions**: See Sections 700-745

## Updates

The California Legislature regularly updates the Insurance Code. Always verify current law at:
https://leginfo.legislature.ca.gov

## Disclaimer

This is a reference tool. Always consult with legal counsel for specific regulatory compliance questions.

---

**Last Updated**: """ + time.strftime('%Y-%m-%d') + """
**Status**: Initial overview created
"""

    # Write overview file
    overview_file = OUTPUT_DIR / "overview.md"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(overview_file, 'w') as f:
        f.write(overview_content)

    print(f"✅ Overview file created: {overview_file}")


if __name__ == "__main__":
    print("\n🚀 California Insurance Code Scraper\n")
    print("=" * 60)

    # Create overview first
    create_ca_insurance_overview()

    # Then scrape the actual code
    success = scrape_insurance_code()

    if success:
        print("\n✅ Scraping completed successfully!")
        print(f"📁 Output directory: {OUTPUT_DIR}")
        print("\nNext steps:")
        print("1. Review the scraped content")
        print("2. Add more detailed sections as needed")
        print("3. Update the main SKILL.md to reference these files")
    else:
        print("\n⚠️  Scraping encountered errors. Check the output above.")
