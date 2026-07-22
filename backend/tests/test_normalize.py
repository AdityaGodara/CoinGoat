from datetime import timezone

from worker.normalize import normalize_entry


def test_normalizes_well_formed_entry(parsed_feed):
    entry = parsed_feed.entries[0]

    result = normalize_entry(entry, source="coindesk")

    assert result is not None
    assert result.guid == "coindesk:2026:07:22:btc-rally"
    assert result.link == "https://www.coindesk.com/markets/2026/07/22/bitcoin-rallies"
    assert result.source == "coindesk"
    assert result.title == "Bitcoin Rallies Past Key Resistance"
    assert result.author == "Jane Analyst"
    assert set(result.categories) == {"Markets", "Bitcoin"}
    assert "bitcoin rally" in result.content_html
    assert result.image_url == "https://images.coindesk.com/sample/btc-rally.jpg"
    assert result.published_at.tzinfo is not None
    assert result.published_at.astimezone(timezone.utc).hour == 10


def test_missing_guid_falls_back_to_link(parsed_feed):
    entry = parsed_feed.entries[1]

    result = normalize_entry(entry, source="coindesk")

    assert result is not None
    assert result.guid == "https://www.coindesk.com/tech/2026/07/22/no-guid-item"
    assert result.link == result.guid


def test_missing_guid_and_link_drops_item():
    class FakeEntry:
        pass

    result = normalize_entry(FakeEntry(), source="coindesk")

    assert result is None


def test_unparseable_pubdate_still_returns_with_fallback_timestamp(parsed_feed):
    entry = parsed_feed.entries[2]

    result = normalize_entry(entry, source="coindesk")

    assert result is not None
    assert result.guid == "coindesk:2026:07:22:bad-date"
    assert result.published_at is not None
