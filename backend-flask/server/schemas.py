from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class CommentScrapped(BaseModel):
    id: str
    texto: str
    fecha: Optional[int] = None  # Timestamp
    autor: Optional[str] = None
    sourceUrl: Optional[str] = Field(None, alias='news_url')  # Mapea 'news_url' a 'sourceUrl'
    news_url: Optional[str] = None  # Mantén esto si necesitas acceder a 'news_url' directamente

    @validator('id', pre=True, always=True)
    def convert_id_to_str(cls, v):
        return str(v) if v is not None else v

    class Config:
        allow_population_by_field_name = True
        anystr_strip_whitespace = True  # Opcional: elimina espacios en blanco
class ScrapedData(BaseModel):
    webSiteName: str
    comments: List[CommentScrapped]
