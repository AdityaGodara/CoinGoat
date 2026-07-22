import re

from slugify import slugify

CATEGORIES = [
    "Bitcoin",
    "Ethereum",
    "Altcoins",
    "Markets",
    "NFT",
    "Regulation",
    "Mining",
    "AI",
    "Security",
    "Layer 2",
    "DeFi",
    "Stablecoins",
]

DEFAULT_CATEGORY = "Markets"

# Order matters: specific categories are checked before the generic
# "Markets" catch-all, since Python dicts preserve insertion order and
# `classify()` returns on the first match. Edit with that in mind.
_KEYWORDS: dict[str, tuple[str, ...]] = {
    "Bitcoin": ("bitcoin", "btc", "satoshi"),
    "Ethereum": ("ethereum", "eth", "vitalik"),
    "Layer 2": ("layer 2", "layer-2", "rollup", "arbitrum", "optimism", "zk-"),
    "DeFi": ("defi", "decentralized finance", "liquidity pool", "yield farm"),
    "Stablecoins": ("stablecoin", "usdt", "usdc", "dai"),
    "NFT": ("nft", "non-fungible"),
    "Regulation": ("sec", "regulation", "regulatory", "lawsuit", "compliance", "cftc"),
    "Mining": ("mining", "miner", "hashrate", "asic"),
    "AI": ("artificial intelligence", "ai", "machine learning"),
    "Security": ("hack", "exploit", "breach", "vulnerability"),
    "Altcoins": ("altcoin", "dogecoin", "litecoin", "xrp", "cardano", "solana"),
    "Markets": ("market", "price", "trading", "rally", "correction"),
}


def _pattern_for(keyword: str) -> re.Pattern[str]:
    # A handful of keywords are intentional prefix fragments (e.g. "zk-" is
    # meant to match "zk-rollup"/"zk-sync") — those get a leading boundary
    # only. Everything else is a whole-word match, so short tokens like
    # "eth"/"ai"/"dai" don't false-positive inside unrelated words
    # ("together", "rain", "maiden").
    if keyword.endswith("-"):
        return re.compile(r"\b" + re.escape(keyword))
    return re.compile(r"\b" + re.escape(keyword) + r"\b")


_COMPILED_KEYWORDS: dict[str, tuple[re.Pattern[str], ...]] = {
    category: tuple(_pattern_for(keyword) for keyword in keywords) for category, keywords in _KEYWORDS.items()
}

_SLUG_BY_CATEGORY = {category: slugify(category) for category in CATEGORIES}
_CATEGORY_BY_SLUG = {slug: category for category, slug in _SLUG_BY_CATEGORY.items()}


class CategoryNormalizer:
    def classify(self, *, title: str, summary: str | None = None, categories: list[str] | None = None) -> str:
        raw_categories = " ".join(categories or [])
        haystack = f"{title} {summary or ''} {raw_categories}".lower()
        for category, patterns in _COMPILED_KEYWORDS.items():
            if any(pattern.search(haystack) for pattern in patterns):
                return category
        return DEFAULT_CATEGORY


def slug_for(category: str) -> str:
    return _SLUG_BY_CATEGORY.get(category, slugify(category))


def category_for_slug(slug: str) -> str | None:
    return _CATEGORY_BY_SLUG.get(slug)
