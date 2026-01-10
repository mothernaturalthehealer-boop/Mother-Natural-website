# Mother Natural: The Healing Lab - Product Requirements Document

## Original Problem Statement
Build a comprehensive web application for a wellness business "Mother Natural: The Healing Lab" with:
- E-commerce shop with product variants (sizes, flavors)
- Appointment booking system with contract signing
- Wellness class enrollment
- Retreat booking with flexible payments
- Private social community
- Fundraiser section with admin approval workflow
- Crisis support feature
- Admin Panel for business management

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Square Payment Gateway (Production)
- **Email**: Resend API
- **Authentication**: JWT (python-jose, passlib)

## Admin Credentials
- **Email**: admin@mothernatural.com
- **Password**: Aniyah13
- **Test Email**: mothernaturalcontact@gmail.com

---

## What's Been Implemented

### Phase 1-4: Core Features (Completed - Jan 2025)
- ✅ Complete frontend application structure
- ✅ All public pages (Shop, Appointments, Classes, Retreats, Community, Fundraisers)
- ✅ Square payment integration (Production)
- ✅ Contract signing system
- ✅ Crisis support feature
- ✅ Shopping cart with variant support

### Phase 5: Admin Panel Refactoring (Completed - Jan 10, 2025)
**Before:** 3181 lines in one monolithic file
**After:** 300 lines main file + 11 modular components (~2100 lines total)

Components created:
- `ProductManagement.js` - Product CRUD with categories, sizes, flavors
- `ServiceManagement.js` - Service CRUD with edit dialog
- `ClassManagement.js` - Class CRUD with edit dialog  
- `RetreatManagement.js` - Retreat CRUD with edit dialog
- `FundraiserManagement.js` - Fundraiser management with approval workflow
- `UserManagement.js` - User list, personal & bulk email
- `AppointmentManagement.js` - Appointment approval/denial
- `OrderManagement.js` - Order viewing
- `EmergencyManagement.js` - Crisis request handling
- `CommunityManagement.js` - Post moderation
- `ContractManagement.js` - Contract template editing

### Phase 6: Database Migration (Completed - Jan 10, 2025)
**Migrated from localStorage to MongoDB**

API Endpoints created:
- `GET/POST/PUT/DELETE /api/products` - Product CRUD
- `GET/POST/PUT/DELETE /api/services` - Service CRUD
- `GET/POST/PUT/DELETE /api/classes` - Class CRUD
- `GET/POST/PUT/DELETE /api/retreats` - Retreat CRUD
- `GET/POST/PUT/DELETE /api/fundraisers` - Fundraiser CRUD + status updates
- `GET/POST/PATCH/DELETE /api/appointments` - Appointment management
- `GET/POST/DELETE /api/categories` - Category management

### Phase 7: JWT Authentication (Completed - Jan 11, 2025)
**Secure authentication system implemented**

New Auth Endpoints:
- `POST /api/auth/register` - Public user registration
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/token` - OAuth2 token endpoint
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)

Admin User Management:
- `POST /api/admin/users` - Admin creates users (admin only)
- `GET /api/admin/users` - List all users (admin only)
- `PUT /api/admin/users/{id}` - Update user (admin only)
- `DELETE /api/admin/users/{id}` - Delete user (admin only)
- `POST /api/admin/users/{id}/reset-password` - Reset password (admin only)

Features:
- JWT tokens with 24-hour expiration
- bcrypt password hashing
- Role-based access control (user/admin)
- Default admin user created on startup
- Frontend AuthContext with token storage
- Protected API endpoints

### Phase 8: Email Configuration (Completed - Jan 11, 2025)
- ✅ Sender email updated to contact@mothernaturalhealinglab.com
- ✅ Payment receipt emails sent automatically after successful payments
- ✅ Email templates with Mother Natural branding

---

## Prioritized Backlog

### P0 - Critical (All Completed ✅)
- [x] Refactor AdminPage.js (technical debt)
- [x] Database migration (MongoDB API)
- [x] JWT Authentication
- [x] Test email functionality

### P1 - High Priority (All Completed ✅)
- [x] Update admin components to use auth headers
- [x] Payment receipt emails on successful purchases
- [x] Fix CRUD update bug (id overwrite issue)

### P2 - Medium Priority
- [ ] Verify custom domain on Resend (see DNS instructions below)
- [ ] Migrate remaining localStorage components to database API:
  - [ ] UserManagement
  - [ ] AppointmentManagement  
  - [ ] OrderManagement
  - [ ] EmergencyManagement
  - [ ] CommunityManagement
  - [ ] ContractManagement

### P3 - Future/Backlog
- [ ] Native mobile app
- [ ] Advanced analytics dashboard
- [ ] Image upload (file-based instead of URL)

---

## Resend Domain Verification Guide

To send emails from `contact@mothernaturalhealinglab.com`, you need to verify your domain with Resend.

### Steps:
1. **Log in to Resend Dashboard** at https://resend.com/domains
2. **Add Domain**: Click "Add Domain" and enter `mothernaturalhealinglab.com`
3. **Add DNS Records**: Resend will provide DNS records to add:
   - **MX Record** (for receiving)
   - **TXT Record** (SPF for sending authorization)
   - **CNAME Records** (DKIM for email signing)
4. **Add Records to DNS Provider**: Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add these DNS records
5. **Verify**: Return to Resend and click "Verify DNS Configuration"
6. **Wait**: DNS propagation can take 24-48 hours

Once verified, emails will be sent from `contact@mothernaturalhealinglab.com` instead of `onboarding@resend.dev`.

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | User registration | Public |
| POST | /api/auth/login | User login | Public |
| GET | /api/auth/me | Get current user | Required |
| GET/POST | /api/products | Product listing/creation | GET:Public, POST:Recommended |
| PUT/DELETE | /api/products/{id} | Product update/deletion | Recommended |
| GET/POST | /api/services | Service management | GET:Public, POST:Recommended |
| GET/POST | /api/classes | Class management | GET:Public, POST:Recommended |
| GET/POST | /api/retreats | Retreat management | GET:Public, POST:Recommended |
| GET/POST | /api/fundraisers | Fundraiser management | GET:Public, POST:Recommended |
| PATCH | /api/fundraisers/{id}/status | Approve/reject fundraisers | Recommended |
| GET/POST | /api/appointments | Appointment management | GET:Public, POST:Recommended |
| POST | /api/email/send | Send single email | Recommended |
| POST | /api/email/bulk | Send bulk email | Recommended |
| GET/POST | /api/payments/process | Square payment processing | Public |
| GET | /api/admin/users | List all users | Admin Only |
| POST | /api/admin/users | Create user | Admin Only |

---

## File Structure

```
/app
├── backend/
│   ├── server.py          # FastAPI with all API endpoints (~1300 lines)
│   ├── requirements.txt
│   ├── .env
│   └── tests/
│       └── test_auth_api.py
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/            # Modular admin components
    │   │   │   ├── ProductManagement.js
    │   │   │   ├── ServiceManagement.js
    │   │   │   ├── ClassManagement.js
    │   │   │   ├── RetreatManagement.js
    │   │   │   ├── FundraiserManagement.js
    │   │   │   ├── UserManagement.js
    │   │   │   ├── AppointmentManagement.js
    │   │   │   ├── OrderManagement.js
    │   │   │   ├── EmergencyManagement.js
    │   │   │   ├── CommunityManagement.js
    │   │   │   ├── ContractManagement.js
    │   │   │   └── index.js
    │   │   ├── ui/               # shadcn components
    │   │   ├── PaymentForm.js
    │   │   └── ContractSigningDialog.js
    │   ├── context/
    │   │   └── AuthContext.js    # JWT auth state management
    │   ├── hooks/
    │   │   └── useApi.js         # Authenticated API helper
    │   ├── pages/
    │   │   ├── AdminPage.js      # Lean orchestrator (~300 lines)
    │   │   ├── AuthPages.js      # Login & Signup pages
    │   │   └── ...
    │   └── App.js
    └── .env
```

---

## Testing Status
- ✅ JWT Authentication - 24/24 tests passed
- ✅ Admin Panel - All features tested
- ✅ Database API - All endpoints working
- ✅ Email sending - Verified with real email
- ✅ Shop page - Loading from database
- ✅ Payment flow - Verified working
- ✅ CRUD Operations - Create, Update, Delete all working

---

## Notes
- Square is in **Production mode** - REAL charges
- Resend emails sent from contact@mothernaturalhealinglab.com (requires domain verification)
- Database is persistent via MongoDB
- Frontend has fallback to localStorage if API fails
- Default admin user created automatically on server startup
