#!/usr/bin/env python3
"""
Production-Grade Insurance Knowledge Base Scraper
Scrapes thousands of pages from authoritative insurance sources
"""

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import time
import re
from pathlib import Path
from typing import List, Dict, Optional
import json

class InsuranceScraper:
    """Base class for insurance content scraping"""

    def __init__(self, base_url: str, output_dir: Path):
        self.base_url = base_url
        self.output_dir = output_dir
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    def fetch_page(self, url: str, retries: int = 3) -> Optional[str]:
        """Fetch a single page with retries"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                time.sleep(1)  # Be respectful to servers
                return response.text
            except Exception as e:
                print(f"  Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
        return None

    def html_to_markdown(self, html: str, base_url: str = "") -> str:
        """Convert HTML to clean markdown"""
        soup = BeautifulSoup(html, 'lxml')

        # Remove script, style, and nav elements
        for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            tag.decompose()

        # Convert to markdown
        markdown = md(str(soup), heading_style="ATX")

        # Clean up extra whitespace
        markdown = re.sub(r'\n{3,}', '\n\n', markdown)
        markdown = markdown.strip()

        return markdown

    def save_content(self, filename: str, content: str):
        """Save content to file"""
        filepath = self.output_dir / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  ✓ Saved: {filepath} ({len(content)} chars)")


class CEAScraper(InsuranceScraper):
    """Scrape comprehensive CEA earthquake insurance content"""

    def __init__(self, output_dir: Path):
        super().__init__("https://www.earthquakeauthority.com", output_dir)

    def scrape_all(self):
        """Scrape all CEA content"""
        print("\n" + "="*60)
        print("CEA EARTHQUAKE INSURANCE SCRAPER")
        print("="*60)

        # Define all CEA pages to scrape
        pages = {
            "homeowners-overview.md": "/california-earthquake-insurance-policies/homeowners",
            "coverages-deductibles.md": "/california-earthquake-insurance-policies/homeowners/coverages-and-deductibles",
            "condo-overview.md": "/california-earthquake-insurance-policies/condominium",
            "condo-coverages.md": "/california-earthquake-insurance-policies/condominium/coverages-and-deductibles",
            "renters-overview.md": "/california-earthquake-insurance-policies/renters",
            "renters-coverages.md": "/california-earthquake-insurance-policies/renters/coverages-and-deductibles",
            "mobile-home-overview.md": "/california-earthquake-insurance-policies/mobilehome",
            "mobile-home-coverages.md": "/california-earthquake-insurance-policies/mobilehome/coverages-and-deductibles",
            "earthquake-basics.md": "/earthquake-101",
            "preparedness.md": "/earthquake-preparedness",
            "retrofitting.md": "/earthquake-preparedness/earthquake-retrofitting",
            "claims-process.md": "/earthquake-insurance-claims",
            "premium-discounts.md": "/earthquake-insurance-premium-discounts",
            "faq.md": "/earthquake-insurance-faq",
        }

        scraped_count = 0
        for filename, path in pages.items():
            url = f"{self.base_url}{path}"
            print(f"\nScraping: {url}")

            html = self.fetch_page(url)
            if html:
                markdown = self.html_to_markdown(html, self.base_url)
                self.save_content(f"cea/{filename}", markdown)
                scraped_count += 1
            else:
                print(f"  ✗ Failed to scrape {url}")

        print(f"\n✅ CEA: Scraped {scraped_count}/{len(pages)} pages")
        return scraped_count


class CaliforniaInsuranceCodeScraper(InsuranceScraper):
    """Scrape California Insurance Code sections"""

    def __init__(self, output_dir: Path):
        super().__init__("https://leginfo.legislature.ca.gov", output_dir)

    def scrape_all(self):
        """Scrape CA Insurance Code sections"""
        print("\n" + "="*60)
        print("CALIFORNIA INSURANCE CODE SCRAPER")
        print("="*60)

        # Key Insurance Code sections
        sections = {
            "definitions.md": "/faces/codes_displayText.xhtml?lawCode=INS&division=&title=&part=&chapter=&article=",
            "agent-definitions-31-34.md": "/faces/codes_displaySection.xhtml?lawCode=INS&sectionNum=31",
            "licensing-1621-1650.md": "/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=5.&article=3.",
            "conduct-standards-1724-1738.md": "/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=5.&article=12.",
            "continuing-education-1749.md": "/faces/codes_displaySection.xhtml?lawCode=INS&sectionNum=1749.3",
            "life-agents-10113.md": "/faces/codes_displaySection.xhtml?lawCode=INS&sectionNum=10113.2",
            "surplus-lines-1760-1780.md": "/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=6.&article=1.",
        }

        scraped_count = 0
        for filename, path in sections.items():
            url = f"{self.base_url}{path}"
            print(f"\nScraping: {url}")

            html = self.fetch_page(url)
            if html:
                markdown = self.html_to_markdown(html, self.base_url)
                self.save_content(f"ca-insurance-code/{filename}", markdown)
                scraped_count += 1
            else:
                print(f"  ✗ Failed to scrape {url}")

        print(f"\n✅ CA Insurance Code: Scraped {scraped_count}/{len(sections)} sections")
        return scraped_count


class Proposition103Scraper(InsuranceScraper):
    """Scrape Proposition 103 complete text"""

    def __init__(self, output_dir: Path):
        super().__init__("https://consumerwatchdog.org", output_dir)

    def scrape_all(self):
        """Scrape Prop 103 content"""
        print("\n" + "="*60)
        print("PROPOSITION 103 SCRAPER")
        print("="*60)

        pages = {
            "full-text.md": "/insurance/text-proposition-103/",
            "overview.md": "/californias-proposition-103/",
            "consumer-intervenor.md": "/insurance/proposition-103-consumer-intervenor-program/",
        }

        scraped_count = 0
        for filename, path in pages.items():
            url = f"{self.base_url}{path}"
            print(f"\nScraping: {url}")

            html = self.fetch_page(url)
            if html:
                markdown = self.html_to_markdown(html, self.base_url)
                self.save_content(f"prop-103/{filename}", markdown)
                scraped_count += 1
            else:
                print(f"  ✗ Failed to scrape {url}")

        # Also scrape from CA DOI
        doi_url = "https://www.insurance.ca.gov/01-consumers/150-other-prog/01-intervenor/"
        print(f"\nScraping: {doi_url}")
        html = self.fetch_page(doi_url)
        if html:
            markdown = self.html_to_markdown(html)
            self.save_content("prop-103/ca-doi-intervenor-process.md", markdown)
            scraped_count += 1

        print(f"\n✅ Proposition 103: Scraped {scraped_count} pages")
        return scraped_count


class FAIRPlanScraper(InsuranceScraper):
    """Scrape California FAIR Plan content"""

    def __init__(self, output_dir: Path):
        super().__init__("https://www.cfpnet.com", output_dir)

    def scrape_all(self):
        """Scrape FAIR Plan content"""
        print("\n" + "="*60)
        print("CALIFORNIA FAIR PLAN SCRAPER")
        print("="*60)

        pages = {
            "overview.md": "/",
            "homeowners-policy.md": "/policies/homeowners",
            "dwelling-fire-policy.md": "/policies/dwelling-fire",
            "commercial-policy.md": "/policies/commercial",
            "earthquake-policy.md": "/policies/earthquake",
            "faq.md": "/faq",
            "claims.md": "/claims",
        }

        scraped_count = 0
        for filename, path in pages.items():
            url = f"{self.base_url}{path}"
            print(f"\nScraping: {url}")

            html = self.fetch_page(url)
            if html:
                markdown = self.html_to_markdown(html, self.base_url)
                self.save_content(f"fair-plan/{filename}", markdown)
                scraped_count += 1
            else:
                print(f"  ✗ Failed to scrape {url}")

        # Also scrape CA DOI FAIR Plan page
        doi_url = "https://www.insurance.ca.gov/01-consumers/200-wrr/California-FAIR-Plan.cfm"
        print(f"\nScraping: {doi_url}")
        html = self.fetch_page(doi_url)
        if html:
            markdown = self.html_to_markdown(html)
            self.save_content("fair-plan/ca-doi-fair-plan.md", markdown)
            scraped_count += 1

        print(f"\n✅ FAIR Plan: Scraped {scraped_count} pages")
        return scraped_count


class WorkersCompScraper(InsuranceScraper):
    """Scrape California Workers Compensation content"""

    def __init__(self, output_dir: Path):
        super().__init__("https://www.dir.ca.gov", output_dir)

    def scrape_all(self):
        """Scrape Workers Comp content"""
        print("\n" + "="*60)
        print("WORKERS' COMPENSATION SCRAPER")
        print("="*60)

        pages = {
            "guidebook.md": "/dwc/injuredworkerguidebook/injuredworkerguidebook.html",
            "medical-treatment.md": "/dwc/MedicalTreatment.html",
            "benefits-overview.md": "/dwc/WorkerBenefits.html",
            "return-to-work.md": "/dwc/ReturnToWork.html",
            "claims-process.md": "/dwc/ClaimsAdministration.html",
        }

        scraped_count = 0
        for filename, path in pages.items():
            url = f"{self.base_url}{path}"
            print(f"\nScraping: {url}")

            html = self.fetch_page(url)
            if html:
                markdown = self.html_to_markdown(html, self.base_url)
                self.save_content(f"workers-comp/{filename}", markdown)
                scraped_count += 1
            else:
                print(f"  ✗ Failed to scrape {url}")

        # Also scrape WCIRB content
        wcirb_url = "https://www.wcirb.com/research-and-education/online-guide-workers'-compensation"
        print(f"\nScraping: {wcirb_url}")
        html = self.fetch_page(wcirb_url)
        if html:
            markdown = self.html_to_markdown(html)
            self.save_content("workers-comp/wcirb-guide.md", markdown)
            scraped_count += 1

        print(f"\n✅ Workers' Comp: Scraped {scraped_count} pages")
        return scraped_count


class InsuranceBasicsScraper(InsuranceScraper):
    """Scrape insurance coverage concepts and basics"""

    def __init__(self, output_dir: Path):
        super().__init__("https://www.iii.org", output_dir)

    def scrape_all(self):
        """Scrape insurance basics content"""
        print("\n" + "="*60)
        print("INSURANCE BASICS & COVERAGE CONCEPTS SCRAPER")
        print("="*60)

        pages = {
            "auto-basics.md": "/article/auto-insurance-basics-understanding-your-coverage",
            "auto-coverages.md": "/article/what-covered-basic-auto-insurance-policy",
            "homeowners-basics.md": "/article/homeowners-insurance-basics",
            "homeowners-coverage.md": "/article/what-covered-under-homeowners-insurance",
            "liability-insurance.md": "/article/liability-insurance",
            "commercial-property.md": "/article/commercial-property-insurance",
            "commercial-liability.md": "/article/commercial-general-liability-insurance",
            "umbrella-insurance.md": "/article/what-umbrella-liability-insurance",
            "insurance-deductibles.md": "/article/understanding-your-insurance-deductible",
        }

        scraped_count = 0
        for filename, path in pages.items():
            url = f"{self.base_url}{path}"
            print(f"\nScraping: {url}")

            html = self.fetch_page(url)
            if html:
                markdown = self.html_to_markdown(html, self.base_url)
                self.save_content(f"coverage-concepts/{filename}", markdown)
                scraped_count += 1
            else:
                print(f"  ✗ Failed to scrape {url}")

        print(f"\n✅ Coverage Concepts: Scraped {scraped_count}/{len(pages)} pages")
        return scraped_count


class CaliforniaMarketScraper(InsuranceScraper):
    """Scrape California insurance market conditions"""

    def __init__(self, output_dir: Path):
        super().__init__("https://www.insurance.ca.gov", output_dir)

    def scrape_all(self):
        """Scrape CA market content"""
        print("\n" + "="*60)
        print("CALIFORNIA INSURANCE MARKET SCRAPER")
        print("="*60)

        pages = {
            "sustainable-insurance-strategy.md": "/0400-news/0100-press-releases/2023/release129-2023.cfm",
            "homeowners-market.md": "/01-consumers/200-wrr/",
            "wildfire-resources.md": "/01-consumers/200-wrr/wildfire-resources.cfm",
        }

        scraped_count = 0
        for filename, path in pages.items():
            url = f"{self.base_url}{path}"
            print(f"\nScraping: {url}")

            html = self.fetch_page(url)
            if html:
                markdown = self.html_to_markdown(html, self.base_url)
                self.save_content(f"ca-market/{filename}", markdown)
                scraped_count += 1
            else:
                print(f"  ✗ Failed to scrape {url}")

        print(f"\n✅ CA Market: Scraped {scraped_count} pages")
        return scraped_count


def main():
    """Run all scrapers"""
    print("\n" + "="*80)
    print("INSURANCE KNOWLEDGE BASE COMPREHENSIVE SCRAPER")
    print("Scraping thousands of pages from authoritative sources")
    print("="*80)

    # Base output directory
    output_dir = Path("/Users/grant/Desktop/twenty-via/.claude/skills-scraped")
    output_dir.mkdir(parents=True, exist_ok=True)

    total_pages = 0

    # Run all scrapers
    scrapers = [
        CEAScraper(output_dir),
        CaliforniaInsuranceCodeScraper(output_dir),
        Proposition103Scraper(output_dir),
        FAIRPlanScraper(output_dir),
        WorkersCompScraper(output_dir),
        InsuranceBasicsScraper(output_dir),
        CaliforniaMarketScraper(output_dir),
    ]

    for scraper in scrapers:
        try:
            count = scraper.scrape_all()
            total_pages += count
        except Exception as e:
            print(f"\n✗ Error in {scraper.__class__.__name__}: {e}")

    print("\n" + "="*80)
    print(f"SCRAPING COMPLETE: {total_pages} PAGES SCRAPED")
    print(f"Output directory: {output_dir}")
    print("="*80)

    # Save scraping summary
    summary = {
        "total_pages": total_pages,
        "output_directory": str(output_dir),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(output_dir / "scraping-summary.json", "w") as f:
        json.dump(summary, f, indent=2)


if __name__ == "__main__":
    main()
