from pathlib import Path

import feedparser
import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def parsed_feed():
    raw = (FIXTURES_DIR / "sample_coindesk_feed.xml").read_bytes()
    return feedparser.parse(raw)
