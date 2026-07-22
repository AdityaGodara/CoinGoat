import pytest

from app.services.category_normalizer import CategoryNormalizer, category_for_slug, slug_for

normalizer = CategoryNormalizer()


@pytest.mark.parametrize(
    ("title", "summary", "categories", "expected"),
    [
        ("Bitcoin Rallies Past $70,000", None, None, "Bitcoin"),
        ("Ethereum Devs Ship New Upgrade", None, None, "Ethereum"),
        ("Arbitrum Announces Layer 2 Rollup Fix", None, None, "Layer 2"),
        ("DeFi Protocol Sees Record Liquidity Pool Inflows", None, None, "DeFi"),
        ("USDT Depegs Briefly Amid Market Stress", None, None, "Stablecoins"),
        ("New NFT Collection Sells Out in Minutes", None, None, "NFT"),
        ("SEC Proposes New Regulation for Exchanges", None, None, "Regulation"),
        ("Miner Hashrate Hits All-Time High Amid Difficulty Adjustment", None, None, "Mining"),
        ("Startup Uses Artificial Intelligence for Trading", None, None, "AI"),
        ("Exchange Suffers Major Hack and Exploit", None, None, "Security"),
        ("Dogecoin and Litecoin Rally Together", None, None, "Altcoins"),
        ("Some Generic Headline With No Signal", None, None, "Markets"),
    ],
)
def test_classify_by_title(title, summary, categories, expected):
    assert normalizer.classify(title=title, summary=summary, categories=categories) == expected


def test_classify_uses_summary_when_title_has_no_signal():
    result = normalizer.classify(title="Weekly Roundup", summary="A look at this week's DeFi liquidity pool activity")
    assert result == "DeFi"


def test_classify_uses_raw_feed_categories_as_signal():
    result = normalizer.classify(title="Weekly Roundup", summary=None, categories=["NFT", "Culture"])
    assert result == "NFT"


def test_slug_for_and_category_for_slug_roundtrip():
    for category in ["Bitcoin", "Layer 2", "DeFi", "Markets"]:
        slug = slug_for(category)
        assert category_for_slug(slug) == category


def test_category_for_unknown_slug_returns_none():
    assert category_for_slug("not-a-real-category") is None
