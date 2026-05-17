import { Level, Prisma, Section, Subject } from "./generated/prisma/client"

export interface SchoolConfig {
  schoolId: string;

  name: string;

  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };

  database: {
    url: string;
    directUrl: string
  }
  secrets: {
    JWT_TOKEN: string
  }
}

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

interface SubjectScore {
  name: string;
  classScore: number;
  examsScore: number;
  totalScore: number;
  grade: string;
  remarks: string;
}

export interface StudentReport {
  id: string;
  name: string;
  age: number;
  attendance: {totalDays: number, presentDays: number};
  term: string;
  academicPeriod: string;
  termEnding: string;
  nextTermBegins: string;
  promotedTo: string;
  conduct: string;
  attitude: string;
  classTeacherRemark: string;
  subjects: SubjectScore[];
  grade: number
}

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
