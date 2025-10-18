#!/usr/bin/env python3
"""
California Insurance Code Comprehensive Scraper
Scrapes the entire CA Insurance Code from leginfo.legislature.ca.gov
Target: All relevant divisions and chapters for insurance producers/agents
"""

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import time
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse
import json

class CAInsuranceCodeScraper:
    def __init__(self):
        self.base_url = "https://leginfo.legislature.ca.gov"
        self.output_dir = Path("/Users/grant/Desktop/twenty-via/.claude/skills/ca-insurance-code/reference")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.scraped_urls = set()
        self.total_pages = 0
        self.total_bytes = 0

    def clean_filename(self, text: str) -> str:
        """Convert text to valid filename"""
        # Remove special characters, keep only alphanumeric, spaces, hyphens
        text = re.sub(r'[^\w\s-]', '', text)
        # Replace spaces with hyphens
        text = re.sub(r'\s+', '-', text)
        # Convert to lowercase
        text = text.lower()
        # Remove multiple consecutive hyphens
        text = re.sub(r'-+', '-', text)
        return text.strip('-')

    def fetch_page(self, url: str) -> BeautifulSoup:
        """Fetch a page and return BeautifulSoup object"""
        if url in self.scraped_urls:
            return None

        try:
            print(f"Fetching: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            self.scraped_urls.add(url)
            time.sleep(1)  # Be respectful
            return BeautifulSoup(response.text, 'lxml')
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def extract_content(self, soup: BeautifulSoup) -> str:
        """Extract main content from page"""
        # Remove unwanted elements
        for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe']):
            tag.decompose()

        # Try to find main content area
        content = soup.find('div', {'id': 'content'}) or soup.find('main') or soup.body

        if content:
            # Convert to markdown
            markdown = md(str(content), heading_style="ATX")
            # Clean up excessive newlines
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

    def scrape_division(self, division_num: int, division_name: str):
        """Scrape an entire division of the Insurance Code"""
        print(f"\n{'='*60}")
        print(f"Scraping Division {division_num}: {division_name}")
        print(f"{'='*60}")

        # Create division directory
        division_dir = self.output_dir / f"division-{division_num}-{self.clean_filename(division_name)}"

        # Construct URL for division TOC
        toc_url = f"{self.base_url}/codes/ins.html"
        soup = self.fetch_page(toc_url)

        if not soup:
            print(f"Failed to fetch TOC for division {division_num}")
            return

        # Find all chapter links for this division
        # The structure is: Division > Part > Chapter > Article > Sections
        # We'll scrape at the chapter level for comprehensive coverage

        # Look for division header
        division_links = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            text = link.get_text().strip()

            # Match chapter links (e.g., "Chapter 1", "Chapter 2", etc.)
            if re.search(rf'Chapter\s+\d+', text, re.IGNORECASE):
                full_url = urljoin(self.base_url, href)
                division_links.append((text, full_url))

        print(f"Found {len(division_links)} chapter links")

        # Scrape each chapter
        for chapter_name, chapter_url in division_links[:50]:  # Limit to first 50 chapters to be safe
            self.scrape_chapter(chapter_name, chapter_url, division_dir)

    def scrape_chapter(self, chapter_name: str, chapter_url: str, output_dir: Path):
        """Scrape a single chapter"""
        soup = self.fetch_page(chapter_url)

        if not soup:
            return

        content = self.extract_content(soup)

        if not content or len(content) < 100:
            print(f"Skipping {chapter_name} - insufficient content")
            return

        # Save to file
        filename = f"{self.clean_filename(chapter_name)}.md"
        filepath = output_dir / filename
        self.save_content(content, filepath, chapter_url)

    def scrape_insurance_code_sections(self):
        """
        Scrape key sections of CA Insurance Code relevant to insurance producers/agents
        """

        # Key divisions to scrape:
        key_sections = [
            # Producer licensing (most important for agents)
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=5.&article=',
                'name': 'producer-licensing-general',
                'description': 'General Producer Licensing Requirements'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=INS&division=1.&title=&part=2.&chapter=6.&article=',
                'name': 'license-types',
                'description': 'License Types and Classes'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=5.&article=5.',
                'name': 'license-application',
                'description': 'License Application Process'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=5.&article=6.',
                'name': 'continuing-education',
                'description': 'Continuing Education Requirements'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=5.&article=7.',
                'name': 'license-renewal',
                'description': 'License Renewal'
            },
            # Agent conduct and ethics
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=5.&article=14.',
                'name': 'unfair-practices',
                'description': 'Unfair Practices and Prohibited Conduct'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=INS&division=1.&title=&part=2.&chapter=1.',
                'name': 'insurance-department-powers',
                'description': 'Department of Insurance Powers and Authority'
            },
            # Producer compensation
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=6.&article=4.',
                'name': 'producer-compensation',
                'description': 'Producer Compensation and Commissions'
            },
            # Specific license lines
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=6.&article=6.',
                'name': 'life-agent-license',
                'description': 'Life Agent License Requirements'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=6.&article=6.5.',
                'name': 'accident-health-license',
                'description': 'Accident and Health License Requirements'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=6.&article=7.',
                'name': 'property-casualty-license',
                'description': 'Property and Casualty License Requirements'
            },
            # Surplus lines
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=INS&division=1.&title=&part=2.&chapter=7.7.',
                'name': 'surplus-lines',
                'description': 'Surplus Lines Insurance'
            },
            # Specific coverage types
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=INS&division=2.&title=&part=2.&chapter=1.',
                'name': 'automobile-insurance',
                'description': 'Automobile Insurance Provisions'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=INS&division=2.&title=&part=2.&chapter=2.5.',
                'name': 'homeowners-insurance',
                'description': 'Homeowners Insurance Provisions'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=INS&division=2.&title=&part=2.&chapter=9.',
                'name': 'earthquake-insurance',
                'description': 'Earthquake Insurance'
            },
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=INS&division=2.&title=&part=2.&chapter=10.',
                'name': 'residential-property-insurance',
                'description': 'Residential Property Insurance'
            },
            # Rate regulation (Prop 103)
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=2.&title=&part=2.&chapter=9.&article=1.',
                'name': 'rate-regulation',
                'description': 'Rate Regulation (Proposition 103)'
            },
            # Claims handling
            {
                'url': 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=INS&division=1.&title=&part=2.&chapter=1.&article=13.',
                'name': 'claims-practices',
                'description': 'Fair Claims Settlement Practices'
            },
        ]

        print(f"\n{'='*60}")
        print(f"Scraping {len(key_sections)} key sections of CA Insurance Code")
        print(f"{'='*60}\n")

        for section in key_sections:
            soup = self.fetch_page(section['url'])

            if not soup:
                continue

            content = self.extract_content(soup)

            if not content or len(content) < 100:
                print(f"Skipping {section['name']} - insufficient content")
                continue

            # Save to file
            filepath = self.output_dir / f"{section['name']}.md"
            self.save_content(content, filepath, section['url'])

    def run(self):
        """Main scraping orchestration"""
        print("="*60)
        print("California Insurance Code Comprehensive Scraper")
        print("="*60)

        # Scrape all key sections
        self.scrape_insurance_code_sections()

        # Print summary
        print("\n" + "="*60)
        print("SCRAPING COMPLETE")
        print("="*60)
        print(f"Total pages scraped: {self.total_pages}")
        print(f"Total content: {self.total_bytes:,} bytes ({self.total_bytes/1024:.1f} KB)")
        print(f"Approximate tokens: {self.total_bytes//4:,}")
        print(f"Output directory: {self.output_dir}")

if __name__ == "__main__":
    scraper = CAInsuranceCodeScraper()
    scraper.run()
