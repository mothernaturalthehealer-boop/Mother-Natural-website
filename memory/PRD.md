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
- Admin Panel for business management with analytics

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, shadcn/ui
- **Backend**: Python FastAPI, MongoDB (via motor)
- **File Storage**: MongoDB GridFS for image uploads
- **Payments**: Square API (Production)
- **Email**: Resend API (sender: contact@mothernaturalhealinglab.com)
- **Authentication**: JWT (python-jose, passlib[bcrypt])

## Admin Credentials
- **Email**: admin@mothernatural.com
- **Password**: Aniyah13

---

## CHANGELOG - What's Been Implemented

### January 11, 2025 - Major Release

#### JWT Authentication System ✅
- User registration (public) and admin user creation
- Login with JWT tokens (24-hour expiration)
- Role-based access control (user/admin)
- Password change and profile update
- Default admin user auto-created on startup

#### Complete Database Migration ✅
- All admin components migrated from localStorage to MongoDB
- User Management - loads from /api/admin/users
- Appointments - loads from /api/appointments
- Orders - loads from /api/orders
- Emergency Requests - loads from /api/emergency-requests
- Community Posts - loads from /api/community-posts
- Contract Templates - loads from /api/contracts/templates
- Signed Contracts - loads from /api/contracts/signed

#### Image Upload (GridFS) ✅
- File-based image upload to MongoDB GridFS
- Support for JPEG, PNG, GIF, WebP (max 5MB)
- ImageUpload component with URL input + file upload button
- Image preview and deletion
- API endpoints: POST /api/upload/image, GET /api/images/{filename}

#### Advanced Analytics Dashboard ✅
- Overview stats: Total Revenue, Users, Orders, Appointments
- Revenue analytics: Daily/Monthly trends, breakdown by type
- Product analytics: Top sellers, category breakdown
- User analytics: Signups, role/membership breakdown
- Appointment analytics: Status breakdown, popular services
- Class analytics: Total spots, level breakdown
- Retreat analytics: Capacity utilization, booking stats
- Fundraiser analytics: Raised vs goal, contributor stats
- Alert section for pending emergencies/appointments

#### Email Configuration ✅
- Sender email updated to contact@mothernaturalhealinglab.com
- Payment receipts sent on successful transactions
- Bulk email to all users supported

### January 10, 2025
- Admin panel refactored (3181 lines → 11 modular components)
- Payment flow bug fixed
- Product variants (sizes/flavors) implemented
- Fundraiser approval workflow added
- Database migration started

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Admin User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List all users |
| POST | /api/admin/users | Create user |
| PUT | /api/admin/users/{id} | Update user |
| DELETE | /api/admin/users/{id} | Delete user |

### Data APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT/DELETE | /api/products | Products CRUD |
| GET/POST/PUT/DELETE | /api/services | Services CRUD |
| GET/POST/PUT/DELETE | /api/classes | Classes CRUD |
| GET/POST/PUT/DELETE | /api/retreats | Retreats CRUD |
| GET/POST/DELETE | /api/fundraisers | Fundraisers CRUD |
| PATCH | /api/fundraisers/{id}/status | Approve/reject |
| GET/POST/PATCH/DELETE | /api/appointments | Appointments CRUD |
| GET/POST/DELETE | /api/emergency-requests | Emergency CRUD |
| PATCH | /api/emergency-requests/{id}/resolve | Mark resolved |
| GET/POST/DELETE | /api/community-posts | Community CRUD |
| POST | /api/community-posts/{id}/like | Like post |
| POST | /api/community-posts/{id}/comment | Add comment |

### Image Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload/image | Upload image to GridFS |
| GET | /api/images/{filename} | Retrieve image |
| DELETE | /api/images/{filename} | Delete image |

### Contract Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/contracts/templates | Get templates |
| PUT | /api/contracts/templates/{type} | Update template |
| GET | /api/contracts/signed | Get signed contracts |
| POST | /api/contracts/signed | Store signed contract |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/dashboard | Overview stats |
| GET | /api/analytics/revenue | Revenue breakdown |
| GET | /api/analytics/products | Product performance |
| GET | /api/analytics/users | User growth |
| GET | /api/analytics/appointments | Appointment stats |
| GET | /api/analytics/classes | Class enrollment |
| GET | /api/analytics/retreats | Retreat capacity |
| GET | /api/analytics/fundraisers | Fundraiser progress |

---

## File Structure

```
/app
├── backend/
│   ├── server.py          # FastAPI backend (~1800 lines)
│   ├── requirements.txt
│   ├── .env
│   └── tests/
│       ├── test_auth_api.py
│       └── test_new_features.py
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/           # 12 modular admin components
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
    │   │   │   ├── AnalyticsDashboard.js (NEW)
    │   │   │   └── index.js
    │   │   ├── ImageUpload.js (NEW)
    │   │   ├── ui/
    │   │   └── ...
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── hooks/
    │   │   └── useApi.js
    │   ├── pages/
    │   │   └── AdminPage.js
    │   └── App.js
    └── .env
```

---

## Testing Status
- ✅ JWT Authentication - 24/24 tests passed
- ✅ New Features - 27/27 tests passed
- ✅ Image Upload API
- ✅ Emergency Requests API
- ✅ Community Posts API
- ✅ Contract Templates API
- ✅ Analytics APIs (8 endpoints)
- ✅ Frontend Admin Panel

---

## Resend Domain Verification Guide

To send emails from `contact@mothernaturalhealinglab.com`:

1. **Log in to Resend Dashboard**: https://resend.com/domains
2. **Add Domain**: `mothernaturalhealinglab.com`
3. **Add DNS Records** to your domain registrar:
   - MX Record (for receiving)
   - TXT Record (SPF)
   - CNAME Records (DKIM)
4. **Verify**: Click "Verify DNS Configuration" in Resend
5. DNS propagation can take 24-48 hours

---

## Completed Features Summary

| Feature | Status |
|---------|--------|
| E-commerce Shop | ✅ Complete |
| Product Variants (sizes/flavors) | ✅ Complete |
| Appointment Booking | ✅ Complete |
| Contract Signing | ✅ Complete |
| Wellness Classes | ✅ Complete |
| Retreat Booking | ✅ Complete |
| Community Platform | ✅ Complete |
| Fundraiser System | ✅ Complete |
| Crisis Support | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| JWT Authentication | ✅ Complete |
| Database Migration | ✅ Complete |
| Image Upload (GridFS) | ✅ Complete |
| Analytics Dashboard | ✅ Complete |
| Email Integration | ✅ Complete |
| Square Payments | ✅ Complete |

---

## Ready for Production Deployment! 🚀
