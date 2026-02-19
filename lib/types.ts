export interface Student {
  _id?: string
  studentId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: "male" | "female"
  classId: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  address: string
  admissionDate: Date
  status: "active" | "inactive" | "graduated"
  createdAt: Date
  updatedAt: Date
}

export interface Class {
  _id?: string
  className: string
  level: string
  section: string
  academicYear: string
  capacity: number
  currentEnrollment: number
  classTeacherId?: string
  subjects: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Subject {
  _id?: string
  subjectCode: string
  subjectName: string
  description: string
  teacherId?: string
  creditHours: number
  createdAt: Date
}

export interface Teacher {
  _id?: string
  teacherId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialization: string
  subjects: string[]
  joinDate: Date
  status: "active" | "inactive"
  createdAt: Date
}

export interface Attendance {
  _id?: string
  studentId: string
  classId: string
  date: Date
  status: "present" | "absent" | "late" | "excused"
  notes?: string
  markedBy: string
  createdAt: Date
}

export interface Assessment {
  _id?: string
  title: string
  description: string
  classId: string
  subjectCode: string
  assessmentType: "quiz" | "test" | "assignment" | "midterm" | "final" | "project"
  totalMarks: number
  weight: number
  dueDate: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Grade {
  _id?: string
  assessmentId: string
  studentId: string
  marksObtained: number
  feedback?: string
  gradedBy: string
  gradedAt: Date
  createdAt: Date
}

export interface SubjectGrade {
  subjectCode: string
  subjectName: string
  totalMarks: number
  obtainedMarks: number
  percentage: number
  grade: string
  remarks: string
}

export interface SchoolClass {
  id: string;
  name: string;
  students: Student[];
}

export interface Subject {
  id: string;
  name: string;
}

export interface Assessment {
  studentId: number;
  subjectId: string;
  test1: number;
  groupWork: number;
  test2: number;
  project: number;
  exam: number;
}

export interface TaskWeights {
  test1: number;
  groupWork: number;
  test2: number;
  project: number;
}
