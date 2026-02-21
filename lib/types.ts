import { Prisma, Student } from "./generated/prisma/client"

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    user: true
    class: true
    grades: true
    attendances: true
  }
}>


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
  students: StudentWithRelations[];
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
