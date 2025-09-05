# ERP System Backend

A comprehensive backend system for managing educational institutions with role-based access control, OTP authentication, and real-time dashboard analytics.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, HOD, Faculty, Student, Staff)
  - OTP authentication for admin users
  - Secure password hashing with bcrypt

- **User Management**
  - Multi-role user registration and management
  - Course and branch assignment
  - Profile management with role-specific data

- **Dashboard & Analytics**
  - Role-based dashboard views
  - Real-time statistics and metrics
  - Recent activities tracking
  - Smart notifications and alerts

- **Email System**
  - Nodemailer integration for OTP delivery
  - Professional email templates
  - Bulk email support for announcements
  - Configurable SMTP settings

- **Database Management**
  - MongoDB with Mongoose ODM
  - Comprehensive data models
  - Database seeding for testing
  - Role-based data access

## 📋 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/erp_system
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Email Configuration (for OTP and notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 🔐 Role-Based Access Control

### User Roles and Permissions

| Role | Access Level | Dashboard View | Key Features |
|------|--------------|----------------|--------------|
| **Admin** | Full System Access | Global Statistics | User management, system overview, financial reports |
| **HOD** | Department Level | Department Statistics | Department students, faculty, courses, attendance |
| **Faculty** | Class Level | Class Statistics | Assigned students, course management, attendance tracking |
| **Student** | Personal Level | Personal Statistics | Enrolled courses, attendance, fees, grades |
| **Staff** | Limited Access | Basic Statistics | Basic user information, limited operations |

### Required Fields by Role

- **Student**: `firstName`, `lastName`, `email`, `password`, `role`, `course`, `branch`
- **Faculty**: `firstName`, `lastName`, `email`, `password`, `role`, `course`, `branch`
- **HOD**: `firstName`, `lastName`, `email`, `password`, `role`, `course`, `branch`
- **Admin**: `firstName`, `lastName`, `email`, `password`, `role`
- **Staff**: `firstName`, `lastName`, `email`, `password`, `role`

## 📧 Email System (Nodemailer)

### Configuration

The system uses Nodemailer for sending emails. Configure your SMTP settings in the `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

### Email Features

- **OTP Delivery**: Secure OTP emails for admin authentication
- **Professional Templates**: Beautiful HTML email templates
- **Bulk Emails**: Support for announcements and circulars
- **Fallback Mode**: Mock email service for development

### Email Templates

The system includes professionally designed email templates for:
- Admin OTP verification
- General notifications
- Bulk announcements
- System alerts

## 📊 Dashboard System

### API Endpoints

#### Dashboard Overview
```http
GET /api/dashboard/overview
Authorization: Bearer <token>
```

Returns role-based statistics and metrics.

#### Recent Activities
```http
GET /api/dashboard/recent-activities
Authorization: Bearer <token>
```

Returns recent system activities based on user role.

#### Notifications
```http
GET /api/dashboard/notifications
Authorization: Bearer <token>
```

Returns role-based notifications and alerts.

### Dashboard Features

#### Admin Dashboard
- Total students, faculty, and staff counts
- Financial overview (fees collected, pending)
- System-wide statistics
- Global activity feed

#### HOD Dashboard
- Department-specific statistics
- Department students and faculty counts
- Department course information
- Department activity feed

#### Faculty Dashboard
- Assigned students count
- Course-specific information
- Class activity tracking
- Teaching schedule overview

#### Student Dashboard
- Personal course enrollments
- Attendance percentage
- Pending fees
- Academic progress

## 🗄️ MongoDB Compass Connection

### Local MongoDB

1. **Install MongoDB Compass**
   - Download from [MongoDB Compass](https://www.mongodb.com/try/download/compass)

2. **Connection String**
   ```
   mongodb://localhost:27017/erp_system
   ```

3. **Database Collections**
   - `users` - User accounts and profiles
   - `adminotps` - Admin OTP verification codes
   - `courses` - Course information
   - `enrollments` - Student course enrollments
   - `attendance` - Attendance records
   - `fees` - Fee management
   - `grades` - Academic grades
   - `messages` - Communication system

### MongoDB Atlas (Cloud)

1. **Create Atlas Cluster**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster

2. **Connection String**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

3. **Network Access**
   - Add your IP address to the IP Access List
   - Or use `0.0.0.0/0` for development (not recommended for production)

## 🌱 Database Seeding

### Run Seed Script

```bash
npm run seed
```

### Sample Users Created

| Role | Email | Password | Course | Branch |
|------|-------|----------|---------|---------|
| Admin | admin@erp.com | admin123 | - | - |
| HOD (CSE) | hod.cse@erp.com | hod123 | Computer Science | CSE |
| HOD (ECE) | hod.ece@erp.com | hod123 | Electronics | ECE |
| HOD (ME) | hod.me@erp.com | hod123 | Mechanical | ME |
| Faculty (CSE) | faculty.cse@erp.com | faculty123 | Computer Science | CSE |
| Faculty (ECE) | faculty.ece@erp.com | faculty123 | Electronics | ECE |
| Faculty (ME) | faculty.me@erp.com | faculty123 | Mechanical | ME |
| Staff | staff@erp.com | staff123 | - | - |
| Student | student@erp.com | student123 | Computer Science | CSE |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login (password/OTP)
- `POST /api/auth/send-otp` - Send admin OTP
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Dashboard
- `GET /api/dashboard/overview` - Dashboard statistics
- `GET /api/dashboard/recent-activities` - Recent activities
- `GET /api/dashboard/notifications` - Notifications

### User Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🛠️ Development

### Project Structure
```
backend/
├── config/          # Database configuration
├── middleware/      # Authentication & validation
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── scripts/         # Database seeding
├── utils/           # Utility functions (email, etc.)
├── server.js        # Main application file
└── package.json     # Dependencies
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Run database seeding
- `npm test` - Run tests (when implemented)

### Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password
- `FRONTEND_URL` - Frontend URL for CORS

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Role-Based Access**: Granular permission control
- **OTP Verification**: Two-factor authentication for admin
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Request data sanitization
- **Helmet Security**: HTTP security headers

## 📈 Performance & Monitoring

- **Compression**: Gzip response compression
- **Rate Limiting**: Configurable request limits
- **Logging**: Morgan HTTP request logging
- **Error Handling**: Comprehensive error management
- **Health Checks**: System status endpoints

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=<strong-secret-key>
EMAIL_HOST=<smtp-host>
EMAIL_USER=<email-username>
EMAIL_PASS=<email-password>
FRONTEND_URL=<your-frontend-url>
```

## 🐛 Troubleshooting

### Common Issues

#### Email Not Sending
- Check SMTP credentials in `.env`
- Verify email service settings
- Check firewall/network restrictions
- Use mock email service for development

#### Database Connection Issues
- Verify MongoDB service is running
- Check connection string format
- Ensure network access (for Atlas)
- Verify database name exists

#### OTP Not Working
- Check email configuration
- Verify AdminOTP collection exists
- Check OTP expiration (10 minutes)
- Ensure user has admin privileges

#### Dashboard Data Missing
- Run database seeding script
- Check user role assignments
- Verify course/branch data exists
- Check authentication token

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [JWT Documentation](https://jwt.io/)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

**Note**: This is a comprehensive ERP system backend. Make sure to configure all environment variables and test thoroughly before deploying to production. 