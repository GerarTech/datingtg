from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
from datetime import datetime

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data storage
DATA_FILE = "mock_data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {
        "users": {},
        "verification_requests": [],
        "matches": [],
        "messages": []
    }

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2, default=str)

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
    isVerified: Optional[bool] = False
    verificationStatus: Optional[str] = "unverified"
    createdAt: Optional[str] = None

class VerificationRequest(BaseModel):
    id: str
    userId: str
    selfieDataUrl: str
    createdAt: int

class PydanticMatch(BaseModel):
    user_id: str
    target_id: str
    action: str

class PydanticMessage(BaseModel):
    sender_id: str
    receiver_id: str
    text: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/users")
def create_user(user: PydanticUser):
    data = load_data()
    user_id = str(datetime.now().timestamp()).replace('.', '')
    user_dict = user.dict()
    user_dict["id"] = user_id
    user_dict["createdAt"] = datetime.now().isoformat()
    data["users"][user_id] = user_dict
    save_data(data)
    return {"id": user_id, "status": "created"}

@app.get("/users")
def get_all_users():
    data = load_data()
    return list(data["users"].values())

@app.get("/users/{user_id}")
def get_user(user_id: str):
    data = load_data()
    if user_id not in data["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    return data["users"][user_id]

@app.patch("/users/{user_id}")
def update_user(user_id: str, updates: Dict[str, Any]):
    data = load_data()
    if user_id not in data["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    data["users"][user_id].update(updates)
    save_data(data)
    return data["users"][user_id]

@app.delete("/users/{user_id}")
def delete_user(user_id: str):
    data = load_data()
    if user_id not in data["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    del data["users"][user_id]
    save_data(data)
    return {"status": "deleted"}

@app.post("/verification-requests")
def create_verification_request(request: Dict[str, Any]):
    data = load_data()
    request_id = str(datetime.now().timestamp()).replace('.', '')
    verification_request = {
        "id": request_id,
        "userId": request["userId"],
        "selfieDataUrl": request["selfieDataUrl"],
        "createdAt": int(datetime.now().timestamp() * 1000)
    }
    data["verification_requests"].append(verification_request)
    save_data(data)
    return verification_request

@app.get("/verification-requests")
def get_verification_requests():
    data = load_data()
    return data["verification_requests"]

@app.post("/verification-requests/{request_id}/approve")
def approve_verification_request(request_id: str):
    data = load_data()
    request = next((r for r in data["verification_requests"] if r["id"] == request_id), None)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Update user verification status
    user_id = request["userId"]
    if user_id in data["users"]:
        data["users"][user_id]["isVerified"] = True
        data["users"][user_id]["verificationStatus"] = "verified"

    # Remove the request
    data["verification_requests"] = [r for r in data["verification_requests"] if r["id"] != request_id]
    save_data(data)
    return {"status": "approved"}

@app.post("/verification-requests/{request_id}/decline")
def decline_verification_request(request_id: str):
    data = load_data()
    data["verification_requests"] = [r for r in data["verification_requests"] if r["id"] != request_id]
    save_data(data)
    return {"status": "declined"}

@app.post("/matches")
def record_like(match: PydanticMatch):
    data = load_data()
    data["matches"].append(match.dict())
    save_data(data)
    # Simple match logic - if the other user also liked, it's a match
    is_match = any(m["user_id"] == match.target_id and m["target_id"] == match.user_id for m in data["matches"])
    return {"is_match": is_match}

@app.get("/discovery/{user_id}")
def get_feed(user_id: str, lat: float = None, lon: float = None):
    data = load_data()
    users = [u for u in data["users"].values() if u["id"] != user_id]
    # Simple mock feed - return all other users
    return users[:20]  # Limit to 20 for demo