import { Gender, Level, Prisma, Section, Student, Subject } from "./generated/prisma/client"

export type FullUserType = Prisma.UserGetPayload<{
  include: {
    studentProfile: true,
    teacherProfile: true
  }
}>

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    user: true
    class: true
    grades: true
    attendances: true
  }
}>

export type ClassWithStudents = Prisma.ClassGetPayload<{
  include: {
    students: {
      include: {
        user: true
        class: true
        grades: true
        attendances: true
      }
    }
  }
}>

export type ClassWithStudentsAndSubjects = {
  id: string
  level: Level
  grade: number
  section: Section
  academicYear: string
  capacity: number
  currentEnrollment: number
  classTeacherId: string | null
  createdAt: string
  updatedAt: string
  students: StudentWithRelations[]
  subjects: Subject[]
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
  studentId: string;
  subjectId: string;
  classId: string
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
