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
- ✅ User authentication
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

**Frontend updated:**
- ProductManagement now uses database API
- ShopPage now loads from database (with localStorage fallback)

### Phase 7: Email Testing (Completed - Jan 10, 2025)
- ✅ Verified Resend API integration
- ✅ Test email sent successfully to mothernaturalcontact@gmail.com
- ✅ Email ID: 0b75deff-63cd-44d2-aa23-801718a5d4a2

---

## Prioritized Backlog

### P0 - Critical (All Completed ✅)
- [x] Refactor AdminPage.js (technical debt)
- [x] Database migration (MongoDB API)
- [x] Test email functionality

### P1 - High Priority
- [ ] Update remaining admin components to use database API
- [ ] Add JWT authentication
- [ ] Payment receipt emails on successful purchases

### P2 - Medium Priority
- [ ] Verify custom domain on Resend
- [ ] Add image upload functionality (file-based instead of URL)

### P3 - Future/Backlog
- [ ] Native mobile app
- [ ] Advanced analytics dashboard

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | /api/products | Product listing and creation |
| PUT/DELETE | /api/products/{id} | Product update and deletion |
| GET/POST | /api/services | Service management |
| GET/POST | /api/classes | Class management |
| GET/POST | /api/retreats | Retreat management |
| GET/POST | /api/fundraisers | Fundraiser management |
| PATCH | /api/fundraisers/{id}/status | Approve/reject fundraisers |
| GET/POST | /api/appointments | Appointment management |
| GET/POST/DELETE | /api/categories | Category management |
| POST | /api/email/send | Send single email |
| POST | /api/email/bulk | Send bulk email |
| GET/POST | /api/payments/process | Square payment processing |

---

## File Structure (After Refactoring)
```
/app
├── backend/
│   ├── server.py          # FastAPI with all API endpoints (~900 lines)
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/            # NEW: Modular admin components
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
    │   ├── pages/
    │   │   ├── AdminPage.js      # Refactored to 300 lines!
    │   │   └── ...
    │   └── App.js
    └── .env
```

---

## Testing Status
- ✅ Admin Panel - All features tested
- ✅ Database API - All endpoints working
- ✅ Email sending - Verified with real email
- ✅ Shop page - Loading from database
- ✅ Payment flow - Verified working

---

## Notes
- Square is in **Production mode** - REAL charges
- Resend emails sent from onboarding@resend.dev (custom domain pending)
- Database is now persistent via MongoDB
- Frontend has fallback to localStorage if API fails
