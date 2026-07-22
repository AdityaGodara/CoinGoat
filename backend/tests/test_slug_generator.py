from app.services.slug_generator import next_slug_candidate, slugify_title


def test_slugify_title_basic():
    assert slugify_title("Bitcoin Rallies Past $70,000") == "bitcoin-rallies-past-70000"


def test_slugify_title_strips_and_lowercases():
    assert slugify_title("  Ethereum Devs Ship Upgrade!  ") == "ethereum-devs-ship-upgrade"


def test_slugify_title_empty_falls_back_to_article():
    assert slugify_title("!!!") == "article"


def test_slugify_title_truncated_to_200_chars():
    long_title = "Bitcoin " * 60
    slug = slugify_title(long_title)
    assert len(slug) <= 200


def test_next_slug_candidate_first_attempt_is_base():
    assert next_slug_candidate("bitcoin-rally", 1) == "bitcoin-rally"


def test_next_slug_candidate_appends_attempt_number():
    assert next_slug_candidate("bitcoin-rally", 2) == "bitcoin-rally-2"
    assert next_slug_candidate("bitcoin-rally", 3) == "bitcoin-rally-3"
