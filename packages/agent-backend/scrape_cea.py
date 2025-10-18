#!/usr/bin/env python3
"""
CEA (California Earthquake Authority) Comprehensive Scraper
Scrapes all CEA earthquake insurance documentation from earthquakeauthority.com
"""

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import time
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse
import json

class CEAScraper:
    def __init__(self):
        self.base_url = "https://www.earthquakeauthority.com"
        self.output_dir = Path("/Users/grant/Desktop/twenty-via/.claude/skills/ca-programs/reference/cea")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.scraped_urls = set()
        self.total_pages = 0
        self.total_bytes = 0

    def clean_filename(self, text: str) -> str:
        """Convert text to valid filename"""
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'\s+', '-', text)
        text = text.lower()
        text = re.sub(r'-+', '-', text)
        return text.strip('-')[:100]  # Limit length

    def fetch_page(self, url: str) -> BeautifulSoup:
        """Fetch a page and return BeautifulSoup object"""
        if url in self.scraped_urls:
            return None

        try:
            print(f"Fetching: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            self.scraped_urls.add(url)
            time.sleep(1.5)  # Be extra respectful
            return BeautifulSoup(response.text, 'lxml')
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def extract_content(self, soup: BeautifulSoup) -> str:
        """Extract main content from page"""
        for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe']):
            tag.decompose()

        # Try to find main content area
        content = soup.find('main') or soup.find('div', {'class': 'main-content'}) or soup.body

        if content:
            markdown = md(str(content), heading_style="ATX")
            markdown = re.sub(r'\n{3,}', '\n\n', markdown).strip()
            return markdown
        return ""

    def save_content(self, content: str, filepath: Path, source_url: str):
        """Save content to file with source attribution"""
        filepath.parent.mkdir(parents=True, exist_ok=True)

        full_content = f"# Source: {source_url}\n\n{content}"

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(full_content)

        self.total_bytes += len(full_content)
        self.total_pages += 1
        print(f"✓ Saved {len(full_content):,} bytes to {filepath.name}")

    def scrape_cea_sections(self):
        """
        Scrape comprehensive CEA earthquake insurance documentation
        """

        # CEA sections to scrape comprehensively
        sections = [
            # Policy information
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies',
                'name': 'policies-overview',
                'description': 'CEA Insurance Policies Overview'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/how-earthquake-insurance-works',
                'name': 'how-earthquake-insurance-works',
                'description': 'How Earthquake Insurance Works'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/what-earthquake-insurance-covers',
                'name': 'what-earthquake-insurance-covers',
                'description': 'What Earthquake Insurance Covers'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/how-to-buy-earthquake-insurance-california',
                'name': 'how-to-buy',
                'description': 'How to Buy Earthquake Insurance'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/earthquake-insurance-premium-calculator',
                'name': 'premium-calculator-info',
                'description': 'Premium Calculator Information'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/participating-residential-insurers-earthquake',
                'name': 'participating-insurers',
                'description': 'Participating Residential Insurers'
            },

            # Homeowners policies
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/homeowners',
                'name': 'homeowners-overview',
                'description': 'Homeowners Earthquake Insurance Overview'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/homeowners/coverages-and-deductibles',
                'name': 'homeowners-coverages-deductibles',
                'description': 'Homeowners Coverages and Deductibles'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/homeowners/policy-forms',
                'name': 'homeowners-policy-forms',
                'description': 'Homeowners Policy Forms'
            },

            # Condo policies
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/condominiums',
                'name': 'condo-overview',
                'description': 'Condo Earthquake Insurance Overview'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/condominiums/coverages-and-deductibles',
                'name': 'condo-coverages-deductibles',
                'description': 'Condo Coverages and Deductibles'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/condominiums/policy-forms',
                'name': 'condo-policy-forms',
                'description': 'Condo Policy Forms'
            },

            # Mobile home policies
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/mobilehomes',
                'name': 'mobilehome-overview',
                'description': 'Mobile Home Earthquake Insurance Overview'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/mobilehomes/coverages-and-deductibles',
                'name': 'mobilehome-coverages-deductibles',
                'description': 'Mobile Home Coverages and Deductibles'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/mobilehomes/policy-forms',
                'name': 'mobilehome-policy-forms',
                'description': 'Mobile Home Policy Forms'
            },

            # Renters policies
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters',
                'name': 'renters-overview',
                'description': 'Renters Earthquake Insurance Overview'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters/coverages-and-deductibles',
                'name': 'renters-coverages-deductibles',
                'description': 'Renters Coverages and Deductibles'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters/policy-forms',
                'name': 'renters-policy-forms',
                'description': 'Renters Policy Forms'
            },

            # Premium discounts
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/earthquake-insurance-policy-premium-discounts',
                'name': 'premium-discounts',
                'description': 'Premium Discounts for Retrofits and Upgrades'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/earthquake-insurance-policy-premium-discounts/retrofit-discount',
                'name': 'retrofit-discount',
                'description': 'Retrofit Discount Details'
            },

            # Claims
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/filing-earthquake-insurance-claim',
                'name': 'filing-claims',
                'description': 'Filing an Earthquake Insurance Claim'
            },
            {
                'url': 'https://www.earthquakeauthority.com/california-earthquake-insurance-policies/filing-earthquake-insurance-claim/what-to-expect-claims-process',
                'name': 'claims-process',
                'description': 'What to Expect in the Claims Process'
            },

            # About CEA
            {
                'url': 'https://www.earthquakeauthority.com/about-cea',
                'name': 'about-cea',
                'description': 'About the California Earthquake Authority'
            },
            {
                'url': 'https://www.earthquakeauthority.com/about-cea/our-history',
                'name': 'cea-history',
                'description': 'CEA History'
            },
            {
                'url': 'https://www.earthquakeauthority.com/about-cea/governance',
                'name': 'cea-governance',
                'description': 'CEA Governance Structure'
            },
            {
                'url': 'https://www.earthquakeauthority.com/about-cea/finances',
                'name': 'cea-finances',
                'description': 'CEA Financial Information'
            },

            # Research and science
            {
                'url': 'https://www.earthquakeauthority.com/about-cea/research-outreach',
                'name': 'research-overview',
                'description': 'CEA Research and Outreach'
            },
            {
                'url': 'https://www.earthquakeauthority.com/about-cea/research-outreach/our-research',
                'name': 'cea-research',
                'description': 'CEA Research Projects'
            },

            # FAQ and resources
            {
                'url': 'https://www.earthquakeauthority.com/about-cea/faq',
                'name': 'faq',
                'description': 'Frequently Asked Questions'
            },
            {
                'url': 'https://www.earthquakeauthority.com/get-ready-california/preparing-your-home',
                'name': 'preparing-your-home',
                'description': 'Preparing Your Home for an Earthquake'
            },
        ]

        print(f"\n{'='*60}")
        print(f"Scraping {len(sections)} CEA sections")
        print(f"{'='*60}\n")

        for section in sections:
            soup = self.fetch_page(section['url'])

            if not soup:
                continue

            content = self.extract_content(soup)

            if not content or len(content) < 100:
                print(f"Skipping {section['name']} - insufficient content")
                continue

            filepath = self.output_dir / f"{section['name']}.md"
            self.save_content(content, filepath, section['url'])

    def run(self):
        """Main scraping orchestration"""
        print("="*60)
        print("CEA Comprehensive Scraper")
        print("="*60)

        self.scrape_cea_sections()

        print("\n" + "="*60)
        print("SCRAPING COMPLETE")
        print("="*60)
        print(f"Total pages scraped: {self.total_pages}")
        print(f"Total content: {self.total_bytes:,} bytes ({self.total_bytes/1024:.1f} KB)")
        print(f"Approximate tokens: {self.total_bytes//4:,}")
        print(f"Output directory: {self.output_dir}")

if __name__ == "__main__":
    scraper = CEAScraper()
    scraper.run()
