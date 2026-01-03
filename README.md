# Academic Management System

A comprehensive school management platform built with Next.js, MongoDB, and modern web technologies.

## Features

### Core Modules

1. **User Authentication**
   - Secure JWT-based authentication
   - Role-based access control (Admin, Teacher, Academic Officer, Headteacher)
   - Password hashing with bcrypt

2. **Student Records Management**
   - Complete student profile management
   - Guardian information tracking
   - Class assignment and enrollment
   - Student ID generation

3. **Class Management**
   - Class creation and configuration
   - Enrollment tracking
   - Capacity management
   - Subject assignment

4. **Attendance Tracking**
   - Daily attendance marking
   - Multiple status types (Present, Absent, Late, Excused)
   - Calendar-based date selection
   - Real-time statistics
   - Attendance history and reporting

5. **Assessment & Grading**
   - Multiple assessment types (Quiz, Test, Assignment, Midterm, Final, Project)
   - Subject-based grading
   - Automated grade calculation
   - Percentage and letter grade conversion
   - Weight-based assessment tracking

6. **Report Card Generation**
   - Comprehensive student reports
   - Subject-wise performance breakdown
   - Overall grade calculation
   - Printable digital format
   - Professional layout with grading scales

7. **Analytics Dashboard**
   - Attendance trends visualization
   - Grade distribution charts
   - Class performance comparison
   - Top performers and alerts
   - Real-time insights

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS v4
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database

### Installation

1. Download the project ZIP file or clone via shadcn CLI
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. Initialize the database:
   ```bash
   # Run initialization scripts
   node scripts/001-init-database.ts
   node scripts/002-seed-admin-user.ts
   node scripts/003-seed-subjects.ts
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

### Default Admin Credentials

- **Email**: admin@school.edu
- **Password**: admin123

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   └── page.tsx          # Login page
├── components/           # React components
├── lib/
│   ├── mongodb.ts        # Database connection
│   ├── auth.ts           # Authentication utilities
│   ├── grading.ts        # Grading calculations
│   └── types.ts          # TypeScript interfaces
└── scripts/              # Database initialization scripts
```

## Key Features in Detail

### Authentication System
- Secure session management with HTTP-only cookies
- Role-based authorization at route and API level
- Automatic session verification

### Student Management
- Searchable student records
- Bulk operations support
- Guardian contact management
- Automatic student ID generation

### Attendance System
- Quick mark attendance for entire classes
- Visual status indicators
- Historical tracking
- Automated statistics

### Grading System
- Flexible assessment types
- Weighted grade calculations
- Automatic percentage to grade conversion
- Subject-wise performance tracking

### Report Cards
- Professional print-ready format
- Complete academic summary
- Signature sections
- Grading scale reference

### Analytics
- Interactive charts and graphs
- Performance trends
- Attendance patterns
- Alert system for low performance

## Database Schema

### Collections
- `users` - System users with roles
- `students` - Student records
- `classes` - Class information
- `attendance` - Daily attendance records
- `assessments` - Assessment definitions
- `grades` - Student grades
- `subjects` - Subject information
- `teachers` - Teacher records

## Future Enhancements

- Automated timetable generation
- Parent portal access
- SMS/Email notifications
- Bulk student import
- Advanced analytics and predictive insights
- Mobile app support

## Support

For issues or questions, please contact your system administrator.

## License

This project is licensed for educational and institutional use.
