from sqlalchemy import create_engine, Column, String, Float, MetaData, Table, UniqueConstraint, inspect
from sqlalchemy.orm import sessionmaker

import torch
import cv2


# Database setup
DB_URL = "postgresql://postgres.rxoanubunobjasoezgxs:Namos%40302300@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
engine = create_engine(DB_URL)
metadata = MetaData()


# Table definition with unique constraint
defects_table = Table(
    "defects", metadata,
    Column("report_id", String, nullable=False),
    Column("defect_id", String, nullable=False),
    Column("gps", String),
    Column("severity_score", Float),
    Column("area", Float)
)
inspector = inspect(engine)
# Create the table if it doesn't exist
if not inspector.has_table("defects"):
    metadata.create_all(engine)
Session = sessionmaker(bind=engine)

def insert_defect_to_db(report_id, defect_id, gps, severity_score, area):
    session = Session()
    # Combination of report_id and defect_id should be unique
    ins = defects_table.insert().values(
        report_id=report_id,
        defect_id=defect_id,
        gps=gps,
        severity_score=severity_score,
        area=area
    )
    session.execute(ins)
    session.commit()
    session.close()
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import base64
import numpy as np
import cv2
from main import get_tracker, track_and_measure_cracks, calculate_severity, placeholder_depressed_area
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    model_type = "DPT_Large"
    midas = torch.hub.load("intel-isl/MiDaS", model_type)
    midas.eval()
    device = torch.device("cpu")  # Use CPU only
    midas.to(device)
    transforms = torch.hub.load("intel-isl/MiDaS", "transforms")
    transform = transforms.dpt_transform if model_type.startswith("DPT") else transforms.small_transform
    # Example: Establish a database connection
    # app.state.db_connection = await connect_to_database()
    yield
    # Code to run on shutdown
    # Example: Close the database connection
    # await app.state.db_connection.close()

app = FastAPI(lifespan=lifespan)

app = FastAPI()
# Allow all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global dictionary to store tracker and measured_ids per report_id
report_trackers = {}

# Placeholder for database insert
# def insert_defect_to_db(defect_id, report_id, score, depressed_area, gps):
#     pass



@app.post("/analyze_defect")
async def analyze_defect(
    report_id: str = Form(...),
    gps: str = Form(...),
    predictions: str = Form(...),  # JSON string
    image: UploadFile = File(...)
):
    # Read image file
    img_bytes = await image.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    image_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image_array is None:
        return JSONResponse(status_code=400, content={"error": "Invalid image. Could not decode."})
    # Parse predictions JSON string
    import json
    try:
        preds = json.loads(predictions)
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Predictions must be a valid JSON list."})
    if not preds or not all(isinstance(pred, dict) and 'x1' in pred and 'y1' in pred and 'x2' in pred and 'y2' in pred and 'confidence' in pred and 'class' in pred for pred in preds):
        return JSONResponse(status_code=400, content={"error": "No valid predictions provided. Each prediction must have 'x1', 'y1', 'x2', 'y2', 'confidence', 'class'."})
    # Convert predictions to boxes, classes, confidences
    boxes = []
    classes = []
    confidences = []
    for pred in preds:
        x1 = pred['x1']
        y1 = pred['y1']
        x2 = pred['x2']
        y2 = pred['y2']
        boxes.append([x1, y1, x2, y2])
        classes.append(pred.get('class_id', pred['class']))
        confidences.append(pred['confidence'])
    # Validate boxes before tracking
    if not boxes or not all(isinstance(box, list) and len(box) == 4 for box in boxes):
        return JSONResponse(status_code=400, content={"error": "No valid bounding boxes for tracking.", "debug_info": {"predictions": preds}})
    # Get or create tracker and measured_ids for this report_id
    if report_id not in report_trackers:
        report_trackers[report_id] = {
            "tracker": get_tracker(),
            "measured_ids": set()
        }
    tracker = report_trackers[report_id]["tracker"]
    measured_ids = report_trackers[report_id]["measured_ids"]
    results = track_and_measure_cracks(
        image_array,
        boxes,
        classes,
        confidences,
        tracker,
        measured_ids
    )
    for track_id, (length, width, depth, depth_map) in results.items():
        score, label = calculate_severity(length, width, depth)
        percent_area = placeholder_depressed_area(length, width, depth_map, image_array.shape[:2])
        defect_id = str(track_id)  # Use tracker ID as defect ID
        insert_defect_to_db(report_id, defect_id, gps, score, percent_area)
