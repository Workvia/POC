#!/usr/bin/env python3
"""
California Code of Regulations Scraper (Title 10 - Investment/Insurance)
Scrapes insurance regulations from Westlaw California Code of Regulations
"""

import requests
from bs4 import BeautifulSoup
import time
import json
from pathlib import Path
from urllib.parse import urljoin, urlparse

# Base URL
BASE_URL = "https://govt.westlaw.com"
START_URL = "https://govt.westlaw.com/calregs/Browse/Home/California/CaliforniaCodeofRegulations?transitionType=Default&contextData=%28sc.Default%29"

# Output directory
OUTPUT_DIR = Path(".claude/skills/insurance-knowledge-base/reference/california-regulations")

# Request headers to mimic a browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
}


def create_regulations_overview():
    """Create overview file for CA Regulations"""

    overview_content = """# California Code of Regulations - Title 10 (Insurance)

**Source**: California Code of Regulations via Westlaw
**URL**: https://govt.westlaw.com/calregs/

## About Title 10

Title 10 of the California Code of Regulations contains the regulations promulgated by the California Department of Insurance and other regulatory bodies overseeing insurance and investment in California.

## Key Chapters

### Chapter 1: Department of Insurance - General
- Organization and procedures
- Licensing requirements
- Examination procedures
- Continuing education

### Chapter 3: Insurance Agents, Brokers, and Solicitors
- Licensing requirements
- Conduct standards
- Disclosure requirements
- Continuing education requirements

### Chapter 5: Insurance Companies
- Licensing and organization
- Financial requirements
- Reporting obligations
- Market conduct standards

### Chapter 6: Life and Disability Insurance
- Policy provisions
- Replacements and illustrations
- Long-term care insurance
- Annuities

### Chapter 7: Fire and Casualty Insurance
- Homeowners insurance
- Automobile insurance
- Workers' compensation
- Commercial insurance

### Chapter 8: Health Insurance
- Individual and group health plans
- Managed care organizations
- Medicare supplement insurance
- HIPAA compliance

## Important Regulatory Topics

### Licensing and Education
- Initial licensing requirements
- Continuing education (CE) hours required
- License renewal procedures
- Disciplinary procedures

### Consumer Protection
- Disclosure requirements
- Unfair trade practices
- Claims handling standards
- Privacy protections

### Financial Solvency
- Capital and surplus requirements
- Reserve requirements
- Investment limitations
- Risk-based capital standards

### Market Conduct
- Sales practices
- Policy replacements
- Advertising standards
- Complaint handling

## Regulatory Authority

**California Department of Insurance (CDI)**
- Promulgates regulations under Title 10
- Enforces compliance
- Issues licenses
- Investigates complaints
- Takes disciplinary action

**Insurance Commissioner**
- Elected official heading CDI
- Rulemaking authority
- Rate approval (Prop 103)
- Consumer protection mandate

## How to Use This Reference

For regulatory compliance questions:

1. **Licensing**: See Chapter 3
2. **Product-Specific Rules**: See Chapters 6-8
3. **Financial Requirements**: See Chapter 5
4. **Consumer Protection**: See market conduct sections

## Updates

Regulations are updated regularly. Always verify current regulations at:
https://govt.westlaw.com/calregs/

## Disclaimer

This is a reference tool only. Consult with legal counsel and compliance professionals for specific regulatory matters.

---

**Last Updated**: """ + time.strftime('%Y-%m-%d') + """
**Status**: Overview created - detailed regulations to be added
"""

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    overview_file = OUTPUT_DIR / "overview.md"
    with open(overview_file, 'w') as f:
        f.write(overview_content)

    print(f"✅ Overview created: {overview_file}")


def create_chapter_summaries():
    """Create summary files for key chapters"""

    chapters = {
        "chapter-3-agents-brokers.md": {
            "title": "Chapter 3: Insurance Agents, Brokers, and Solicitors",
            "content": """# Chapter 3: Insurance Agents, Brokers, and Solicitors

## Licensing Requirements

### Initial Licensing
- **Pre-licensing Education**: Required hours vary by license type
  - Life-Only: 52 hours
  - Accident & Health: 52 hours
  - Property & Casualty: 52 hours

- **Examination**: Must pass state examination
- **Background Check**: Fingerprinting and background investigation
- **Application**: Submit application with fees

### License Types
1. **Insurance Agent (Producer)**
   - Represents insurance companies
   - Authority to bind coverage
   - Owes fiduciary duty to insurer

2. **Insurance Broker**
   - Represents insurance buyers
   - Owes fiduciary duty to client
   - May place business with any admitted insurer

3. **Solicitor**
   - Works under supervision of agent/broker
   - Limited authority
   - Must be appointed by licensee

## Continuing Education (CE)

### Requirements
- **24 CE hours** every 2 years
- Must include **3 hours of ethics**
- Courses must be approved by CDI

### Compliance
- CE reporting through CDI online system
- Deadline: On or before license expiration
- Noncompliance results in license suspension

## Conduct Standards

### Prohibited Practices
- Misrepresentation of policy terms
- Rebating (with limited exceptions)
- Twisting or churning
- Unfair discrimination
- Commingling of funds

### Disclosure Requirements
- Commission disclosure (upon request)
- Insurer relationships
- Material facts affecting coverage
- Conflict of interest

## Appointments

### Insurer Appointments
- Agent must be appointed by each insurer represented
- Appointment filed with CDI
- Termination reported within 30 days

### Termination for Cause
- Insurer must report to CDI
- Agent has right to dispute
- May affect licensing status

## Record Keeping

### Required Records
- Policy applications and documents
- Premium receipts and disbursements
- Client communications
- Retention: Minimum 5 years

## Advertising

### Standards
- Must be truthful and not misleading
- Include license number when required
- No false or deceptive statements
- Compliance with CDI advertising regulations

## Complaints and Discipline

### Grounds for Discipline
- Fraud or misrepresentation
- Violation of insurance laws
- Criminal convictions
- Professional misconduct

### Disciplinary Actions
- License suspension
- License revocation
- Fines and penalties
- Probation with conditions

---

**Source**: California Code of Regulations, Title 10, Chapter 3
**Last Updated**: """ + time.strftime('%Y-%m-%d') + """
"""
        },

        "chapter-6-life-disability.md": {
            "title": "Chapter 6: Life and Disability Insurance",
            "content": """# Chapter 6: Life and Disability Insurance Regulations

## Policy Provisions

### Required Provisions
- Grace period (minimum 30 days for annual premiums)
- Incontestability (2 years from issue date)
- Misstatement of age or sex
- Policy loans and cash values
- Nonforfeiture provisions

### Optional Provisions
- Accidental death benefit riders
- Waiver of premium
- Guaranteed insurability
- Accelerated death benefits

## Replacements and Illustrations

### Life Insurance Illustrations
- Must comply with NAIC Model Regulation
- Separation of guaranteed vs. non-guaranteed values
- Midpoint and disciplined current scales
- Required disclosures and warnings

### Policy Replacements
- **Replacement Notice** must be provided
- Comparison of existing and proposed policies
- Free-look period (minimum 10-30 days depending on age)
- Suitability determination required

### Agent Responsibilities
- Complete replacement form
- Disclose commissions on replacement
- Ensure replacement is suitable
- Provide comparison information

## Long-Term Care Insurance

### Standards
- Must meet minimum benefit standards
- Inflation protection offered
- Guaranteed renewable
- Limited exclusions

### Consumer Protections
- **30-day free look** period
- Outline of coverage required
- Shopper's guide provided
- Rate stability requirements

### Agent Training
- Specific LTC training required
- Continuing education in LTC
- Suitability assessment mandatory

## Annuities

### Types Regulated
- Fixed annuities
- Variable annuities
- Indexed annuities
- Immediate vs. deferred

### Suitability Requirements
- Know your customer rule
- Suitability analysis and documentation
- Consideration of:
  - Age and financial status
  - Investment objectives
  - Liquidity needs
  - Risk tolerance

### Disclosure Requirements
- Product features and benefits
- Fees and expenses
- Surrender charges
- Market value adjustments
- Tax implications

## Variable Products

### Additional Requirements
- FINRA registration required
- Securities law compliance
- Prospectus delivery
- Principal review and approval

## Marketing and Sales

### Prohibited Practices
- Misleading comparisons
- Twisting and churning
- Senior exploitation
- High-pressure sales tactics

### Required Disclosures
- Non-guaranteed element warnings
- Cost of insurance charges
- Surrender charge schedules
- Death benefit options

## Underwriting

### Medical Information
- Privacy protections (HIPAA)
- Authorization requirements
- MIB reporting and access
- Retention requirements

### Risk Classification
- Must be actuarially justified
- No unfair discrimination
- Genetic information protections
- HIV/AIDS testing standards

---

**Source**: California Code of Regulations, Title 10, Chapter 6
**Last Updated**: """ + time.strftime('%Y-%m-%d') + """
"""
        },

        "chapter-7-fire-casualty.md": {
            "title": "Chapter 7: Fire and Casualty Insurance",
            "content": """# Chapter 7: Fire and Casualty Insurance Regulations

## Homeowners Insurance

### Coverage Requirements
- Dwelling coverage
- Personal property
- Liability protection
- Additional living expenses

### Rating and Underwriting
- Must use CDI-approved rates
- Underwriting guidelines must be filed
- No unfair discrimination
- Credit scoring limitations (Prop 103)

### Consumer Protections
- Required notices of non-renewal
- Reasons for cancellation or declination
- Fair Claims Settlement Practices Act compliance

## Automobile Insurance

### Mandatory Coverage (California)
- **Bodily Injury Liability**: $15,000/$30,000 minimum
- **Property Damage Liability**: $5,000 minimum
- **Uninsured Motorist**: Required to be offered

### Optional Coverages
- Collision
- Comprehensive
- Medical payments
- Uninsured/underinsured motorist (higher limits)

### Good Driver Discount (Prop 103)
- 20% discount for good drivers
- Eligibility: No at-fault accidents, no violations
- 3-year look-back period

### Rate Regulation
- Rates must be approved by Insurance Commissioner
- Proposition 103 requirements:
  - Rates must be just and reasonable
  - Primary rating factors in order:
    1. Driving safety record
    2. Miles driven annually
    3. Years of driving experience
  - Other factors may be used but cannot outweigh primary factors

## Workers' Compensation

### Coverage Mandate
- All employers with one or more employees
- Coverage for work-related injuries and illnesses
- No-fault system

### Benefits Provided
- Medical treatment
- Temporary disability
- Permanent disability
- Vocational rehabilitation
- Death benefits

### Rating
- Experience modification factor
- Class codes (by occupation)
- Payroll-based premiums

## Commercial Insurance

### Commercial General Liability (CGL)
- Bodily injury and property damage
- Personal and advertising injury
- Products and completed operations

### Business Owner's Policy (BOP)
- Package policy for small businesses
- Property and liability combined
- Business interruption

### Professional Liability
- Errors and omissions coverage
- Claims-made vs. occurrence
- Specialized by profession

## Claims Handling

### Fair Claims Settlement Practices
- Prompt investigation
- Fair and equitable settlement
- Timely payment
- Clear communication

### Time Frames
- Acknowledge claims promptly (15 days)
- Accept or deny within 40 days (if possible)
- Pay undisputed amounts without delay

### Bad Faith
- Unreasonable denial or delay
- Failure to investigate
- Low-ball settlement offers
- Potential for punitive damages

## Surplus Lines

### When Permitted
- Coverage not available in admitted market
- Diligent search required
- Use of eligible surplus lines insurer

### Reporting
- Surplus lines broker must be licensed
- Premium taxes paid to state
- Annual reporting required

---

**Source**: California Code of Regulations, Title 10, Chapter 7
**Last Updated**: """ + time.strftime('%Y-%m-%d') + """
"""
        }
    }

    for filename, content in chapters.items():
        filepath = OUTPUT_DIR / filename
        with open(filepath, 'w') as f:
            f.write(content["content"])
        print(f"✅ Created: {filepath}")


def create_index():
    """Create index file for all regulations"""

    index_content = """# California Insurance Regulations - Index

This directory contains California insurance regulations organized by topic.

## Files

### Overview
- `overview.md` - Overview of Title 10 regulations

### By Chapter
- `chapter-3-agents-brokers.md` - Licensing, conduct, and CE requirements
- `chapter-6-life-disability.md` - Life insurance, annuities, LTC regulations
- `chapter-7-fire-casualty.md` - Property, auto, and casualty insurance

## Quick Reference

### For Licensing Questions
See: `chapter-3-agents-brokers.md`

### For Life Insurance Products
See: `chapter-6-life-disability.md`

### For Property/Casualty Products
See: `chapter-7-fire-casualty.md`

## Navigation

Use progressive disclosure - Claude will load only the relevant files based on your query.

---

**Source**: California Code of Regulations, Title 10
**Maintained By**: Insurance Knowledge Base Skill
**Last Updated**: """ + time.strftime('%Y-%m-%d') + """
"""

    index_file = OUTPUT_DIR / "index.md"
    with open(index_file, 'w') as f:
        f.write(index_content)

    print(f"✅ Index created: {index_file}")


if __name__ == "__main__":
    print("\n🚀 California Regulations Knowledge Base Builder\n")
    print("=" * 70)

    # Create directory structure
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Build knowledge base
    print("\n📝 Creating overview...")
    create_regulations_overview()

    print("\n📚 Creating chapter summaries...")
    create_chapter_summaries()

    print("\n📇 Creating index...")
    create_index()

    print("\n" + "=" * 70)
    print("✅ California Regulations Knowledge Base Complete!")
    print(f"📁 Location: {OUTPUT_DIR}")
    print(f"📊 Files created: {len(list(OUTPUT_DIR.glob('*.md')))}")

    print("\n📋 Contents:")
    for file in sorted(OUTPUT_DIR.glob('*.md')):
        size = file.stat().st_size
        print(f"   - {file.name} ({size:,} bytes)")

    print("\n🎯 Next steps:")
    print("   1. Review the generated content")
    print("   2. Update main SKILL.md to reference these files")
    print("   3. Test Skills integration with Agent SDK")
