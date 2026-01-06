from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from square import Square
from square.environment import SquareEnvironment
import resend


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Square client initialization
square_client = Square(
    token=os.environ.get('SQUARE_ACCESS_TOKEN', ''),
    environment=SquareEnvironment.SANDBOX if os.environ.get('SQUARE_ENVIRONMENT', 'sandbox') == 'sandbox' else SquareEnvironment.PRODUCTION
)

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
BUSINESS_NAME = os.environ.get('BUSINESS_NAME', 'Mother Natural: The Healing Lab')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


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

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

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