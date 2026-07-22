from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_article_repository
from app.repositories.article_repository import ArticleRepository
from app.schemas.article import ArticleListOut, ArticleOut

router = APIRouter(prefix="/api", tags=["articles"])


@router.get("/latest", response_model=ArticleListOut)
async def list_latest(
    repo: Annotated[ArticleRepository, Depends(get_article_repository)],
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
):
    return await repo.list_latest(limit=limit, offset=offset)


@router.get("/article/{slug}", response_model=ArticleOut)
async def get_article(
    slug: str,
    repo: Annotated[ArticleRepository, Depends(get_article_repository)],
):
    article = await repo.get_by_slug(slug)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/category/{slug}", response_model=ArticleListOut)
async def list_by_category(
    slug: str,
    repo: Annotated[ArticleRepository, Depends(get_article_repository)],
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
):
    result = await repo.list_by_category(slug, limit=limit, offset=offset)
    if result is None:
        raise HTTPException(status_code=404, detail="Unknown category")
    return result


@router.get("/search", response_model=ArticleListOut)
async def search_articles(
    repo: Annotated[ArticleRepository, Depends(get_article_repository)],
    q: str = Query(..., min_length=2),
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
):
    return await repo.search(q, limit=limit, offset=offset)
