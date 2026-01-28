from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query, Body, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from square import Square
from square.environment import SquareEnvironment
import resend
from passlib.context import CryptContext
from jose import JWTError, jwt
import io


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# GridFS for file storage
fs_bucket = AsyncIOMotorGridFSBucket(db, bucket_name="uploads")

# Square client initialization
square_client = Square(
    token=os.environ.get('SQUARE_ACCESS_TOKEN', ''),
    environment=SquareEnvironment.SANDBOX if os.environ.get('SQUARE_ENVIRONMENT', 'sandbox') == 'sandbox' else SquareEnvironment.PRODUCTION
)

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'contact@mothernaturalhealinglab.com')
BUSINESS_NAME = os.environ.get('BUSINESS_NAME', 'Mother Natural: The Healing Lab')

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'mother-natural-secret-key-change-in-production-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Startup event to create default admin user
@app.on_event("startup")
async def create_default_admin():
    """Create the default admin user if it doesn't exist"""
    admin_email = "admin@mothernatural.com"
    admin_password = "Aniyah13"
    
    existing_admin = await db.auth_users.find_one({"email": admin_email})
    if not existing_admin:
        admin_user = {
            "id": "admin-001",
            "name": "Administrator",
            "email": admin_email,
            "hashed_password": get_password_hash(admin_password),
            "role": "admin",
            "membershipLevel": "platinum",
            "joinedDate": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        }
        await db.auth_users.insert_one(admin_user)
        logger.info("Default admin user created")
    else:
        logger.info("Default admin user already exists")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Payment Models
class PaymentItem(BaseModel):
    id: str
    name: str
    quantity: int
    price: int  # in cents
    type: str  # product, appointment, retreat

class PaymentRequest(BaseModel):
    sourceId: str
    amount: int  # in cents
    currency: str = "USD"
    paymentType: str  # product, appointment, retreat
    items: List[PaymentItem]
    customerEmail: Optional[str] = None
    customerName: Optional[str] = None

class PaymentResponse(BaseModel):
    success: bool
    paymentId: Optional[str] = None
    orderId: Optional[str] = None
    message: str

# Email Models
class EmailRequest(BaseModel):
    recipient_email: str
    subject: str
    html_content: str

class BulkEmailRequest(BaseModel):
    recipient_emails: List[str]
    subject: str
    html_content: str

class UserModel(BaseModel):
    id: str
    name: str
    email: str
    joinedDate: Optional[str] = None

# ===============================
# AUTHENTICATION MODELS
# ===============================

class UserRegisterModel(BaseModel):
    name: str
    email: EmailStr
    password: str
    profileImage: Optional[str] = None

class UserLoginModel(BaseModel):
    email: EmailStr
    password: str

class TokenModel(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserInDB(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    hashed_password: str
    role: str = "user"  # "user" or "admin"
    membershipLevel: str = "basic"
    joinedDate: str
    created_at: str
    is_active: bool = True
    profileImage: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    membershipLevel: str
    joinedDate: str
    profileImage: Optional[str] = None

class AdminCreateUserModel(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"
    membershipLevel: str = "basic"


# ===============================
# AUTHENTICATION HELPER FUNCTIONS
# ===============================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_by_email(email: str) -> Optional[dict]:
    user = await db.auth_users.find_one({"email": email}, {"_id": 0})
    return user

async def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.get("hashed_password", "")):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Optional[dict]:
    """Get current user from JWT token - returns None if no token or invalid"""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = await get_user_by_email(email)
        return user
    except JWTError:
        return None

async def get_current_active_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Require authenticated user - raises 401 if not authenticated"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await get_user_by_email(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

async def get_current_admin_user(current_user: dict = Depends(get_current_active_user)) -> dict:
    """Require admin role"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


# ===============================
# AUTHENTICATION API ENDPOINTS
# ===============================

@api_router.post("/auth/register", response_model=TokenModel)
async def register_user(user_data: UserRegisterModel):
    """Register a new user (public registration)"""
    # Check if user exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    new_user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "role": "user",
        "membershipLevel": "basic",
        "joinedDate": now,
        "created_at": now,
        "is_active": True
    }
    
    await db.auth_users.insert_one(new_user)
    
    # Generate token
    access_token = create_access_token(data={"sub": user_data.email})
    
    # Return user data without password
    user_response = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "role": "user",
        "membershipLevel": "basic",
        "joinedDate": now
    }
    
    return TokenModel(access_token=access_token, user=user_response)


@api_router.post("/auth/token", response_model=TokenModel)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with OAuth2 form (username=email, password)"""
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    
    user_response = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "membershipLevel": user.get("membershipLevel", "basic"),
        "joinedDate": user.get("joinedDate", "")
    }
    
    return TokenModel(access_token=access_token, user=user_response)


@api_router.post("/auth/login", response_model=TokenModel)
async def login_user(login_data: UserLoginModel):
    """Login with JSON body (alternative to OAuth2 form)"""
    user = await authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    
    user_response = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "membershipLevel": user.get("membershipLevel", "basic"),
        "joinedDate": user.get("joinedDate", ""),
        "profileImage": user.get("profileImage")
    }
    
    return TokenModel(access_token=access_token, user=user_response)


@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """Get current authenticated user's info"""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user.get("role", "user"),
        membershipLevel=current_user.get("membershipLevel", "basic"),
        joinedDate=current_user.get("joinedDate", ""),
        profileImage=current_user.get("profileImage")
    )


@api_router.put("/auth/profile")
async def update_user_profile(
    name: Optional[str] = Body(None),
    membershipLevel: Optional[str] = Body(None),
    profileImage: Optional[str] = Body(None),
    current_user: dict = Depends(get_current_active_user)
):
    """Update current user's profile"""
    update_data = {}
    if name:
        update_data["name"] = name
    if membershipLevel:
        update_data["membershipLevel"] = membershipLevel
    if profileImage is not None:
        update_data["profileImage"] = profileImage
    
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.auth_users.update_one(
            {"email": current_user["email"]},
            {"$set": update_data}
        )
    
    updated_user = await get_user_by_email(current_user["email"])
    return {
        "success": True,
        "user": {
            "id": updated_user["id"],
            "name": updated_user["name"],
            "email": updated_user["email"],
            "role": updated_user.get("role", "user"),
            "membershipLevel": updated_user.get("membershipLevel", "basic"),
            "joinedDate": updated_user.get("joinedDate", ""),
            "profileImage": updated_user.get("profileImage")
        }
    }


@api_router.put("/auth/change-password")
async def change_password(
    current_password: str = Body(...),
    new_password: str = Body(...),
    current_user: dict = Depends(get_current_active_user)
):
    """Change user's password"""
    if not verify_password(current_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    await db.auth_users.update_one(
        {"email": current_user["email"]},
        {"$set": {
            "hashed_password": get_password_hash(new_password),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Password changed successfully"}


# ===============================
# ADMIN USER MANAGEMENT ENDPOINTS
# ===============================

@api_router.post("/admin/users", response_model=UserResponse)
async def admin_create_user(
    user_data: AdminCreateUserModel,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Admin creates a new user"""
    # Check if user exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    new_user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "role": user_data.role,
        "membershipLevel": user_data.membershipLevel,
        "joinedDate": now,
        "created_at": now,
        "is_active": True,
        "created_by": current_admin["id"]
    }
    
    await db.auth_users.insert_one(new_user)
    
    return UserResponse(
        id=user_id,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        membershipLevel=user_data.membershipLevel,
        joinedDate=now
    )


@api_router.get("/admin/users", response_model=List[UserResponse])
async def admin_get_all_users(current_admin: dict = Depends(get_current_admin_user)):
    """Admin gets all users"""
    users = await db.auth_users.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
    return [UserResponse(
        id=u["id"],
        name=u["name"],
        email=u["email"],
        role=u.get("role", "user"),
        membershipLevel=u.get("membershipLevel", "basic"),
        joinedDate=u.get("joinedDate", "")
    ) for u in users]


@api_router.put("/admin/users/{user_id}")
async def admin_update_user(
    user_id: str,
    name: Optional[str] = Body(None),
    role: Optional[str] = Body(None),
    membershipLevel: Optional[str] = Body(None),
    is_active: Optional[bool] = Body(None),
    current_admin: dict = Depends(get_current_admin_user)
):
    """Admin updates a user"""
    update_data = {}
    if name is not None:
        update_data["name"] = name
    if role is not None:
        update_data["role"] = role
    if membershipLevel is not None:
        update_data["membershipLevel"] = membershipLevel
    if is_active is not None:
        update_data["is_active"] = is_active
    
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.auth_users.update_one({"id": user_id}, {"$set": update_data})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "User updated"}


@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(
    user_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Admin deletes a user"""
    # Prevent admin from deleting themselves
    if current_admin["id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    result = await db.auth_users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "User deleted"}


@api_router.post("/admin/users/{user_id}/reset-password")
async def admin_reset_user_password(
    user_id: str,
    new_password: str = Body(..., embed=True),
    current_admin: dict = Depends(get_current_admin_user)
):
    """Admin resets a user's password"""
    result = await db.auth_users.update_one(
        {"id": user_id},
        {"$set": {
            "hashed_password": get_password_hash(new_password),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "Password reset successfully"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# Square Payment Endpoints
@api_router.get("/payments/config")
async def get_payment_config():
    """Return Square configuration for frontend (public keys only)"""
    return {
        "applicationId": os.environ.get('SQUARE_APPLICATION_ID', ''),
        "locationId": os.environ.get('SQUARE_LOCATION_ID', ''),
        "environment": os.environ.get('SQUARE_ENVIRONMENT', 'sandbox')
    }


@api_router.post("/payments/process", response_model=PaymentResponse)
async def process_payment(payment_request: PaymentRequest):
    """Process a payment using Square Payments API"""
    try:
        # Generate idempotency key
        idempotency_key = str(uuid.uuid4())
        
        # Create order in database first
        order_id = str(uuid.uuid4())
        order_doc = {
            "id": order_id,
            "items": [item.model_dump() for item in payment_request.items],
            "total_amount": payment_request.amount,
            "currency": payment_request.currency,
            "payment_type": payment_request.paymentType,
            "customer_email": payment_request.customerEmail,
            "customer_name": payment_request.customerName,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.orders.insert_one(order_doc)
        
        # Process payment with Square
        result = square_client.payments.create(
            source_id=payment_request.sourceId,
            idempotency_key=idempotency_key,
            amount_money={
                "amount": payment_request.amount,
                "currency": payment_request.currency
            },
            location_id=os.environ.get('SQUARE_LOCATION_ID', ''),
            reference_id=order_id,
            note=f"Payment for {payment_request.paymentType}"
        )
        
        if result.payment:
            # Update order with payment info
            await db.orders.update_one(
                {"id": order_id},
                {
                    "$set": {
                        "square_payment_id": result.payment.id,
                        "status": result.payment.status.lower() if result.payment.status else "completed",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Store payment record
            payment_doc = {
                "id": str(uuid.uuid4()),
                "order_id": order_id,
                "square_payment_id": result.payment.id,
                "amount": payment_request.amount,
                "currency": payment_request.currency,
                "status": result.payment.status if result.payment.status else "COMPLETED",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.payments.insert_one(payment_doc)
            
            # Send payment receipt email
            if payment_request.customerEmail:
                try:
                    await send_payment_receipt(
                        customer_email=payment_request.customerEmail,
                        customer_name=payment_request.customerName or "Valued Customer",
                        order_id=order_id,
                        amount=payment_request.amount / 100,  # Convert cents to dollars
                        items=payment_request.items,
                        payment_type=payment_request.paymentType
                    )
                except Exception as email_error:
                    logger.error(f"Failed to send receipt email: {str(email_error)}")
                    # Don't fail the payment if email fails
            
            return PaymentResponse(
                success=True,
                paymentId=result.payment.id,
                orderId=order_id,
                message="Payment processed successfully"
            )
        
        elif result.errors:
            # Update order status to failed
            await db.orders.update_one(
                {"id": order_id},
                {"$set": {"status": "failed"}}
            )
            error_detail = result.errors[0].detail if result.errors else "Payment processing failed"
            raise HTTPException(status_code=400, detail=error_detail)
        
        else:
            raise HTTPException(status_code=500, detail="Unexpected response from payment processor")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Payment processing error: {str(e)}")


@api_router.get("/payments/order/{order_id}")
async def get_order(order_id: str):
    """Get order details by ID"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@api_router.get("/payments/history")
async def get_payment_history(customer_email: Optional[str] = None):
    """Get payment history, optionally filtered by customer email"""
    query = {}
    if customer_email:
        query["customer_email"] = customer_email
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders


# Email Helper Functions
async def send_payment_receipt(customer_email: str, customer_name: str, order_id: str, amount: float, items: List[PaymentItem], payment_type: str):
    """Send a payment receipt email to the customer"""
    
    # Build items HTML
    items_html = ""
    for item in items:
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price / 100:.2f}</td>
        </tr>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f5ff;">
        <div style="background: linear-gradient(135deg, #a78bfa 0%, #f0abfc 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">{BUSINESS_NAME}</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Payment Receipt</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px;">Dear {customer_name},</p>
            
            <p style="color: #666;">Thank you for your {payment_type} payment. Here are your receipt details:</p>
            
            <div style="background: #f9f5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> {order_id}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> {datetime.now().strftime('%B %d, %Y')}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #a78bfa; color: white;">
                        <th style="padding: 12px; text-align: left;">Item</th>
                        <th style="padding: 12px; text-align: center;">Qty</th>
                        <th style="padding: 12px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
                <tfoot>
                    <tr style="background: #f0abfc;">
                        <td colspan="2" style="padding: 12px; font-weight: bold;">Total Paid</td>
                        <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">${amount:.2f}</td>
                    </tr>
                </tfoot>
            </table>
            
            <p style="color: #666; margin-top: 30px;">If you have any questions about your purchase, please don't hesitate to contact us.</p>
            
            <p style="color: #666;">With gratitude,<br><strong>{BUSINESS_NAME}</strong></p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
                Suffolk County, New York<br>
                Mothernaturalcontact@gmail.com
            </p>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [customer_email],
        "subject": f"Payment Receipt - {BUSINESS_NAME}",
        "html": html_content
    }
    
    await asyncio.to_thread(resend.Emails.send, params)


# Email API Endpoints
@api_router.post("/email/send")
async def send_single_email(request: EmailRequest):
    """Send a single email to a recipient"""
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [request.recipient_email],
            "subject": request.subject,
            "html": request.html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        
        # Log email to database
        email_log = {
            "id": str(uuid.uuid4()),
            "recipient": request.recipient_email,
            "subject": request.subject,
            "type": "personal",
            "status": "sent",
            "sent_at": datetime.now(timezone.utc).isoformat()
        }
        await db.email_logs.insert_one(email_log)
        
        return {
            "success": True,
            "message": f"Email sent to {request.recipient_email}",
            "email_id": result.get("id") if isinstance(result, dict) else str(result)
        }
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


@api_router.post("/email/bulk")
async def send_bulk_email(request: BulkEmailRequest):
    """Send bulk emails to multiple recipients"""
    try:
        sent_count = 0
        failed_count = 0
        
        for email in request.recipient_emails:
            try:
                params = {
                    "from": SENDER_EMAIL,
                    "to": [email],
                    "subject": request.subject,
                    "html": request.html_content
                }
                
                await asyncio.to_thread(resend.Emails.send, params)
                sent_count += 1
                
            except Exception as e:
                logger.error(f"Failed to send to {email}: {str(e)}")
                failed_count += 1
        
        # Log bulk email
        email_log = {
            "id": str(uuid.uuid4()),
            "recipient_count": len(request.recipient_emails),
            "sent_count": sent_count,
            "failed_count": failed_count,
            "subject": request.subject,
            "type": "bulk",
            "status": "completed",
            "sent_at": datetime.now(timezone.utc).isoformat()
        }
        await db.email_logs.insert_one(email_log)
        
        return {
            "success": True,
            "message": f"Bulk email completed: {sent_count} sent, {failed_count} failed",
            "sent_count": sent_count,
            "failed_count": failed_count
        }
    except Exception as e:
        logger.error(f"Bulk email failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk email failed: {str(e)}")


@api_router.get("/email/logs")
async def get_email_logs():
    """Get email sending history"""
    logs = await db.email_logs.find({}, {"_id": 0}).sort("sent_at", -1).to_list(100)
    return logs


@api_router.post("/users/sync")
async def sync_users(users: List[UserModel]):
    """Sync users from frontend localStorage to backend"""
    try:
        for user in users:
            # Upsert user
            await db.users.update_one(
                {"email": user.email},
                {"$set": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "joinedDate": user.joinedDate,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
        
        return {"success": True, "message": f"Synced {len(users)} users"}
    except Exception as e:
        logger.error(f"User sync failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User sync failed: {str(e)}")


@api_router.get("/users")
async def get_all_users():
    """Get all registered users"""
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users


# ===============================
# DATABASE CRUD API ENDPOINTS
# ===============================

# Product Models
class ProductVariant(BaseModel):
    name: str
    price: float

class ProductModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    name: str
    price: float  # Base price (used when no variants)
    category: str = ""
    description: str = ""
    sizes: List[dict] = []  # List of {name: str, price: float}
    flavors: List[str] = []
    image: str = ""
    stock: int = 0
    inStock: bool = True
    rating: float = 4.5
    isHidden: bool = False  # Hidden from customers until ready

# Service Models
class ServiceModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    name: str
    duration: str
    price: float
    description: str = ""
    paymentType: str = "full"
    deposit: float = 0
    image: str = ""
    isHidden: bool = False  # Hidden from customers until ready

# Class Models
class ClassModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    name: str
    instructor: str = ""
    description: str = ""
    duration: str = ""
    sessions: int = 0
    price: float
    schedule: str = ""
    spots: int = 10
    level: str = "All Levels"
    image: str = ""
    # New fields for enhanced class management
    startDate: str = ""  # Class start date
    endDate: str = ""  # Class end date (optional)
    classDays: List[str] = []  # Days the class meets (e.g., ["Monday", "Wednesday", "Friday"])
    classTime: str = ""  # Time the class meets (e.g., "6:30 PM")
    paymentType: str = "full"  # "full" = pay upfront, "perSession" = pay per session
    packageDeals: List[dict] = []  # Package deals [{sessions: 4, price: 80, name: "4-Class Pack"}]
    dropInPrice: float = 0  # Price for single drop-in class
    isHidden: bool = False  # Hidden from customers until ready
    addOns: List[dict] = []  # Add-ons [{name: str, price: float, description: str}]

# Retreat Models
class RetreatModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    name: str
    location: str
    duration: str = ""
    dates: str
    price: float
    description: str = ""
    capacity: int = 20
    spotsLeft: int = 20
    image: str = ""
    includes: List[str] = []
    isHidden: bool = False  # Hidden from customers until ready
    addOns: List[dict] = []  # Add-ons [{name: str, price: float, description: str}]

# Fundraiser Models
class FundraiserModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    title: str
    beneficiary: str
    story: str = ""
    goalAmount: float
    raisedAmount: float = 0
    image: str = ""
    createdDate: str = ""
    endDate: str = ""
    status: str = "pending"
    contributors: int = 0
    applicantId: str = ""
    applicantName: str = ""
    applicantEmail: str = ""
    isHidden: bool = False  # Hidden from customers until ready

# Appointment Models
class AppointmentModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    clientName: str = ""
    clientEmail: str = ""
    serviceName: str
    serviceId: str = ""
    date: str
    time: str
    status: str = "pending"
    paymentStatus: str = "pending"
    totalAmount: float = 0


# ============= PRODUCTS API =============
@api_router.get("/products")
async def get_products(include_hidden: bool = False):
    """Get all products (hidden items excluded by default for public)"""
    query = {} if include_hidden else {"$or": [{"isHidden": False}, {"isHidden": {"$exists": False}}]}
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.post("/products")
async def create_product(product: ProductModel):
    """Create a new product"""
    product_dict = product.model_dump()
    product_dict["id"] = str(uuid.uuid4()) if not product_dict.get("id") else product_dict["id"]
    product_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(product_dict)
    # Return without _id
    response_product = {k: v for k, v in product_dict.items() if k != "_id"}
    return {"success": True, "id": product_dict["id"], "product": response_product}

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductModel):
    """Update a product"""
    product_dict = product.model_dump()
    # Remove id field to prevent overwriting
    product_dict.pop("id", None)
    product_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.products.update_one({"id": product_id}, {"$set": product_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "message": "Product updated"}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "message": "Product deleted"}


# ============= SERVICES API =============
@api_router.get("/services")
async def get_services(include_hidden: bool = False):
    """Get all services (hidden items excluded by default for public)"""
    query = {} if include_hidden else {"$or": [{"isHidden": False}, {"isHidden": {"$exists": False}}]}
    services = await db.services.find(query, {"_id": 0}).to_list(1000)
    return services

@api_router.post("/services")
async def create_service(service: ServiceModel):
    """Create a new service"""
    service_dict = service.model_dump()
    service_dict["id"] = str(uuid.uuid4()) if not service_dict.get("id") else service_dict["id"]
    service_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.services.insert_one(service_dict)
    return {"success": True, "id": service_dict["id"], "service": {k: v for k, v in service_dict.items() if k != "_id"}}

@api_router.put("/services/{service_id}")
async def update_service(service_id: str, service: ServiceModel):
    """Update a service"""
    service_dict = service.model_dump()
    # Remove id field to prevent overwriting
    service_dict.pop("id", None)
    service_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.services.update_one({"id": service_id}, {"$set": service_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"success": True, "message": "Service updated"}

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str):
    """Delete a service"""
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"success": True, "message": "Service deleted"}


# ============= CLASSES API =============
@api_router.get("/classes")
async def get_classes(include_hidden: bool = False):
    """Get all classes (hidden items excluded by default for public)"""
    query = {} if include_hidden else {"$or": [{"isHidden": False}, {"isHidden": {"$exists": False}}]}
    classes = await db.classes.find(query, {"_id": 0}).to_list(1000)
    return classes

@api_router.post("/classes")
async def create_class(class_item: ClassModel):
    """Create a new class"""
    class_dict = class_item.model_dump()
    class_dict["id"] = str(uuid.uuid4()) if not class_dict.get("id") else class_dict["id"]
    class_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.classes.insert_one(class_dict)
    return {"success": True, "id": class_dict["id"], "class": {k: v for k, v in class_dict.items() if k != "_id"}}

@api_router.put("/classes/{class_id}")
async def update_class(class_id: str, class_item: ClassModel):
    """Update a class"""
    class_dict = class_item.model_dump()
    # Remove id field to prevent overwriting
    class_dict.pop("id", None)
    class_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.classes.update_one({"id": class_id}, {"$set": class_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"success": True, "message": "Class updated"}

@api_router.delete("/classes/{class_id}")
async def delete_class(class_id: str):
    """Delete a class"""
    result = await db.classes.delete_one({"id": class_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"success": True, "message": "Class deleted"}


# ============= RETREATS API =============
@api_router.get("/retreats")
async def get_retreats(include_hidden: bool = False):
    """Get all retreats (hidden items excluded by default for public)"""
    query = {} if include_hidden else {"$or": [{"isHidden": False}, {"isHidden": {"$exists": False}}]}
    retreats = await db.retreats.find(query, {"_id": 0}).to_list(1000)
    return retreats

@api_router.post("/retreats")
async def create_retreat(retreat: RetreatModel):
    """Create a new retreat"""
    retreat_dict = retreat.model_dump()
    retreat_dict["id"] = str(uuid.uuid4()) if not retreat_dict.get("id") else retreat_dict["id"]
    retreat_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    # Add default payment options
    price = retreat_dict["price"]
    retreat_dict["paymentOptions"] = [
        {"id": "full", "label": "Pay in Full", "amount": price, "description": "One-time payment"},
        {"id": "deposit", "label": "Deposit", "amount": price * 0.3, "description": "Pay 30% now, rest later"},
        {"id": "50-50", "label": "50/50 Split", "amount": price / 2, "description": "Pay half now, half later"}
    ]
    await db.retreats.insert_one(retreat_dict)
    return {"success": True, "id": retreat_dict["id"], "retreat": {k: v for k, v in retreat_dict.items() if k != "_id"}}

@api_router.put("/retreats/{retreat_id}")
async def update_retreat(retreat_id: str, retreat: RetreatModel):
    """Update a retreat"""
    retreat_dict = retreat.model_dump()
    # Remove id field to prevent overwriting
    retreat_dict.pop("id", None)
    retreat_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    # Update payment options with new price
    price = retreat_dict["price"]
    retreat_dict["paymentOptions"] = [
        {"id": "full", "label": "Pay in Full", "amount": price, "description": "One-time payment"},
        {"id": "deposit", "label": "Deposit", "amount": price * 0.3, "description": "Pay 30% now, rest later"},
        {"id": "50-50", "label": "50/50 Split", "amount": price / 2, "description": "Pay half now, half later"}
    ]
    result = await db.retreats.update_one({"id": retreat_id}, {"$set": retreat_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Retreat not found")
    return {"success": True, "message": "Retreat updated"}

@api_router.delete("/retreats/{retreat_id}")
async def delete_retreat(retreat_id: str):
    """Delete a retreat"""
    result = await db.retreats.delete_one({"id": retreat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Retreat not found")
    return {"success": True, "message": "Retreat deleted"}


# ============= FUNDRAISERS API =============
@api_router.get("/fundraisers")
async def get_fundraisers(include_hidden: bool = False):
    """Get all fundraisers (hidden items excluded by default for public)"""
    query = {} if include_hidden else {"$or": [{"isHidden": False}, {"isHidden": {"$exists": False}}]}
    fundraisers = await db.fundraisers.find(query, {"_id": 0}).to_list(1000)
    return fundraisers

@api_router.get("/fundraisers/active")
async def get_active_fundraisers():
    """Get only active fundraisers (for public view)"""
    fundraisers = await db.fundraisers.find({
        "status": "active",
        "$or": [{"isHidden": False}, {"isHidden": {"$exists": False}}]
    }, {"_id": 0}).to_list(1000)
    return fundraisers

@api_router.post("/fundraisers")
async def create_fundraiser(fundraiser: FundraiserModel):
    """Create a new fundraiser (admin creates as active, user creates as pending)"""
    fundraiser_dict = fundraiser.model_dump()
    fundraiser_dict["id"] = str(uuid.uuid4()) if not fundraiser_dict.get("id") else fundraiser_dict["id"]
    fundraiser_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    if not fundraiser_dict.get("createdDate"):
        fundraiser_dict["createdDate"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    await db.fundraisers.insert_one(fundraiser_dict)
    return {"success": True, "id": fundraiser_dict["id"], "fundraiser": {k: v for k, v in fundraiser_dict.items() if k != "_id"}}

@api_router.put("/fundraisers/{fundraiser_id}")
async def update_fundraiser(fundraiser_id: str, fundraiser: FundraiserModel):
    """Update a fundraiser"""
    fundraiser_dict = fundraiser.model_dump()
    # Remove id field to prevent overwriting
    fundraiser_dict.pop("id", None)
    fundraiser_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.fundraisers.update_one({"id": fundraiser_id}, {"$set": fundraiser_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Fundraiser not found")
    return {"success": True, "message": "Fundraiser updated"}

@api_router.patch("/fundraisers/{fundraiser_id}/status")
async def update_fundraiser_status(fundraiser_id: str, status: str):
    """Update fundraiser status (approve/reject/close)"""
    result = await db.fundraisers.update_one(
        {"id": fundraiser_id}, 
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Fundraiser not found")
    return {"success": True, "message": f"Fundraiser status updated to {status}"}

@api_router.delete("/fundraisers/{fundraiser_id}")
async def delete_fundraiser(fundraiser_id: str):
    """Delete a fundraiser"""
    result = await db.fundraisers.delete_one({"id": fundraiser_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fundraiser not found")
    return {"success": True, "message": "Fundraiser deleted"}


# ============= APPOINTMENTS API =============
@api_router.get("/appointments")
async def get_appointments():
    """Get all appointments"""
    appointments = await db.appointments.find({}, {"_id": 0}).to_list(1000)
    return appointments

@api_router.post("/appointments")
async def create_appointment(appointment: AppointmentModel):
    """Create a new appointment"""
    appointment_dict = appointment.model_dump()
    appointment_dict["id"] = str(uuid.uuid4()) if not appointment_dict.get("id") else appointment_dict["id"]
    appointment_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.appointments.insert_one(appointment_dict)
    return {"success": True, "id": appointment_dict["id"], "appointment": {k: v for k, v in appointment_dict.items() if k != "_id"}}

@api_router.patch("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str):
    """Update appointment status"""
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"success": True, "message": f"Appointment status updated to {status}"}

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str):
    """Delete an appointment"""
    result = await db.appointments.delete_one({"id": appointment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"success": True, "message": "Appointment deleted"}


# ============= CATEGORIES API =============
@api_router.get("/categories")
async def get_categories():
    """Get all product categories"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return [cat.get("name") for cat in categories]

@api_router.post("/categories")
async def create_category(name: str):
    """Create a new category"""
    existing = await db.categories.find_one({"name": name})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    await db.categories.insert_one({"name": name, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"success": True, "message": f"Category '{name}' created"}

@api_router.delete("/categories/{name}")
async def delete_category(name: str):
    """Delete a category"""
    result = await db.categories.delete_one({"name": name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True, "message": f"Category '{name}' deleted"}


# ============= IMAGE UPLOAD API (GridFS) =============

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file and return its URL"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, GIF, WEBP")
    
    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size: 5MB")
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{file_ext}"
    
    # Store in GridFS
    await fs_bucket.upload_from_stream(
        filename,
        io.BytesIO(contents),
        metadata={
            "content_type": file.content_type,
            "original_filename": file.filename,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
    )
    
    # Return the URL to access the image
    image_url = f"/api/images/{filename}"
    
    return {
        "success": True,
        "filename": filename,
        "url": image_url,
        "size": len(contents),
        "content_type": file.content_type
    }


@api_router.get("/images/{filename}")
async def get_image(filename: str):
    """Retrieve an uploaded image"""
    try:
        grid_out = await fs_bucket.open_download_stream_by_name(filename)
        contents = await grid_out.read()
        content_type = grid_out.metadata.get("content_type", "image/jpeg") if grid_out.metadata else "image/jpeg"
        
        return StreamingResponse(
            io.BytesIO(contents),
            media_type=content_type,
            headers={"Cache-Control": "public, max-age=31536000"}
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Image not found")


@api_router.delete("/images/{filename}")
async def delete_image(filename: str):
    """Delete an uploaded image"""
    try:
        cursor = fs_bucket.find({"filename": filename})
        async for grid_out in cursor:
            await fs_bucket.delete(grid_out._id)
            return {"success": True, "message": "Image deleted"}
        raise HTTPException(status_code=404, detail="Image not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============= EMERGENCY REQUESTS API =============

class EmergencyRequestModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    name: str
    phone: str = ""
    email: str = ""
    crisisType: str
    urgency: str = "medium"
    description: str
    status: str = "pending"
    submittedAt: Optional[str] = None
    resolvedAt: Optional[str] = None


@api_router.get("/emergency-requests")
async def get_emergency_requests():
    """Get all emergency requests"""
    requests = await db.emergency_requests.find({}, {"_id": 0}).to_list(1000)
    return requests


@api_router.post("/emergency-requests")
async def create_emergency_request(request: EmergencyRequestModel):
    """Create a new emergency request"""
    request_dict = request.model_dump()
    request_dict["id"] = str(uuid.uuid4()) if not request_dict.get("id") else request_dict["id"]
    request_dict["submittedAt"] = datetime.now(timezone.utc).isoformat()
    request_dict["status"] = "pending"
    await db.emergency_requests.insert_one(request_dict)
    return {"success": True, "id": request_dict["id"], "request": {k: v for k, v in request_dict.items() if k != "_id"}}


@api_router.patch("/emergency-requests/{request_id}/resolve")
async def resolve_emergency_request(request_id: str):
    """Mark an emergency request as resolved"""
    result = await db.emergency_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "resolved",
            "resolvedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"success": True, "message": "Request marked as resolved"}


@api_router.delete("/emergency-requests/{request_id}")
async def delete_emergency_request(request_id: str):
    """Delete an emergency request"""
    result = await db.emergency_requests.delete_one({"id": request_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"success": True, "message": "Request deleted"}


# ============= COMMUNITY POSTS API =============

class CommunityPostModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    authorId: str = ""
    authorName: str
    content: str
    image: str = ""
    likes: int = 0
    comments: List[dict] = []
    date: Optional[str] = None


@api_router.get("/community-posts")
async def get_community_posts():
    """Get all community posts"""
    posts = await db.community_posts.find({}, {"_id": 0}).sort("date", -1).to_list(1000)
    return posts


@api_router.post("/community-posts")
async def create_community_post(post: CommunityPostModel):
    """Create a new community post"""
    post_dict = post.model_dump()
    post_dict["id"] = str(uuid.uuid4()) if not post_dict.get("id") else post_dict["id"]
    post_dict["date"] = datetime.now(timezone.utc).isoformat()
    post_dict["likes"] = 0
    post_dict["comments"] = []
    await db.community_posts.insert_one(post_dict)
    return {"success": True, "id": post_dict["id"], "post": {k: v for k, v in post_dict.items() if k != "_id"}}


@api_router.post("/community-posts/{post_id}/like")
async def like_community_post(post_id: str):
    """Like a community post"""
    result = await db.community_posts.update_one(
        {"id": post_id},
        {"$inc": {"likes": 1}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True, "message": "Post liked"}


@api_router.post("/community-posts/{post_id}/comment")
async def add_comment_to_post(post_id: str, author: str = Body(...), content: str = Body(...)):
    """Add a comment to a community post"""
    comment = {
        "id": str(uuid.uuid4()),
        "author": author,
        "content": content,
        "date": datetime.now(timezone.utc).isoformat()
    }
    result = await db.community_posts.update_one(
        {"id": post_id},
        {"$push": {"comments": comment}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True, "comment": comment}


@api_router.delete("/community-posts/{post_id}")
async def delete_community_post(post_id: str):
    """Delete a community post"""
    result = await db.community_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True, "message": "Post deleted"}


# ============= CONTRACT TEMPLATES API =============

class ContractTemplateModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    type: str  # "appointment" or "retreat"
    content: str


@api_router.get("/contracts/templates")
async def get_contract_templates():
    """Get all contract templates"""
    templates = await db.contract_templates.find({}, {"_id": 0}).to_list(10)
    if not templates:
        # Return defaults if none exist
        return {
            "appointment": get_default_appointment_contract(),
            "retreat": get_default_retreat_contract()
        }
    return {t["type"]: t["content"] for t in templates}


@api_router.put("/contracts/templates/{template_type}")
async def update_contract_template(template_type: str, content: str = Body(..., embed=True)):
    """Update a contract template"""
    if template_type not in ["appointment", "retreat"]:
        raise HTTPException(status_code=400, detail="Invalid template type")
    
    await db.contract_templates.update_one(
        {"type": template_type},
        {"$set": {
            "type": template_type,
            "content": content,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"success": True, "message": f"{template_type} template updated"}


def get_default_appointment_contract():
    return """APPOINTMENT BOOKING AGREEMENT

This agreement is between Mother Natural: The Healing Lab and the client for appointment booking services.

1. CANCELLATION POLICY
- Cancellations must be made at least 24 hours in advance
- Cancellations made less than 24 hours before the scheduled appointment will result in a 50% charge
- No-shows will be charged the full appointment fee

2. RESCHEDULING
- Appointments may be rescheduled up to 24 hours in advance at no charge
- Late arrivals may result in shortened appointment time

3. PAYMENT TERMS
- Payment is due at the time of booking
- Accepted payment methods include credit/debit cards

4. HEALTH & WELLNESS
- Client agrees to disclose any relevant health conditions
- Services are complementary and not a substitute for medical care
- Client releases Mother Natural from liability for any adverse reactions

5. CONDUCT
- Client agrees to maintain respectful behavior during appointments
- Mother Natural reserves the right to refuse service

By signing below, you acknowledge that you have read, understood, and agree to these terms."""


def get_default_retreat_contract():
    return """RETREAT BOOKING AGREEMENT

This agreement is between Mother Natural: The Healing Lab and the client for retreat booking services.

1. CANCELLATION & REFUND POLICY
- Cancellations more than 60 days before retreat: Full refund minus $100 processing fee
- Cancellations 30-60 days before retreat: 50% refund
- Cancellations less than 30 days before retreat: No refund
- Deposits are non-refundable

2. PAYMENT TERMS
- Payment plans available as specified during booking
- Final payment must be received 30 days before retreat start date
- Failure to complete payment may result in forfeiture of booking

3. PARTICIPANT RESPONSIBILITIES
- Participants must be in reasonable health to participate
- Special dietary requirements must be communicated at least 14 days in advance
- Participants are responsible for their own travel arrangements and insurance

4. RETREAT POLICIES
- Participants agree to follow retreat schedule and guidelines
- Use of alcohol or illegal substances is prohibited
- Disruptive behavior may result in removal without refund

5. LIABILITY WAIVER
- Client acknowledges physical activities and releases Mother Natural from liability
- Client is responsible for their own health insurance
- Mother Natural is not liable for lost or stolen personal items

6. CHANGES TO RETREAT
- Mother Natural reserves the right to modify retreat schedule due to weather or circumstances
- In case of retreat cancellation by Mother Natural, full refund will be provided

By signing below, you acknowledge that you have read, understood, and agree to these terms."""


# ============= SIGNED CONTRACTS API =============

class SignedContractModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    contractType: str
    customerName: str
    customerEmail: str
    signatureData: str  # Base64 signature image
    bookingId: str = ""
    signedAt: Optional[str] = None


@api_router.get("/contracts/signed")
async def get_signed_contracts():
    """Get all signed contracts"""
    contracts = await db.signed_contracts.find({}, {"_id": 0}).sort("signedAt", -1).to_list(1000)
    return contracts


@api_router.post("/contracts/signed")
async def create_signed_contract(contract: SignedContractModel):
    """Store a signed contract"""
    contract_dict = contract.model_dump()
    contract_dict["id"] = str(uuid.uuid4()) if not contract_dict.get("id") else contract_dict["id"]
    contract_dict["signedAt"] = datetime.now(timezone.utc).isoformat()
    await db.signed_contracts.insert_one(contract_dict)
    return {"success": True, "id": contract_dict["id"]}


# ============= SETTINGS API =============

class TaxSettingsModel(BaseModel):
    taxEnabled: bool = True
    taxRate: float = 0.08  # 8% default
    taxLabel: str = "Sales Tax"

@api_router.get("/settings/tax")
async def get_tax_settings():
    """Get current tax settings"""
    settings = await db.settings.find_one({"type": "tax"}, {"_id": 0})
    if not settings:
        # Return default settings from env or defaults
        return {
            "taxEnabled": os.environ.get("TAX_ENABLED", "true").lower() == "true",
            "taxRate": float(os.environ.get("TAX_RATE", "0.08")),
            "taxLabel": "Sales Tax"
        }
    return settings

@api_router.put("/settings/tax")
async def update_tax_settings(
    settings: TaxSettingsModel,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Update tax settings (admin only)"""
    settings_dict = settings.model_dump()
    settings_dict["type"] = "tax"
    settings_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    settings_dict["updated_by"] = current_admin["id"]
    
    await db.settings.update_one(
        {"type": "tax"},
        {"$set": settings_dict},
        upsert=True
    )
    
    return {"success": True, "message": "Tax settings updated", "settings": settings_dict}


# ============= ANALYTICS API =============

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics():
    """Get comprehensive dashboard analytics"""
    now = datetime.now(timezone.utc)
    thirty_days_ago = (now - timedelta(days=30)).isoformat()
    
    # Get counts
    products_count = await db.products.count_documents({})
    services_count = await db.services.count_documents({})
    classes_count = await db.classes.count_documents({})
    retreats_count = await db.retreats.count_documents({})
    users_count = await db.auth_users.count_documents({})
    orders_count = await db.orders.count_documents({})
    appointments_count = await db.appointments.count_documents({})
    fundraisers_count = await db.fundraisers.count_documents({})
    emergency_count = await db.emergency_requests.count_documents({"status": "pending"})
    
    # Get orders for revenue calculation
    orders = await db.orders.find({"status": {"$in": ["completed", "pending"]}}, {"_id": 0}).to_list(10000)
    
    total_revenue = sum(o.get("total_amount", 0) for o in orders) / 100  # Convert cents to dollars
    
    # Recent orders (last 30 days)
    recent_orders = [o for o in orders if o.get("created_at", "") >= thirty_days_ago]
    monthly_revenue = sum(o.get("total_amount", 0) for o in recent_orders) / 100
    
    # Get new users in last 30 days
    new_users = await db.auth_users.count_documents({"created_at": {"$gte": thirty_days_ago}})
    
    # Get appointments by status
    pending_appointments = await db.appointments.count_documents({"status": "pending"})
    confirmed_appointments = await db.appointments.count_documents({"status": "confirmed"})
    
    # Get fundraiser stats
    active_fundraisers = await db.fundraisers.count_documents({"status": "active"})
    fundraisers = await db.fundraisers.find({"status": "active"}, {"_id": 0}).to_list(100)
    total_raised = sum(f.get("raisedAmount", 0) for f in fundraisers)
    total_goal = sum(f.get("goalAmount", 0) for f in fundraisers)
    
    return {
        "overview": {
            "totalRevenue": total_revenue,
            "monthlyRevenue": monthly_revenue,
            "totalOrders": orders_count,
            "totalUsers": users_count,
            "newUsersThisMonth": new_users
        },
        "inventory": {
            "products": products_count,
            "services": services_count,
            "classes": classes_count,
            "retreats": retreats_count
        },
        "appointments": {
            "total": appointments_count,
            "pending": pending_appointments,
            "confirmed": confirmed_appointments
        },
        "fundraisers": {
            "total": fundraisers_count,
            "active": active_fundraisers,
            "totalRaised": total_raised,
            "totalGoal": total_goal,
            "percentageRaised": round((total_raised / total_goal * 100) if total_goal > 0 else 0, 1)
        },
        "alerts": {
            "pendingEmergencies": emergency_count,
            "pendingAppointments": pending_appointments
        }
    }


@api_router.get("/analytics/revenue")
async def get_revenue_analytics():
    """Get detailed revenue analytics"""
    orders = await db.orders.find({"status": {"$in": ["completed", "pending"]}}, {"_id": 0}).to_list(10000)
    
    # Group by date
    daily_revenue = {}
    monthly_revenue = {}
    by_type = {"product": 0, "appointment": 0, "retreat": 0, "class": 0, "other": 0}
    
    for order in orders:
        amount = order.get("total_amount", 0) / 100
        created_at = order.get("created_at", "")
        payment_type = order.get("payment_type", "other")
        
        if created_at:
            date_str = created_at[:10]  # YYYY-MM-DD
            month_str = created_at[:7]  # YYYY-MM
            
            daily_revenue[date_str] = daily_revenue.get(date_str, 0) + amount
            monthly_revenue[month_str] = monthly_revenue.get(month_str, 0) + amount
        
        if payment_type in by_type:
            by_type[payment_type] += amount
        else:
            by_type["other"] += amount
    
    # Sort and format
    daily_data = [{"date": k, "revenue": v} for k, v in sorted(daily_revenue.items())[-30:]]
    monthly_data = [{"month": k, "revenue": v} for k, v in sorted(monthly_revenue.items())[-12:]]
    
    return {
        "daily": daily_data,
        "monthly": monthly_data,
        "byType": by_type,
        "totalRevenue": sum(by_type.values())
    }


@api_router.get("/analytics/products")
async def get_product_analytics():
    """Get product performance analytics"""
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    
    # Count product sales
    product_sales = {}
    for order in orders:
        for item in order.get("items", []):
            product_id = item.get("id", "")
            product_name = item.get("name", "Unknown")
            quantity = item.get("quantity", 1)
            price = item.get("price", 0) / 100
            
            if product_id not in product_sales:
                product_sales[product_id] = {"name": product_name, "quantity": 0, "revenue": 0}
            product_sales[product_id]["quantity"] += quantity
            product_sales[product_id]["revenue"] += price * quantity
    
    # Sort by revenue
    top_products = sorted(product_sales.values(), key=lambda x: x["revenue"], reverse=True)[:10]
    
    # Category breakdown
    category_stats = {}
    for product in products:
        category = product.get("category", "uncategorized")
        if category not in category_stats:
            category_stats[category] = {"count": 0, "totalValue": 0}
        category_stats[category]["count"] += 1
        category_stats[category]["totalValue"] += product.get("price", 0)
    
    return {
        "totalProducts": len(products),
        "topSellingProducts": top_products,
        "categoryBreakdown": [{"category": k, **v} for k, v in category_stats.items()]
    }


@api_router.get("/analytics/users")
async def get_user_analytics():
    """Get user growth analytics"""
    users = await db.auth_users.find({}, {"_id": 0, "hashed_password": 0}).to_list(10000)
    
    # Group by registration date
    daily_signups = {}
    monthly_signups = {}
    role_breakdown = {"admin": 0, "user": 0}
    membership_breakdown = {}
    
    for user in users:
        created_at = user.get("created_at", user.get("joinedDate", ""))
        role = user.get("role", "user")
        membership = user.get("membershipLevel", "basic")
        
        if created_at:
            date_str = created_at[:10]
            month_str = created_at[:7]
            daily_signups[date_str] = daily_signups.get(date_str, 0) + 1
            monthly_signups[month_str] = monthly_signups.get(month_str, 0) + 1
        
        role_breakdown[role] = role_breakdown.get(role, 0) + 1
        membership_breakdown[membership] = membership_breakdown.get(membership, 0) + 1
    
    # Format data
    daily_data = [{"date": k, "signups": v} for k, v in sorted(daily_signups.items())[-30:]]
    monthly_data = [{"month": k, "signups": v} for k, v in sorted(monthly_signups.items())[-12:]]
    
    return {
        "totalUsers": len(users),
        "dailySignups": daily_data,
        "monthlySignups": monthly_data,
        "roleBreakdown": role_breakdown,
        "membershipBreakdown": membership_breakdown
    }


@api_router.get("/analytics/appointments")
async def get_appointment_analytics():
    """Get appointment analytics"""
    appointments = await db.appointments.find({}, {"_id": 0}).to_list(10000)
    services = await db.services.find({}, {"_id": 0}).to_list(100)
    
    # Status breakdown
    status_breakdown = {"pending": 0, "confirmed": 0, "denied": 0, "completed": 0}
    service_popularity = {}
    daily_appointments = {}
    
    for apt in appointments:
        status = apt.get("status", "pending")
        service_name = apt.get("serviceName", "Unknown")
        date = apt.get("date", "")
        
        status_breakdown[status] = status_breakdown.get(status, 0) + 1
        service_popularity[service_name] = service_popularity.get(service_name, 0) + 1
        
        if date:
            daily_appointments[date] = daily_appointments.get(date, 0) + 1
    
    # Sort by popularity
    popular_services = sorted(service_popularity.items(), key=lambda x: x[1], reverse=True)[:5]
    daily_data = [{"date": k, "count": v} for k, v in sorted(daily_appointments.items())[-30:]]
    
    return {
        "totalAppointments": len(appointments),
        "statusBreakdown": status_breakdown,
        "popularServices": [{"name": k, "count": v} for k, v in popular_services],
        "dailyAppointments": daily_data,
        "totalServices": len(services)
    }


@api_router.get("/analytics/classes")
async def get_class_analytics():
    """Get class enrollment analytics"""
    classes = await db.classes.find({}, {"_id": 0}).to_list(100)
    
    # Calculate enrollment stats
    total_spots = sum(c.get("spots", 0) for c in classes)
    level_breakdown = {}
    
    for cls in classes:
        level = cls.get("level", "All Levels")
        level_breakdown[level] = level_breakdown.get(level, 0) + 1
    
    return {
        "totalClasses": len(classes),
        "totalSpots": total_spots,
        "levelBreakdown": level_breakdown,
        "classes": [{
            "name": c.get("name"),
            "instructor": c.get("instructor"),
            "spots": c.get("spots", 0),
            "price": c.get("price", 0)
        } for c in classes]
    }


@api_router.get("/analytics/retreats")
async def get_retreat_analytics():
    """Get retreat booking analytics"""
    retreats = await db.retreats.find({}, {"_id": 0}).to_list(100)
    
    total_capacity = sum(r.get("capacity", 0) for r in retreats)
    total_spots_left = sum(r.get("spotsLeft", r.get("capacity", 0)) for r in retreats)
    total_booked = total_capacity - total_spots_left
    
    return {
        "totalRetreats": len(retreats),
        "totalCapacity": total_capacity,
        "totalBooked": total_booked,
        "spotsRemaining": total_spots_left,
        "occupancyRate": round((total_booked / total_capacity * 100) if total_capacity > 0 else 0, 1),
        "retreats": [{
            "name": r.get("name"),
            "location": r.get("location"),
            "dates": r.get("dates"),
            "capacity": r.get("capacity", 0),
            "spotsLeft": r.get("spotsLeft", r.get("capacity", 0)),
            "price": r.get("price", 0)
        } for r in retreats]
    }


@api_router.get("/analytics/fundraisers")
async def get_fundraiser_analytics():
    """Get fundraiser analytics"""
    fundraisers = await db.fundraisers.find({}, {"_id": 0}).to_list(100)
    
    status_breakdown = {"active": 0, "pending": 0, "closed": 0, "rejected": 0}
    total_raised = 0
    total_goal = 0
    total_contributors = 0
    
    for f in fundraisers:
        status = f.get("status", "pending")
        status_breakdown[status] = status_breakdown.get(status, 0) + 1
        total_raised += f.get("raisedAmount", 0)
        total_goal += f.get("goalAmount", 0)
        total_contributors += f.get("contributors", 0)
    
    return {
        "totalFundraisers": len(fundraisers),
        "statusBreakdown": status_breakdown,
        "totalRaised": total_raised,
        "totalGoal": total_goal,
        "percentageRaised": round((total_raised / total_goal * 100) if total_goal > 0 else 0, 1),
        "totalContributors": total_contributors,
        "fundraisers": [{
            "title": f.get("title"),
            "beneficiary": f.get("beneficiary"),
            "goalAmount": f.get("goalAmount", 0),
            "raisedAmount": f.get("raisedAmount", 0),
            "status": f.get("status"),
            "contributors": f.get("contributors", 0)
        } for f in fundraisers]
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()