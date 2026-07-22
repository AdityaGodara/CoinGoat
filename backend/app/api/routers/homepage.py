from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_article_repository
from app.repositories.article_repository import ArticleRepository
from app.schemas.article import HomepageOut

router = APIRouter(prefix="/api", tags=["homepage"])


@router.get("/homepage", response_model=HomepageOut)
async def get_homepage(repo: Annotated[ArticleRepository, Depends(get_article_repository)]):
    return await repo.get_homepage()
