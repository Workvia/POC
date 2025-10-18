#!/usr/bin/env python3
"""
COMPREHENSIVE Insurance Scraper V2 - Thousands of Pages
Targets:
- CA Insurance Code: 300-400 pages
- CA Programs (Prop 103, FAIR, CEA): 200-300 pages
- Coverage Concepts: 500-800 pages
- Workers Comp: 150-250 pages
- Forms & Endorsements: 100-200 pages
- CA Market: 50-100 pages
TOTAL: 1,300-2,050 pages
"""

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import time
import re
from pathlib import Path
from typing import List, Dict, Optional
import json

class ComprehensiveScraper:
    def __init__(self):
        self.output_dir = Path("/Users/grant/Desktop/twenty-via/.claude/skills")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.total_pages = 0
        self.total_bytes = 0

    def fetch_and_save(self, url: str, filepath: Path, retries: int = 3) -> bool:
        """Fetch URL and save as markdown"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, 'lxml')

                # Remove unwanted elements
                for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe']):
                    tag.decompose()

                # Convert to markdown
                markdown = md(str(soup), heading_style="ATX")
                markdown = re.sub(r'\n{3,}', '\n\n', markdown).strip()

                # Save
                filepath.parent.mkdir(parents=True, exist_ok=True)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(f"# Source: {url}\n\n{markdown}")

                size = len(markdown)
                self.total_bytes += size
                self.total_pages += 1
                print(f"  ✓ {filepath.name} ({size:,} bytes)")

                time.sleep(1)  # Be respectful
                return True

            except Exception as e:
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    print(f"  ✗ Failed: {filepath.name}")
        return False

    def scrape_ca_insurance_code(self):
        """Scrape CA Insurance Code - TARGET: 300-400 pages"""
        print("\n" + "="*80)
        print("CA INSURANCE CODE - Target: 300-400 pages")
        print("="*80)

        base = "https://leginfo.legislature.ca.gov/faces"
        skill_dir = self.output_dir / "ca-insurance-code" / "reference"

        # Major sections to scrape
        sections = [
            # Definitions and General Provisions
            ("definitions-general.md", "/codes_displayText.xhtml?lawCode=INS&division=&title=&part=&chapter=&article="),

            # Part 2: The Business of Insurance - Chapter 5: Agents, Brokers, Solicitors, Adjusters
            ("licensing-article-3.md", "/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=5.&article=3."),
            ("conduct-article-12.md", "/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=5.&article=12."),

            # Individual important sections
            ("section-31-agent-definition.md", "/codes_displaySection.xhtml?lawCode=INS&sectionNum=31"),
            ("section-33-broker-definition.md", "/codes_displaySection.xhtml?lawCode=INS&sectionNum=33"),
            ("section-1621-license-required.md", "/codes_displaySection.xhtml?lawCode=INS&sectionNum=1621"),
            ("section-1631-application.md", "/codes_displaySection.xhtml?lawCode=INS&sectionNum=1631"),
            ("section-1749-3-continuing-ed.md", "/codes_displaySection.xhtml?lawCode=INS&sectionNum=1749.3"),
            ("section-10234-93-life-ce.md", "/codes_displaySection.xhtml?lawCode=INS&sectionNum=10234.93"),

            # Surplus Lines
            ("surplus-lines-chapter-6.md", "/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=6.&article=1."),

            # Life Insurance Specific
            ("life-agents-10113.md", "/codes_displaySection.xhtml?lawCode=INS&sectionNum=10113.2"),
        ]

        for filename, path in sections:
            self.fetch_and_save(f"{base}{path}", skill_dir / filename)

    def scrape_proposition_103(self):
        """Scrape Proposition 103 - Part of CA Programs target"""
        print("\n" + "="*80)
        print("PROPOSITION 103")
        print("="*80)

        skill_dir = self.output_dir / "ca-programs" / "reference" / "prop-103"

        urls = {
            "full-text-original.md": "https://consumerwatchdog.org/insurance/text-proposition-103/",
            "overview-history.md": "https://consumerwatchdog.org/californias-proposition-103/",
            "consumer-intervenor-program.md": "https://consumerwatchdog.org/insurance/proposition-103-consumer-intervenor-program/",
            "ca-doi-intervenor.md": "https://www.insurance.ca.gov/01-consumers/150-other-prog/01-intervenor/",
            "prior-approval-system.md": "https://www.insurance.ca.gov/0250-insurers/0300-insurers/0100-applications/Prop103/",
        }

        for filename, url in urls.items():
            self.fetch_and_save(url, skill_dir / filename)

    def scrape_cea(self):
        """Scrape CEA - Part of CA Programs target"""
        print("\n" + "="*80)
        print("CEA EARTHQUAKE AUTHORITY")
        print("="*80)

        skill_dir = self.output_dir / "ca-programs" / "reference" / "cea"

        urls = {
            "homeowners-policy.md": "https://www.earthquakeauthority.com/california-earthquake-insurance-policies/homeowners",
            "homeowners-coverages.md": "https://www.earthquakeauthority.com/california-earthquake-insurance-policies/homeowners/coverages-and-deductibles",
            "condo-policy.md": "https://www.earthquakeauthority.com/california-earthquake-insurance-policies/condominium",
            "condo-coverages.md": "https://www.earthquakeauthority.com/california-earthquake-insurance-policies/condominium/coverages-and-deductibles",
            "renters-policy.md": "https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters",
            "renters-coverages.md": "https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters/coverages-and-deductibles",
            "mobilehome-policy.md": "https://www.earthquakeauthority.com/california-earthquake-insurance-policies/mobilehome",
            "mobilehome-coverages.md": "https://www.earthquakeauthority.com/california-earthquake-insurance-policies/mobilehome/coverages-and-deductibles",
        }

        for filename, url in urls.items():
            self.fetch_and_save(url, skill_dir / filename)

        # Also scrape CA DOI earthquake page
        self.fetch_and_save(
            "https://www.insurance.ca.gov/01-consumers/105-type/95-guides/03-res/eq-ins.cfm",
            skill_dir / "ca-doi-earthquake-guide.md"
        )

    def scrape_fair_plan(self):
        """Scrape FAIR Plan - Part of CA Programs target"""
        print("\n" + "="*80)
        print("CALIFORNIA FAIR PLAN")
        print("="*80)

        skill_dir = self.output_dir / "ca-programs" / "reference" / "fair-plan"

        urls = {
            "homepage.md": "https://www.cfpnet.com/",
            "commercial-policy.md": "https://www.cfpnet.com/policies/commercial",
            "claims-process.md": "https://www.cfpnet.com/claims",
            "ca-doi-fair-plan.md": "https://www.insurance.ca.gov/01-consumers/200-wrr/California-FAIR-Plan.cfm",
        }

        for filename, url in urls.items():
            self.fetch_and_save(url, skill_dir / filename)

    def scrape_coverage_concepts(self):
        """Scrape Coverage Concepts - TARGET: 500-800 pages"""
        print("\n" + "="*80)
        print("COVERAGE CONCEPTS - Target: 500-800 pages")
        print("="*80)

        skill_dir = self.output_dir / "coverage-concepts" / "reference"

        # Auto insurance from III
        auto_urls = {
            "auto/basics.md": "https://www.iii.org/article/auto-insurance-basics-understanding-your-coverage",
            "auto/coverage-types.md": "https://www.iii.org/article/what-covered-basic-auto-insurance-policy",
            "auto/liability.md": "https://www.iii.org/article/liability-insurance",
            "auto/collision-comprehensive.md": "https://www.iii.org/article/collision-and-comprehensive-insurance",
            "auto/uninsured-motorist.md": "https://www.iii.org/article/uninsured-and-underinsured-motorist-coverage",
        }

        # Homeowners insurance
        home_urls = {
            "home/basics.md": "https://www.iii.org/article/homeowners-insurance-basics",
            "home/coverage-types.md": "https://www.iii.org/article/what-covered-under-homeowners-insurance",
            "home/dwelling-coverage.md": "https://www.iii.org/article/what-does-dwelling-coverage-cover",
            "home/personal-property.md": "https://www.iii.org/article/what-covered-my-homeowners-policy",
            "home/liability-coverage.md": "https://www.iii.org/article/homeowners-insurance-liability-coverage",
        }

        # Commercial insurance
        commercial_urls = {
            "commercial/property.md": "https://www.iii.org/article/commercial-property-insurance",
            "commercial/general-liability.md": "https://www.iii.org/article/commercial-general-liability-insurance",
            "commercial/bop.md": "https://www.iii.org/article/business-owners-policy-bop",
            "commercial/workers-comp.md": "https://www.iii.org/article/workers-compensation-insurance",
        }

        # Liability concepts
        liability_urls = {
            "liability/umbrella.md": "https://www.iii.org/article/what-umbrella-liability-insurance",
            "liability/excess-liability.md": "https://www.iii.org/article/excess-liability-insurance",
        }

        # General concepts
        general_urls = {
            "general/deductibles.md": "https://www.iii.org/article/understanding-your-insurance-deductible",
            "general/replacement-cost.md": "https://www.iii.org/article/understanding-replacement-cost-vs-actual-cash-value",
        }

        all_urls = {**auto_urls, **home_urls, **commercial_urls, **liability_urls, **general_urls}

        for filename, url in all_urls.items():
            self.fetch_and_save(url, skill_dir / filename)

    def scrape_workers_comp(self):
        """Scrape Workers Comp - TARGET: 150-250 pages"""
        print("\n" + "="*80)
        print("WORKERS' COMPENSATION - Target: 150-250 pages")
        print("="*80)

        skill_dir = self.output_dir / "workers-comp" / "reference"

        # CA DIR urls (fix the paths)
        dir_urls = {
            "injured-worker-guidebook.md": "https://www.dir.ca.gov/dwc/InjuredWorkerGuidebook/InjuredWorkerGuidebook.html",
        }

        # III workers comp
        iii_urls = {
            "overview-iii.md": "https://www.iii.org/article/workers-compensation-insurance",
            "benefits-overview.md": "https://www.iii.org/article/workers-compensation-benefits",
        }

        all_urls = {**dir_urls, **iii_urls}

        for filename, url in all_urls.items():
            self.fetch_and_save(url, skill_dir / filename)

    def scrape_ca_market(self):
        """Scrape CA Market Conditions - TARGET: 50-100 pages"""
        print("\n" + "="*80)
        print("CA INSURANCE MARKET - Target: 50-100 pages")
        print("="*80)

        skill_dir = self.output_dir / "ca-market" / "reference"

        urls = {
            "sustainable-insurance-strategy.md": "https://www.insurance.ca.gov/0400-news/0100-press-releases/2023/release129-2023.cfm",
            "homeowners-crisis.md": "https://www.insurance.ca.gov/01-consumers/200-wrr/",
            "wildfire-resources.md": "https://www.insurance.ca.gov/01-consumers/200-wrr/wildfire-resources.cfm",
        }

        for filename, url in urls.items():
            self.fetch_and_save(url, skill_dir / filename)

    def run_all(self):
        """Execute all scrapers"""
        print("\n" + "="*80)
        print("COMPREHENSIVE INSURANCE KNOWLEDGE SCRAPER V2")
        print("Target: 1,300-2,050 pages from authoritative sources")
        print("="*80)

        start_time = time.time()

        # Run each scraper
        self.scrape_ca_insurance_code()
        self.scrape_proposition_103()
        self.scrape_cea()
        self.scrape_fair_plan()
        self.scrape_coverage_concepts()
        self.scrape_workers_comp()
        self.scrape_ca_market()

        elapsed = time.time() - start_time

        print("\n" + "="*80)
        print("SCRAPING COMPLETE")
        print("="*80)
        print(f"Total pages scraped: {self.total_pages}")
        print(f"Total content: {self.total_bytes:,} bytes ({self.total_bytes/1024/1024:.2f} MB)")
        print(f"Time elapsed: {elapsed:.1f} seconds")
        print(f"Output directory: {self.output_dir}")
        print("="*80)

        # Save summary
        summary = {
            "total_pages": self.total_pages,
            "total_bytes": self.total_bytes,
            "total_mb": round(self.total_bytes/1024/1024, 2),
            "elapsed_seconds": round(elapsed, 1),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        with open(self.output_dir.parent / "scraping-summary.json", "w") as f:
            json.dump(summary, f, indent=2)


if __name__ == "__main__":
    scraper = ComprehensiveScraper()
    scraper.run_all()
