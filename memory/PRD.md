# Mother Natural: The Healing Lab - Product Requirements Document

## Original Problem Statement
Build a comprehensive web application for a wellness business "Mother Natural: The Healing Lab" with the following core features:
- E-commerce shop for products (teas, tinctures, oils, books)
- Appointment booking system
- Wellness class enrollment
- Retreat booking with partial/installment payments
- Private social community platform
- Fundraiser section for admin-created campaigns
- Contract signing system with editable templates
- Emergency "Crisis Support" feature
- Comprehensive Admin Panel for business management

## User Personas
1. **Clients** - Users who browse products, book appointments, enroll in classes, book retreats, and participate in the community
2. **Admin (Business Owner)** - Manages all aspects of the platform including products, services, appointments, retreats, community moderation, and fundraisers

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, shadcn/ui components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (currently using localStorage for frontend prototype)
- **Payments**: Square Payment Gateway (Sandbox integrated)

## Admin Credentials
- **Email**: admin@mothernatural.com
- **Password**: Aniyah13

---

## What's Been Implemented

### Phase 1: Frontend Prototype (Completed - Jan 2025)
- ✅ Complete frontend application structure with all pages
- ✅ Design system with lavender, pink, turquoise color palette
- ✅ Homepage with hero section and services overview
- ✅ Shop page with product catalog and filtering
- ✅ Appointments page with service selection and booking
- ✅ Classes page (enrollment feature)
- ✅ Retreats page with payment options
- ✅ Community page (social platform)
- ✅ Fundraisers section with public view
- ✅ Contract signing system with editable templates
- ✅ Emergency Crisis Support feature
- ✅ User authentication (mocked with localStorage)
- ✅ Shopping cart functionality
- ✅ "Forgot Password" feature
- ✅ Mobile-responsive navigation

### Phase 2: Admin Panel Complete (Completed - Jan 5, 2025)
- ✅ Admin Dashboard with stat cards (clickable, navigate to tabs)
- ✅ Settings button - functional dialog with business name, contact info, notifications
- ✅ Products tab - view, add, edit, delete products
- ✅ Services tab - full CRUD (add/edit/delete with name, duration, price, description, payment type)
- ✅ Retreats tab - full CRUD (add/edit/delete with name, location, dates, price, capacity)
- ✅ Appointments tab - view appointments, approve/deny/delete actions
- ✅ Community tab - view and delete posts (moderation)
- ✅ Fundraisers tab - create and manage fundraisers
- ✅ Contracts tab - edit appointment and retreat contract templates
- ✅ Emergency tab - manage crisis support requests
- ✅ Users tab (placeholder for future)
- ✅ Admin login flow stable (no more white screen issues)

### Phase 3: Square Payment Integration (Completed - Jan 5, 2025)
- ✅ Square SDK installed and configured (**Production** environment)
- ✅ Backend payment processing endpoint (`/api/payments/process`)
- ✅ Payment configuration endpoint (`/api/payments/config`)
- ✅ Order tracking in MongoDB
- ✅ Payment history endpoint
- ✅ Frontend PaymentForm component with Square Web Payments SDK
- ✅ Cart checkout integrated with real payment processing
- ✅ **Appointments page** - Payment after contract signing (supports deposits)
- ✅ **Retreats page** - Payment with flexible options (full, deposit, installments)
- ✅ Payment success/error handling

**Square Credentials (Production - LIVE):**
- Application ID: sq0idp-cSBrwBmUGZTIuCQE5o2NHw
- Location ID: LBY9X82PXC15G
- Location Name: Mother Natural the Healer
- Environment: **Production** (real payments enabled)

---

## Prioritized Backlog

### P0 - Critical (Current)
- [x] ~~Test Square payment flow end-to-end~~
- [x] ~~Add payment integration to Appointments page~~
- [x] ~~Add payment integration to Retreats page (with installments)~~

### P1 - High Priority
- [ ] Migrate frontend localStorage to backend MongoDB APIs
- [ ] Implement real user authentication with JWT
- [ ] Add order confirmation emails
- [ ] Payment webhook handling for status updates

### P2 - Medium Priority
- [ ] Square Production credentials setup
- [ ] User registration flow improvements
- [ ] Class enrollment payment integration
- [ ] Payment receipts/invoices
- [ ] Order history in user dashboard

### P3 - Future/Backlog
- [ ] Native mobile app development
- [ ] Advanced analytics dashboard
- [ ] Loyalty/rewards program
- [ ] Email marketing integration
- [ ] Multi-location support

---

## API Endpoints

### Backend Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ | Health check |
| GET | /api/payments/config | Get Square public config |
| POST | /api/payments/process | Process a payment |
| GET | /api/payments/order/{id} | Get order by ID |
| GET | /api/payments/history | Get payment history |

---

## File Structure Reference
```
/app
├── backend/
│   ├── server.py          # FastAPI server with Square integration
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables (Square keys)
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/              # shadcn components
    │   │   ├── PaymentForm.js   # Square payment component
    │   │   ├── ContractSigningDialog.js
    │   │   ├── EmergencyCrisisDialog.js
    │   │   ├── Footer.js
    │   │   └── Navbar.js
    │   ├── context/
    │   │   ├── AuthContext.js   # Authentication state
    │   │   └── CartContext.js   # Shopping cart state
    │   ├── pages/
    │   │   ├── AdminPage.js     # Complete admin dashboard
    │   │   ├── AppointmentsPage.js
    │   │   ├── CartPage.js      # With Square checkout
    │   │   ├── RetreatsPage.js
    │   │   └── ... (other pages)
    │   └── App.js
    └── .env
```

---

## Testing Status
- ✅ Admin Panel - All features tested (100% pass rate)
- ✅ Square backend API - Config endpoint working
- ✅ Square payment flow - Production ready
- ✅ Appointment payments - Integrated with deposit support
- ✅ Retreat payments - Integrated with flexible payment plans

---

## Notes
- All current data persistence uses browser localStorage (except payments which use MongoDB)
- Square is in **Production mode** - REAL charges will be made to customer cards
- Payments deposit to your Square account linked to "Mother Natural the Healer"
