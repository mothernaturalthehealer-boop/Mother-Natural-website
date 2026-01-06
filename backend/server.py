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