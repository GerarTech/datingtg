from pydantic import BaseModel
from typing import List, Optional

class PydanticUser(BaseModel):
    id: Optional[str] = None
    name: str
    age: int
    gender: str
    interests: List[str]
    photo: str
    bio: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PydanticMatch(BaseModel):
    user_id: str
    target_id: str
    action: str # 'like' or 'dislike'

class PydanticMessage(BaseModel):
    sender_id: str
    receiver_id: str
    text: str