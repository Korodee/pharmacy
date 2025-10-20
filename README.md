# Kateri Pharmacy - Full-Stack Website

A modern, full-stack pharmacy website built with Next.js 15, Express.js, TypeScript, and MongoDB.

## 🏗️ Project Structure

```
kateri-pharmacy/
├── frontend/          # Next.js 15 + TypeScript + TailwindCSS
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities and API client
│   └── package.json
├── backend/           # Express.js + TypeScript + Mongoose
│   ├── src/
│   │   ├── server.ts      # Main server file
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   └── utils/         # Utilities (database, email)
│   └── package.json
├── shared/            # Shared TypeScript types
│   └── types.ts
├── package.json       # Root workspace configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- MongoDB (local or cloud)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd kateri-pharmacy
   pnpm install:all
   ```

2. **Set up environment variables:**
   
   **Backend (.env):**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kateri-pharmacy
   ADMIN_EMAIL=admin@kateripharmacy.com
   EMAIL_SERVER=smtp.gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   NODE_ENV=development
   ```
   
   **Frontend (.env.local):**
   ```bash
   cp frontend/env.local.example frontend/.env.local
   ```
   
   Edit `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env with your Atlas connection string
   ```

4. **Start development servers:**
   ```bash
   pnpm dev
   ```

   This will start:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

## 🛠️ Development

### Available Scripts

```bash
# Root level
pnpm dev              # Start both frontend and backend
pnpm build            # Build both applications
pnpm start            # Start production servers
pnpm install:all      # Install all dependencies

# Backend only
cd backend
pnpm dev              # Start backend in development mode
pnpm build            # Build backend
pnpm start            # Start backend in production

# Frontend only  
cd frontend
pnpm dev              # Start frontend in development mode
pnpm build            # Build frontend
pnpm start            # Start frontend in production
```

### API Endpoints

**Backend API (http://localhost:5000):**

- `GET /health` - Health check
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (with pagination)
- `GET /api/orders/:id` - Get single order

**Example API Usage:**
```bash
# Create an order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "Need prescription refill"
  }'

# Get all orders
curl http://localhost:5000/api/orders
```

## 📦 Database Schema

### Order Model
```typescript
interface Order {
  _id?: string;
  fullName: string;        // Required
  email: string;           // Required
  phone?: string;          // Optional
  address?: string;        // Optional
  message?: string;        // Optional
  prescription?: string;   // Optional (file URL)
  createdAt?: Date;        // Auto-generated
}
```

## 📧 Email Configuration

The system sends email notifications when new orders are created:

1. **Admin Notification:** Sent to `ADMIN_EMAIL` when a new order is submitted
2. **Customer Confirmation:** Sent to customer's email (optional)

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

### Other Email Providers
Update `EMAIL_SERVER`, `EMAIL_USER`, and `EMAIL_PASS` in your `.env` file.

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect to Vercel:**
   ```bash
   npx vercel
   ```

2. **Set environment variables in Vercel dashboard:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NEXT_PUBLIC_BASE_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Backend (Render/Railway)

#### Option 1: Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && pnpm install && pnpm build`
4. Set start command: `cd backend && pnpm start`
5. Add environment variables in Render dashboard

#### Option 2: Railway
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your production environment

### Environment Variables for Production

**Backend:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kateri-pharmacy
ADMIN_EMAIL=admin@kateripharmacy.com
EMAIL_SERVER=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=5000
NODE_ENV=production
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_BASE_URL=https://your-frontend-url.vercel.app
```

## 🔧 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Mongoose** - MongoDB ODM
- **Nodemailer** - Email service
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Development
- **pnpm** - Fast package manager
- **Concurrently** - Run multiple commands
- **tsx** - TypeScript execution

## 📝 Next Steps

1. **Connect to MongoDB:** Set up your database connection
2. **Configure Email:** Set up email service for notifications
3. **Test API:** Use the provided endpoints to test functionality
4. **Deploy:** Follow deployment instructions for your chosen platforms
5. **Customize:** Add your pharmacy branding and content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation above
- Review the environment configuration
- Ensure all dependencies are installed correctly
- Verify MongoDB connection and email configuration
