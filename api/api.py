from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Literal, Optional
from fastapi.middleware.cors import CORSMiddleware
from utils import *
from fastapi import FastAPI, HTTPException
from pydantic_stuff import ProcessNameRequest, ProcessNameResponse, SearchRequest, DataRecordSearch
from gdpr_risk_analyzer import extract_schema_metadata, perform_gdpr_analysis, generate_chart
import io
from fastapi.responses import StreamingResponse
from sql_extraction import run_agent_for_names

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
@app.post("/search", response_model=List[DataRecordSearch])
def search_data(request: SearchRequest):
    # Mock data generation
    # add some time
    #import time
    #time.sleep(2)
    results = run_agent_for_names()
    return results

    """ return [
        DataRecordSearch(
            source="ORACLE_EBS_HACK.dbo.AR_HZ_PARTIES.PARTY_NAME",
            #firstName=request.firstName,
            #name=request.name,
            name = "Paula Erickson",
            key="1250",
            probability=100
        ),
        DataRecordSearch(
            source="ECC60jkl_HACK.dbo.KNA1.NAME1",
            name="Paula Erickson",
            key="3533",
            probability=100
        ),
        DataRecordSearch(
            source="ECC60jkl_HACK.dbo.ADRC.NAME1",
            name="Paula Erickson",
            key="2277",
            probability=100
        ),
        DataRecordSearch(
            source="ECC60jkl_HACK.dbo.ADRC.MC_NAME1",
            name="Paula Erickson",
            key="2999",
            probability=100
        ),
        DataRecordSearch(
            source="ECC60jkl_HACK.dbo.ADRP.NAME_TEXT",
            name="Paula Erickson",
            key="1337",
            probability=100
        )
    ] """

# === FastAPI Endpoint ===
@app.post("/process-name", response_model=ProcessNameResponse)
async def process_name(request: ProcessNameRequest):
    """
    Process a name with masking (encryption) or deletion
    
    - **fname**: First name to process
    - **lname**: Last name to process  
    - **id**: Entity ID (BusinessEntityID)
    - **action**: Action to perform - "mask" (encrypt) or "delete"
    """
    try:        
        if request.action == "mask":
            # Mask the names (using encryption)
            encrypted_name, key = encrypt_name(request.name)
            
            # Insert encrypted data
            success = insert_into_results_table(
                request.id, encrypted_name, key, request.source, request.probability
            )
            
            if success:
                return ProcessNameResponse(
                    success=True,
                    message="Names masked (encrypted) and inserted successfully",
                    entity_id=request.id,
                    original_name=request.name,
                    processed_name=encrypted_name,
                    encryption_key=key,
                    source=request.source,
                    probability= request.probability
                )
            else:
                raise HTTPException(status_code=500, detail="Failed to insert masked data")
                
        elif request.action == "delete":
            # Mark for deletion
            success = insert_into_results_table(
                request.id, request.name, "no_key_since_deletion", request.source, request.probability
            )
            
            if success:
                return ProcessNameResponse(
                    success=True,
                    message="Names marked for deletion successfully",
                    entity_id=request.id,
                    original_name=request.name,
                    processed_name=request.name,
                    encryption_key="no_key_since_deletion",
                    source=request.source,
                    probability=request.probability
                )
            else:
                raise HTTPException(status_code=500, detail="Failed to mark for deletion")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    

@app.get("/analyze-gdpr/{database_name}")
async def analyze_gdpr_endpoint(database_name: str):
    """
    Perform GDPR analysis and return results as JSON
    """
    try:
        schema_df = extract_schema_metadata(database_name)
        analysis_df = perform_gdpr_analysis(schema_df, database_name)
        return {"data": analysis_df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/generate-chart/{database_name}")
async def generate_percentage_chart(database_name: str = "AdventureWorks2019"):
    """
    Generate and return percentage analysis chart as PNG
    """
    try:
        img_buffer = generate_chart(database_name)

        # Return PNG as streaming response
        return StreamingResponse(
            io.BytesIO(img_buffer.getvalue()),
            media_type="image/png",
            headers={"Content-Disposition": "inline; filename=percentage_analysis.png"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating chart: {str(e)}")