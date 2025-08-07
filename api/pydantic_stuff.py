from pydantic import BaseModel
from typing import List, Literal, Optional

class ProcessNameRequest(BaseModel):
    source: str
    name: str
    probability: int
    id: str
    action: Literal["mask", "delete"]

class ProcessNameResponse(BaseModel):
    success: bool
    message: str
    entity_id: str
    original_name: str
    processed_name: Optional[str] = None
    encryption_key: Optional[str] = None
    source: str
    probability: float

# ----- Models -----
class SearchRequest(BaseModel):
    firstName: str
    lastName: str
    action: str  # "mask" or "delete"

class DataRecordSearch(BaseModel):
    source: str
    name: str
    key: str
    probability: float