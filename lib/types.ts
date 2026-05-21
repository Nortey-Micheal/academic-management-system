import { EnrollmentStatus, Gender, Level, Prisma, Section, Subject, UserStatus } from "./generated/prisma/client"

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

export type StudentWithRelations = {
  id: string
  studentId: string
  gender: Gender
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  address: string
  admissionDate: Date
  dateOfBirth: Date

  user: {
    id: string
    firstName: string
    lastName: string
    status: UserStatus
  }

  enrollments: {
    id: string
    classId: string
    isCurrent: boolean
    status: EnrollmentStatus
  }[]
}

export type ClassWithStudents = Prisma.ClassGetPayload<{
  include: {
    classTeacher: true

    subjects: {
      include: {
        subject: true
      }
    }

    enrollments: {
      where: {
        isCurrent: true
      }

      include: {
        student: {
          select: {
            id: true
            studentId: true
            dateOfBirth: true
            gender: true
            guardianName: true
            guardianPhone: true
            guardianEmail: true
            address: true
            admissionDate: true

            user: {
              select: {
                id: true
                firstName: true
                lastName: true
                status: true
              }
            }
          }
        }
      }
    }
  }
}>

export type EnrollmentStudent =
  ClassWithStudents["enrollments"][number]["student"] & {
    classId: string
  }

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
  enrollments: {
    student: StudentWithRelations
  }[]
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
