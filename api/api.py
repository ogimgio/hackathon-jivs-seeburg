from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import EventSourceResponse
import time


# ----- Models -----
class SearchRequest(BaseModel):
    firstName: str
    lastName: str
    action: str  # "mask" or "delete"

class DataRecord(BaseModel):
    firstName: str
    lastName: str
    key: str
    encryptionKey: str
    probability: float

# ----- App Setup -----
app = FastAPI()

# Allow frontend (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use your frontend origin in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Routes -----
@app.post("/search", response_model=List[DataRecord])
def search_data(request: SearchRequest):
    # Mock data generation
    return [
        DataRecord(
            firstName=request.firstName,
            lastName=request.lastName,
            key="usr_1a2b3c4d5e6f",
            encryptionKey="enc_9x8y7z6w5v4u",
            probability=0.95
        ),
        DataRecord(
            firstName=request.firstName,
            lastName=request.lastName + "son",
            key="usr_2b3c4d5e6f7g",
            encryptionKey="enc_8x7y6z5w4v3u",
            probability=0.73
        ),
        DataRecord(
            firstName=request.firstName[0] + "." + request.firstName[1:],
            lastName=request.lastName,
            key="usr_3c4d5e6f7g8h",
            encryptionKey="enc_7x6y5z4w3v2u",
            probability=0.41
        )
    ]
    
@app.post("/stream-progress")
def stream_progress(request: SearchRequest):
    def event_generator():
        yield "data: Starting search...\n\n"
        time.sleep(1)
        yield f"data: Looking up firstName: {request.firstName}\n\n"
        time.sleep(1)
        yield f"data: Matching lastName: {request.lastName}\n\n"
        time.sleep(1)
        yield f"data: Applying action: {request.action}\n\n"
        time.sleep(1)
        yield f"data: Finalizing response...\n\n"
        time.sleep(1)
        yield f"data: DONE\n\n"

    return EventSourceResponse(event_generator())

