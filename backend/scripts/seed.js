import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Sample users data
    const users = [
      // Admin users
      {
        email: 'admin@erp.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        phone: '+1234567890',
        status: 'active'
      },
      {
        email: 'superadmin@erp.com',
        password: 'super123',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'admin',
        phone: '+1234567891',
        status: 'active'
      },

      // HOD users
      {
        email: 'hod.cse@erp.com',
        password: 'hod123',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'hod',
        course: 'btech',
        branch: 'cse',
        phone: '+1234567892',
        status: 'active'
      },
      {
        email: 'hod.ece@erp.com',
        password: 'hod123',
        firstName: 'Dr. Michael',
        lastName: 'Chen',
        role: 'hod',
        course: 'btech',
        branch: 'ece',
        phone: '+1234567893',
        status: 'active'
      },
      {
        email: 'hod.me@erp.com',
        password: 'hod123',
        firstName: 'Dr. Emily',
        lastName: 'Davis',
        role: 'hod',
        course: 'btech',
        branch: 'me',
        phone: '+1234567894',
        status: 'active'
      },

      // Faculty users
      {
        email: 'faculty.cse@erp.com',
        password: 'faculty123',
        firstName: 'Prof. James',
        lastName: 'Wilson',
        role: 'faculty',
        course: 'btech',
        branch: 'cse',
        phone: '+1234567895',
        status: 'active'
      },
      {
        email: 'faculty.ece@erp.com',
        password: 'faculty123',
        firstName: 'Prof. Lisa',
        lastName: 'Brown',
        role: 'faculty',
        course: 'btech',
        branch: 'ece',
        phone: '+1234567896',
        status: 'active'
      },
      {
        email: 'faculty.me@erp.com',
        password: 'faculty123',
        firstName: 'Prof. Robert',
        lastName: 'Taylor',
        role: 'faculty',
        course: 'btech',
        branch: 'me',
        phone: '+1234567897',
        status: 'active'
      },

      // Staff users
      {
        email: 'staff@erp.com',
        password: 'staff123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'staff',
        phone: '+1234567898',
        status: 'active'
      },
      {
        email: 'support@erp.com',
        password: 'support123',
        firstName: 'Mary',
        lastName: 'Williams',
        role: 'staff',
        phone: '+1234567899',
        status: 'active'
      },

      // Student users
      {
        email: 'student1@erp.com',
        password: 'student123',
        firstName: 'Alex',
        lastName: 'Johnson',
        role: 'student',
        course: 'btech',
        branch: 'cse',
        studentId: 'BT2024001',
        phone: '+1234567900',
        status: 'active'
      },
      {
        email: 'student2@erp.com',
        password: 'student123',
        firstName: 'Taylor',
        lastName: 'Brown',
        role: 'student',
        course: 'btech',
        branch: 'ece',
        studentId: 'BT2024002',
        phone: '+1234567901',
        status: 'active'
      }
    ];

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Display created users
    createdUsers.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}: ${user.firstName} ${user.lastName} (${user.email})`);
      if (user.course && user.branch) {
        console.log(`   📚 Course: ${user.course.toUpperCase()}, Branch: ${user.branch.toUpperCase()}`);
      }
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('🔐 Admin: admin@erp.com / admin123');
    console.log('🏛️  HOD: hod.cse@erp.com / hod123');
    console.log('👨‍🏫 Faculty: faculty.cse@erp.com / faculty123');
    console.log('👥 Staff: staff@erp.com / staff123');
    console.log('🎓 Student: student1@erp.com / student123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

// Run seeding
connectDB().then(() => {
  seedUsers();
}); 