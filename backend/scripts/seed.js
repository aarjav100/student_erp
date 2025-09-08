import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
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
    
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Sample users data
    const users = [
      // Admin users
      {
        email: 'admin@erp.com',
        password: 'admin123',
        name: 'System Administrator',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        phone: '+1234567890',
        status: 'approved',
        approvalAuthority: 'admin'
      },
      {
        email: 'superadmin@erp.com',
        password: 'super123',
        name: 'Super Admin',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'admin',
        phone: '+1234567891',
        status: 'approved',
        approvalAuthority: 'admin'
      },

      // HOD users
      {
        email: 'hod.cse@erp.com',
        password: 'hod123',
        name: 'Dr. Sarah Johnson',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'dean',
        course: 'btech',
        program: 'cse',
        phone: '+1234567892',
        status: 'approved',
        approvalAuthority: 'admin'
      },
      {
        email: 'hod.ece@erp.com',
        password: 'hod123',
        name: 'Dr. Michael Chen',
        firstName: 'Dr. Michael',
        lastName: 'Chen',
        role: 'dean',
        course: 'btech',
        program: 'ece',
        phone: '+1234567893',
        status: 'approved',
        approvalAuthority: 'admin'
      },
      {
        email: 'hod.me@erp.com',
        password: 'hod123',
        name: 'Dr. Emily Davis',
        firstName: 'Dr. Emily',
        lastName: 'Davis',
        role: 'dean',
        course: 'btech',
        program: 'me',
        phone: '+1234567894',
        status: 'approved',
        approvalAuthority: 'admin'
      },

      // Faculty users
      {
        email: 'faculty.cse@erp.com',
        password: 'faculty123',
        name: 'Prof. James Wilson',
        firstName: 'Prof. James',
        lastName: 'Wilson',
        role: 'faculty',
        course: 'btech',
        program: 'cse',
        phone: '+1234567895',
        status: 'approved',
        approvalAuthority: 'admin'
      },
      {
        email: 'faculty.ece@erp.com',
        password: 'faculty123',
        name: 'Prof. Lisa Brown',
        firstName: 'Prof. Lisa',
        lastName: 'Brown',
        role: 'faculty',
        course: 'btech',
        program: 'ece',
        phone: '+1234567896',
        status: 'approved',
        approvalAuthority: 'admin'
      },
      {
        email: 'faculty.me@erp.com',
        password: 'faculty123',
        name: 'Prof. Robert Taylor',
        firstName: 'Prof. Robert',
        lastName: 'Taylor',
        role: 'faculty',
        course: 'btech',
        program: 'me',
        phone: '+1234567897',
        status: 'approved',
        approvalAuthority: 'admin'
      },

      // Staff users
      {
        email: 'staff@erp.com',
        password: 'staff123',
        name: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        role: 'staff',
        phone: '+1234567898',
        status: 'approved',
        approvalAuthority: 'admin'
      },
      {
        email: 'support@erp.com',
        password: 'support123',
        name: 'Mary Williams',
        firstName: 'Mary',
        lastName: 'Williams',
        role: 'staff',
        phone: '+1234567899',
        status: 'approved',
        approvalAuthority: 'admin'
      },

      // Student users
      {
        email: 'student1@erp.com',
        password: 'student123',
        name: 'Alex Johnson',
        firstName: 'Alex',
        lastName: 'Johnson',
        role: 'student',
        course: 'btech',
        program: 'cse',
        studentId: 'BT2024001',
        phone: '+1234567900',
        status: 'approved',
        approvalAuthority: 'admin'
      },
      {
        email: 'student2@erp.com',
        password: 'student123',
        name: 'Taylor Brown',
        firstName: 'Taylor',
        lastName: 'Brown',
        role: 'student',
        course: 'btech',
        program: 'ece',
        studentId: 'BT2024002',
        phone: '+1234567901',
        status: 'approved',
        approvalAuthority: 'admin'
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
      if (user.course && user.program) {
        console.log(`   📚 Course: ${user.course.toUpperCase()}, Program: ${user.program.toUpperCase()}`);
      }
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('🔐 Admin: admin@erp.com / admin123');
    console.log('🏛️  Dean: hod.cse@erp.com / hod123');
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

const seedCourses = async () => {
  try {
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing courses');

    // Get admin user for createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please run user seeding first.');
      return;
    }

    // Sample courses data
    const courses = [
      {
        courseCode: 'BTECH-CSE',
        title: 'Bachelor of Technology in Computer Science and Engineering',
        description: 'A comprehensive 4-year program covering computer science fundamentals, software engineering, and emerging technologies.',
        department: 'CSE',
        degree: 'BTech',
        duration: 4,
        totalCredits: 160,
        semesterCredits: 20,
        maxStudents: 60,
        objectives: [
          'To provide strong foundation in computer science fundamentals',
          'To develop programming and software engineering skills',
          'To prepare students for industry and research careers'
        ],
        outcomes: [
          'Students will be able to design and implement software solutions',
          'Students will understand computer systems and networks',
          'Students will be prepared for advanced studies and industry'
        ],
        eligibility: '10+2 with Physics, Chemistry, and Mathematics',
        admissionProcess: 'JEE Main/Advanced or State Engineering Entrance Exam',
        feeStructure: {
          tuitionFee: 100000,
          otherFees: 20000,
          totalFee: 120000
        },
        createdBy: adminUser._id
      },
      {
        courseCode: 'BTECH-ECE',
        title: 'Bachelor of Technology in Electronics and Communication Engineering',
        description: 'A 4-year program focusing on electronics, communication systems, and signal processing.',
        department: 'ECE',
        degree: 'BTech',
        duration: 4,
        totalCredits: 160,
        semesterCredits: 20,
        maxStudents: 60,
        objectives: [
          'To provide knowledge in electronics and communication systems',
          'To develop skills in signal processing and embedded systems',
          'To prepare students for telecommunications and electronics industry'
        ],
        outcomes: [
          'Students will design electronic circuits and systems',
          'Students will understand communication protocols and networks',
          'Students will be skilled in embedded system development'
        ],
        eligibility: '10+2 with Physics, Chemistry, and Mathematics',
        admissionProcess: 'JEE Main/Advanced or State Engineering Entrance Exam',
        feeStructure: {
          tuitionFee: 100000,
          otherFees: 20000,
          totalFee: 120000
        },
        createdBy: adminUser._id
      },
      {
        courseCode: 'BTECH-ME',
        title: 'Bachelor of Technology in Mechanical Engineering',
        description: 'A comprehensive program covering mechanical systems, thermodynamics, and manufacturing.',
        department: 'ME',
        degree: 'BTech',
        duration: 4,
        totalCredits: 160,
        semesterCredits: 20,
        maxStudents: 60,
        objectives: [
          'To provide knowledge in mechanical systems and design',
          'To develop skills in manufacturing and automation',
          'To prepare students for mechanical engineering careers'
        ],
        outcomes: [
          'Students will design mechanical systems and components',
          'Students will understand manufacturing processes',
          'Students will be skilled in CAD/CAM and automation'
        ],
        eligibility: '10+2 with Physics, Chemistry, and Mathematics',
        admissionProcess: 'JEE Main/Advanced or State Engineering Entrance Exam',
        feeStructure: {
          tuitionFee: 100000,
          otherFees: 20000,
          totalFee: 120000
        },
        createdBy: adminUser._id
      },
      {
        courseCode: 'MCA',
        title: 'Master of Computer Applications',
        description: 'A 3-year postgraduate program in computer applications and software development.',
        department: 'IT',
        degree: 'MCA',
        duration: 3,
        totalCredits: 120,
        semesterCredits: 20,
        maxStudents: 40,
        objectives: [
          'To provide advanced knowledge in computer applications',
          'To develop software development and project management skills',
          'To prepare students for IT industry leadership roles'
        ],
        outcomes: [
          'Students will master software development methodologies',
          'Students will understand enterprise application development',
          'Students will be prepared for senior IT positions'
        ],
        eligibility: 'Bachelor degree in any discipline with Mathematics at 10+2 level',
        admissionProcess: 'NIMCET or University Entrance Exam',
        feeStructure: {
          tuitionFee: 80000,
          otherFees: 15000,
          totalFee: 95000
        },
        createdBy: adminUser._id
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Display created courses
    createdCourses.forEach(course => {
      console.log(`📚 ${course.degree.toUpperCase()}: ${course.title} (${course.courseCode})`);
      console.log(`   🏛️  Department: ${course.department}, Duration: ${course.duration} years`);
    });

    return createdCourses;
  } catch (error) {
    console.error('❌ Seeding courses error:', error);
  }
};

const seedSubjects = async (courses) => {
  try {
    await Subject.deleteMany({});
    console.log('🗑️  Cleared existing subjects');

    // Get admin user for createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    const facultyUsers = await User.find({ role: 'faculty' });

    if (!adminUser) {
      console.log('❌ No admin user found. Please run user seeding first.');
      return;
    }

    // Sample subjects data
    const subjects = [
      // BTech CSE Subjects
      {
        name: 'Programming Fundamentals',
        code: 'CS101',
        description: 'Introduction to programming concepts using C language',
        courseId: courses.find(c => c.courseCode === 'BTECH-CSE')._id,
        credits: 4,
        semester: 1,
        year: 1,
        instructor: facultyUsers[0]?._id,
        objectives: [
          'Understand basic programming concepts',
          'Learn C programming language',
          'Develop problem-solving skills'
        ],
        outcomes: [
          'Students will be able to write C programs',
          'Students will understand data structures basics',
          'Students will develop algorithmic thinking'
        ],
        syllabus: 'Introduction to C, Data types, Control structures, Functions, Arrays, Pointers, File handling',
        textbooks: [
          {
            title: 'Programming in C',
            author: 'Dennis Ritchie',
            edition: '2nd',
            publisher: 'Prentice Hall',
            isbn: '978-0131103627'
          }
        ],
        assessment: {
          internal: 40,
          external: 60,
          total: 100
        },
        schedule: {
          lectures: 3,
          tutorials: 1,
          practicals: 2,
          totalHours: 6
        },
        createdBy: adminUser._id
      },
      {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        description: 'Study of fundamental data structures and algorithm design',
        courseId: courses.find(c => c.courseCode === 'BTECH-CSE')._id,
        credits: 4,
        semester: 3,
        year: 2,
        instructor: facultyUsers[0]?._id,
        prerequisites: [], // Will be updated after subjects are created
        objectives: [
          'Understand various data structures',
          'Learn algorithm design techniques',
          'Analyze time and space complexity'
        ],
        outcomes: [
          'Students will implement various data structures',
          'Students will design efficient algorithms',
          'Students will analyze algorithm complexity'
        ],
        syllabus: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Searching',
        textbooks: [
          {
            title: 'Introduction to Algorithms',
            author: 'Thomas H. Cormen',
            edition: '3rd',
            publisher: 'MIT Press',
            isbn: '978-0262033848'
          }
        ],
        assessment: {
          internal: 40,
          external: 60,
          total: 100
        },
        schedule: {
          lectures: 3,
          tutorials: 1,
          practicals: 2,
          totalHours: 6
        },
        createdBy: adminUser._id
      },
      {
        name: 'Database Management Systems',
        code: 'CS301',
        description: 'Introduction to database concepts and SQL',
        courseId: courses.find(c => c.courseCode === 'BTECH-CSE')._id,
        credits: 4,
        semester: 5,
        year: 3,
        instructor: facultyUsers[1]?._id,
        objectives: [
          'Understand database concepts',
          'Learn SQL programming',
          'Design normalized databases'
        ],
        outcomes: [
          'Students will design database schemas',
          'Students will write complex SQL queries',
          'Students will understand database optimization'
        ],
        syllabus: 'ER Model, Relational Model, SQL, Normalization, Transactions, Concurrency',
        textbooks: [
          {
            title: 'Database System Concepts',
            author: 'Abraham Silberschatz',
            edition: '7th',
            publisher: 'McGraw-Hill',
            isbn: '978-0078022159'
          }
        ],
        assessment: {
          internal: 40,
          external: 60,
          total: 100
        },
        schedule: {
          lectures: 3,
          tutorials: 1,
          practicals: 2,
          totalHours: 6
        },
        createdBy: adminUser._id
      },
      // BTech ECE Subjects
      {
        name: 'Digital Electronics',
        code: 'EC101',
        description: 'Fundamentals of digital circuits and logic design',
        courseId: courses.find(c => c.courseCode === 'BTECH-ECE')._id,
        credits: 4,
        semester: 1,
        year: 1,
        instructor: facultyUsers[2]?._id,
        objectives: [
          'Understand digital logic concepts',
          'Learn Boolean algebra',
          'Design digital circuits'
        ],
        outcomes: [
          'Students will design combinational circuits',
          'Students will understand sequential circuits',
          'Students will use digital design tools'
        ],
        syllabus: 'Boolean Algebra, Logic Gates, Combinational Circuits, Sequential Circuits, Memory',
        textbooks: [
          {
            title: 'Digital Design',
            author: 'M. Morris Mano',
            edition: '5th',
            publisher: 'Prentice Hall',
            isbn: '978-0132774208'
          }
        ],
        assessment: {
          internal: 40,
          external: 60,
          total: 100
        },
        schedule: {
          lectures: 3,
          tutorials: 1,
          practicals: 2,
          totalHours: 6
        },
        createdBy: adminUser._id
      },
      // MCA Subjects
      {
        name: 'Advanced Programming',
        code: 'MCA101',
        description: 'Advanced programming concepts and object-oriented design',
        courseId: courses.find(c => c.courseCode === 'MCA')._id,
        credits: 4,
        semester: 1,
        year: 1,
        instructor: facultyUsers[0]?._id,
        objectives: [
          'Master object-oriented programming',
          'Learn design patterns',
          'Develop enterprise applications'
        ],
        outcomes: [
          'Students will design OOP solutions',
          'Students will implement design patterns',
          'Students will develop scalable applications'
        ],
        syllabus: 'OOP Concepts, Design Patterns, Java/C# Programming, Enterprise Development',
        textbooks: [
          {
            title: 'Design Patterns',
            author: 'Gang of Four',
            edition: '1st',
            publisher: 'Addison-Wesley',
            isbn: '978-0201633610'
          }
        ],
        assessment: {
          internal: 40,
          external: 60,
          total: 100
        },
        schedule: {
          lectures: 3,
          tutorials: 1,
          practicals: 2,
          totalHours: 6
        },
        createdBy: adminUser._id
      }
    ];

    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`✅ Created ${createdSubjects.length} subjects`);

    // Display created subjects
    createdSubjects.forEach(subject => {
      const course = courses.find(c => c._id.toString() === subject.courseId.toString());
      console.log(`📖 ${subject.name} (${subject.code}) - ${course?.courseCode}`);
      console.log(`   📚 Credits: ${subject.credits}, Semester: ${subject.semester}, Year: ${subject.year}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Available Courses:');
    courses.forEach(course => {
      console.log(`📚 ${course.degree}: ${course.title} (${course.courseCode})`);
    });

  } catch (error) {
    console.error('❌ Seeding subjects error:', error);
  }
};

// Run seeding
connectDB().then(async () => {
  await seedUsers();
  const courses = await seedCourses();
  await seedSubjects(courses);
}); 