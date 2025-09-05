# MongoDB Compass Connection Guide

This guide provides connection strings and instructions for connecting to the ERP system database using MongoDB Compass.

## Connection Strings

### Local Development
```
mongodb://localhost:27017/erp_system
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/erp_system?retryWrites=true&w=majority
```

## How to Connect with MongoDB Compass

1. **Download and Install MongoDB Compass**
   - Download from: https://www.mongodb.com/try/download/compass
   - Install and launch MongoDB Compass

2. **Connect to Local Database**
   - Open MongoDB Compass
   - In the connection string field, enter: `mongodb://localhost:27017/erp_system`
   - Click "Connect"

3. **Connect to MongoDB Atlas**
   - Open MongoDB Compass
   - In the connection string field, enter your Atlas connection string
   - Replace `<username>`, `<password>`, `<cluster>`, and `<database>` with your actual values
   - Click "Connect"

## Environment Variables

Make sure your `.env` file contains the correct `MONGODB_URI`:

```env
# For local development
MONGODB_URI=mongodb://localhost:27017/erp_system

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/erp_system?retryWrites=true&w=majority
```

## Database Collections

The ERP system uses the following collections:

### User Management
- `users` - User accounts and profiles with role-based access
- `adminotps` - Admin OTP verification for secure login

### Academic Management
- `courses` - Course information and details
- `enrollments` - Student course enrollments
- `attendance` - Attendance records
- `grades` - Student grades and assessments
- `assignments` - Course assignments and submissions

### Administrative
- `fees` - Fee records and payments
- `messages` - Communication messages
- `rooms` - Room assignments and scheduling
- `bookings` - Room bookings and reservations

## User Roles and Access Levels

### 🔐 **Student Role**
- **Access**: Course materials, grades, attendance, fees
- **Required Fields**: course, branch
- **Collections**: enrollments, attendance, grades, fees

### 👨‍🏫 **Faculty Role**
- **Access**: Course management, grade submission, attendance tracking
- **Required Fields**: course, branch
- **Collections**: courses, enrollments, attendance, grades, assignments

### 🏛️ **HOD (Head of Department) Role**
- **Access**: Department management, faculty oversight, course approval
- **Required Fields**: course, branch
- **Collections**: courses, faculty management, department reports

### ⚙️ **Admin Role**
- **Access**: System administration, user management, all collections
- **Required Fields**: None (system-wide access)
- **Collections**: All collections with full CRUD permissions

### 👥 **Staff Role**
- **Access**: Administrative support, limited system access
- **Required Fields**: None
- **Collections**: fees, messages, rooms, bookings

## Database Schema Examples

### Users Collection Structure
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "faculty",
  "course": "btech",
  "branch": "cse",
  "phone": "+1234567890",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### AdminOTP Collection Structure
```json
{
  "_id": "ObjectId",
  "email": "admin@erp.com",
  "otp": "123456",
  "expiresAt": "2024-01-01T00:10:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Role-Based Database Queries

### Find All Faculty Members
```javascript
db.users.find({ role: "faculty" })
```

### Find HODs by Branch
```javascript
db.users.find({ role: "hod", branch: "cse" })
```

### Find Users by Course
```javascript
db.users.find({ course: "btech" })
```

### Find Admin Users
```javascript
db.users.find({ role: "admin" })
```

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running locally: `mongod`
- Check if the port 27017 is not blocked by firewall
- Verify your Atlas credentials and network access

### Authentication Issues
- For Atlas, ensure your IP address is whitelisted
- Check username and password are correct
- Verify the database name matches your configuration

### Role-Based Access Issues
- Ensure users have the correct role assigned
- Verify required fields (course, branch) are populated for academic roles
- Check if the user has proper permissions for the requested collections

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for database access
- Regularly rotate database credentials
- Enable MongoDB authentication for production environments
- Implement proper role-based access control (RBAC)
- Use OTP for admin authentication when possible
- Monitor database access logs for suspicious activity 