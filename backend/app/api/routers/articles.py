import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_article_repository
from app.repositories.article_repository import ArticleRepository
from app.schemas.article import ArticleListOut, ArticleOut

router = APIRouter()


@router.get("/articles", response_model=ArticleListOut)
async def list_articles(
    repo: Annotated[ArticleRepository, Depends(get_article_repository)],
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
):
    return await repo.list_latest(limit=limit, offset=offset)


@router.get("/articles/{article_id}", response_model=ArticleOut)
async def get_article(
    article_id: uuid.UUID,
    repo: Annotated[ArticleRepository, Depends(get_article_repository)],
):
    article = await repo.get_by_id(article_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article
