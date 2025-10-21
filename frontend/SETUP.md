# Pharmacy Dashboard Setup

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Brevo Email Configuration
BREVO_API_KEY=your_brevo_api_key_here
FROM_EMAIL=noreply@kateripharmacy.com
ADMIN_EMAIL=admin@kateripharmacy.com

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Brevo Setup

1. Sign up for a Brevo account at https://www.brevo.com/
2. Go to your account settings and generate an API key
3. Add the API key to your `.env.local` file
4. Configure your sender email address

## Features Implemented

### User Dashboard
- **Request A Refill**: Modal form for prescription refills
- **Request A Consultation**: Modal form for consultation requests
- Both forms send data to the backend API

### Admin Dashboard
- **Requests Table**: View all submitted requests
- **Request Details**: Click any request to see full details
- **Status Updates**: Change request status (pending, in-progress, completed)
- **Email Notifications**: Admin receives email when new requests are submitted

### Backend API
- **POST /api/requests**: Submit new requests
- **GET /api/requests**: Fetch all requests for admin
- **Email Integration**: Automatic email notifications via Brevo

## Usage

1. **User Flow**:
   - User clicks "Request A Refill" or "Request A Consultation"
   - Fills out the modal form
   - Submits the request
   - Admin receives email notification

2. **Admin Flow**:
   - Visit `/admin` to see the admin dashboard
   - View all requests in a table
   - Click any request to see detailed information
   - Update request status as needed

## File Structure

```
frontend/
├── app/
│   ├── api/requests/route.ts     # API endpoints
│   ├── admin/page.tsx            # Admin dashboard
│   └── services/page.tsx         # Services page
├── components/
│   ├── modal/
│   │   ├── RefillModal.tsx       # Refill request modal
│   │   └── ConsultationModal.tsx # Consultation request modal
│   └── hero/
│       └── Navigation.tsx        # Updated navbar
└── lib/
    └── email.ts                  # Brevo email service
```
