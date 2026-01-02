# Mother Natural: The Healing Lab

A comprehensive holistic wellness platform featuring e-commerce, booking systems, classes, retreats with flexible payment options, and a social community.

## 🌿 Features

### E-Commerce Shop
- Browse natural products (teas, tinctures, oils, books)
- Category filtering
- Shopping cart with quantity management
- Product ratings and reviews
- Mock checkout process

### Appointment Booking
- Book one-on-one healing sessions
- Calendar-based date selection
- Time slot availability
- Multiple service types (Energy Healing, Health Consultation, etc.)

### Wellness Classes
- Browse and enroll in wellness classes
- View instructor details and course information
- Track class progress
- Duration and session information

### Healing Retreats
- **Flexible Payment Options:**
  - Pay in Full
  - Deposit (partial payment upfront)
  - 50/50 Split Payment
  - 3-Month Installments
  - Custom payment plans per retreat
- Detailed retreat information with location and inclusions
- Capacity tracking with "spots remaining" alerts

### Community Platform
- Social feed for sharing experiences
- User posts with comments and likes
- Membership level badges (Basic, Silver, Gold)
- Topic hashtags

### User Dashboard
- View upcoming appointments
- Track enrolled classes with progress
- Manage booked retreats
- Order history

### Admin Panel
- Product management (add, edit, delete)
- Order tracking
- Appointment management
- User management
- **Admin Login:** Use `admin@example.com` as email to access

## 🎨 Design

The platform features a serene, calming design inspired by the brand logo:
- **Primary Color:** Soft lavender/periwinkle blue
- **Secondary:** Rose pink
- **Accent:** Turquoise/mint green
- **Typography:** Cormorant Garamond (headings), Inter (body)
- **Design Philosophy:** Minimalist, botanical, healing-focused

## 🚀 Getting Started

### Test Credentials

**Regular User:**
- Email: `test@example.com`
- Password: `password123`

**Admin User:**
- Email: `admin@example.com`
- Password: `password123`

## 📱 Pages

- `/` - Homepage with hero, services, featured products
- `/shop` - E-commerce product catalog
- `/appointments` - Booking system
- `/classes` - Wellness classes
- `/retreats` - Healing retreats with payment options
- `/community` - Social community feed
- `/cart` - Shopping cart
- `/login` - User authentication
- `/signup` - User registration
- `/dashboard` - User dashboard
- `/admin` - Admin panel (admin only)

## 🔧 Tech Stack

### Frontend
- **Framework:** React 19.2.3
- **Routing:** React Router v7
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Toast Notifications:** Sonner

### Backend (Prototype)
- **Framework:** FastAPI
- **Database:** MongoDB (mock data in frontend)

## 💡 Key Implementation Details

### Payment Flexibility
The platform supports multiple payment structures:
- Retreats can have unique payment plans
- Each retreat defines its own payment options
- Users choose their preferred payment method during booking

### Authentication
- Mock authentication using localStorage
- User roles: 'user' and 'admin'
- Protected routes redirect to login

### State Management
- **AuthContext:** User authentication state
- **CartContext:** Shopping cart state
- localStorage for persistence

## 📝 Notes

**This is a frontend prototype with MOCK functionality:**
- Backend API calls are simulated
- Payments are not processed (demonstration only)
- Data is stored in browser localStorage
- Database operations are mocked
- Fully functional admin panel for easy content management (no coding required)

## 🌸 Brand

**Mother Natural: The Healing Lab** - Nurturing wellness through nature's healing power.
