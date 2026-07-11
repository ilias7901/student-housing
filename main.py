from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional
import json
import bcrypt
import os
import shutil
import jwt
import datetime

SECRET_KEY = "super-secret-studynest-key-change-in-production"
ALGORITHM = "HS256"
security = HTTPBearer()

# ─── Database Setup ──────────────────────────────────────────
DATABASE_URL = "sqlite:///./studynest.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def hash_password(password: str) -> str:
    pw_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pw_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False

# ─── Database Models ─────────────────────────────────────────
class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class ListingModel(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    city = Column(String, nullable=False)
    neighborhood = Column(String, nullable=False)
    type = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    size = Column(Integer, nullable=False)
    available = Column(String, nullable=False)
    furnished = Column(Boolean, default=False)
    features_json = Column(Text, default="[]")
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

Base.metadata.create_all(bind=engine)

# ─── FastAPI App ─────────────────────────────────────────────
app = FastAPI(title="EtuLoc API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ─── Pydantic Schemas ────────────────────────────────────────
class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ListingCreate(BaseModel):
    title: str
    city: str
    neighborhood: str
    type: str
    price: int
    size: int
    available: str
    furnished: bool = False
    features: List[str] = []
    description: str
    imageUrl: Optional[str] = None
    userId: Optional[int] = None

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    type: Optional[str] = None
    price: Optional[int] = None
    size: Optional[int] = None
    available: Optional[str] = None
    furnished: Optional[bool] = None
    features: Optional[List[str]] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None

# ─── Helpers ─────────────────────────────────────────────────
GRADIENTS = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
]

TYPE_IMAGES = {"room": "images/room1.jpg", "studio": "images/room2.jpg", "apartment": "images/room4.jpg", "shared": "images/room3.jpg"}
TYPE_ICONS = {"room": "🛏️", "studio": "🏙️", "apartment": "🏢", "shared": "🏠"}

def format_listing(l, index=0, user_name=None):
    features = json.loads(l.features_json) if l.features_json else []
    name = user_name or "Landlord"
    initials = "".join([w[0] for w in name.split()]).upper()[:2]
    return {
        "id": l.id,
        "title": l.title,
        "city": l.city,
        "neighborhood": l.neighborhood,
        "price": l.price,
        "type": l.type,
        "size": l.size,
        "furnished": l.furnished,
        "available": l.available,
        "features": features,
        "description": l.description,
        "userId": l.user_id,
        "gradient": GRADIENTS[index % len(GRADIENTS)],
        "image": l.image_url if l.image_url else TYPE_IMAGES.get(l.type, "images/room1.jpg"),
        "icon": TYPE_ICONS.get(l.type, "🏠"),
        "isCustom": True,
        "landlord": {
            "name": name,
            "initials": initials,
            "rating": 0,
            "responseTime": "New"
        },
        "featured": False
    }

# ─── API Endpoints ───────────────────────────────────────────

@app.post("/api/upload")
def upload_image(file: UploadFile = File(...)):
    os.makedirs("images/uploads", exist_ok=True)
    file_path = f"images/uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"success": True, "imageUrl": file_path}

@app.post("/api/signup")
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == user_data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered.")
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    hashed = hash_password(user_data.password)
    user = UserModel(name=user_data.name.strip(), email=user_data.email.lower().strip(), hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.id})
    return {"success": True, "token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}

@app.post("/api/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == user_data.email.lower()).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    
    token = create_access_token({"sub": user.id})
    return {"success": True, "token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}

@app.get("/api/listings")
def get_listings(db: Session = Depends(get_db)):
    listings = db.query(ListingModel).all()
    result = []
    for i, l in enumerate(listings):
        # Get landlord name
        user_name = None
        if l.user_id:
            user = db.query(UserModel).filter(UserModel.id == l.user_id).first()
            if user:
                user_name = user.name
        result.append(format_listing(l, i, user_name))
    return result

@app.post("/api/listings")
def create_listing(listing: ListingCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    new_listing = ListingModel(
        title=listing.title,
        city=listing.city,
        neighborhood=listing.neighborhood,
        type=listing.type,
        price=listing.price,
        size=listing.size,
        available=listing.available,
        furnished=listing.furnished,
        features_json=json.dumps(listing.features),
        description=listing.description,
        image_url=listing.imageUrl,
        user_id=current_user.id
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return {"success": True, "id": new_listing.id}

@app.delete("/api/listings/{listing_id}")
def delete_listing(listing_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    listing = db.query(ListingModel).filter(ListingModel.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")
    if listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing.")
    db.delete(listing)
    db.commit()
    return {"success": True}

@app.put("/api/listings/{listing_id}")
def update_listing(listing_id: int, update_data: ListingUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    listing = db.query(ListingModel).filter(ListingModel.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")
    if listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing.")
    
    update_dict = update_data.dict(exclude_unset=True)
    if "features" in update_dict:
        update_dict["features_json"] = json.dumps(update_dict.pop("features"))
    if "imageUrl" in update_dict:
        update_dict["image_url"] = update_dict.pop("imageUrl")

    for key, value in update_dict.items():
        setattr(listing, key, value)
        
    db.commit()
    db.refresh(listing)
    return {"success": True}

# ─── Serve Static Frontend ──────────────────────────────────
# This MUST be the last mount — catches all non-API routes
app.mount("/", StaticFiles(directory=".", html=True), name="static")
