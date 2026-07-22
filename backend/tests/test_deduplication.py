from app.services.deduplication import is_richer, normalize_url, titles_match


def test_normalize_url_strips_tracking_params():
    a = "https://example.com/article?utm_source=twitter&utm_medium=social&id=1"
    b = "https://example.com/article?id=1"
    assert normalize_url(a) == normalize_url(b)


def test_normalize_url_drops_www_and_forces_https():
    assert normalize_url("http://www.example.com/story") == normalize_url("https://example.com/story")


def test_normalize_url_strips_trailing_slash():
    assert normalize_url("https://example.com/story/") == normalize_url("https://example.com/story")


def test_normalize_url_is_case_insensitive_on_host():
    assert normalize_url("https://Example.COM/story") == normalize_url("https://example.com/story")


def test_normalize_url_keeps_non_tracking_query_params():
    assert "page=2" in normalize_url("https://example.com/list?page=2&utm_source=x")


def test_titles_match_exact():
    assert titles_match("Bitcoin Rallies Past $70,000", "Bitcoin Rallies Past $70,000")


def test_titles_match_high_token_overlap():
    a = "Bitcoin Rallies Past $70,000 as Institutional Inflows Hit Record"
    b = "Bitcoin Rallies Past $70,000 as Institutional Inflows Surge"
    assert titles_match(a, b, threshold=0.6)


def test_titles_match_rejects_low_overlap():
    assert not titles_match("Bitcoin Rallies Past $70,000", "Ethereum Foundation Ships Devcon Tickets")


def test_titles_match_empty_titles_falls_back_to_exact_string_match():
    assert titles_match("", "")
    assert not titles_match("", "Something")


def test_is_richer_candidate_wins_when_existing_empty():
    assert is_richer("some content", None) is True
    assert is_richer("some content", "") is True


def test_is_richer_candidate_loses_when_empty():
    assert is_richer(None, "existing content") is False
    assert is_richer("", "existing content") is False


def test_is_richer_compares_length():
    assert is_richer("a much longer piece of content here", "short") is True
    assert is_richer("short", "a much longer piece of content here") is False


def test_never_overwrite_richer_with_poorer():
    # the exact guarantee DeduplicationService relies on
    existing = "a" * 500
    candidate = "a" * 10
    assert is_richer(candidate, existing) is False
