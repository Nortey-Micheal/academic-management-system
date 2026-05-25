import {
  MetricCard,
  Teacher,
  Student,
  AttendanceRecord,
  FinancialRecord,
  ChartDataPoint,
  ClassPerformance,
  DepartmentData,
} from './types';

// School Overview Metrics
export const schoolMetrics: MetricCard[] = [
  {
    label: 'Total Students',
    value: '1,245',
    trend: 'up',
    trendValue: '+12%',
  },
  {
    label: 'Total Teachers',
    value: '85',
    trend: 'up',
    trendValue: '+3%',
  },
  {
    label: 'Overall Attendance',
    value: '94.2%',
    trend: 'up',
    trendValue: '+2.1%',
  },
  {
    label: 'Average Grade',
    value: '3.6 GPA',
    trend: 'neutral',
    trendValue: 'No change',
  },
];

// Teacher Analytics
export const teachers: Teacher[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    department: 'Mathematics',
    classes: 4,
    rating: 4.8,
    studentsCount: 120,
    yearsExperience: 12,
    specialization: 'Calculus',
  },
  {
    id: '2',
    name: 'Michael Chen',
    department: 'Science',
    classes: 3,
    rating: 4.7,
    studentsCount: 95,
    yearsExperience: 8,
    specialization: 'Physics',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    department: 'English',
    classes: 5,
    rating: 4.9,
    studentsCount: 140,
    yearsExperience: 15,
    specialization: 'Literature',
  },
  {
    id: '4',
    name: 'David Thompson',
    department: 'History',
    classes: 3,
    rating: 4.5,
    studentsCount: 85,
    yearsExperience: 6,
    specialization: 'World History',
  },
  {
    id: '5',
    name: 'Jessica Williams',
    department: 'Mathematics',
    classes: 4,
    rating: 4.6,
    studentsCount: 110,
    yearsExperience: 10,
    specialization: 'Algebra',
  },
];

// Student Performance
export const students: Student[] = [
  {
    id: '1',
    name: 'Alex Kumar',
    grade: 10,
    gpa: 3.95,
    totalMarks: 485,
    status: 'excellent',
    attendanceRate: 98,
    subjects: ['Math', 'Science', 'English'],
  },
  {
    id: '2',
    name: 'Brooklyn Hayes',
    grade: 10,
    gpa: 3.78,
    totalMarks: 465,
    status: 'excellent',
    attendanceRate: 96,
    subjects: ['Math', 'History', 'Art'],
  },
  {
    id: '3',
    name: 'Mason White',
    grade: 9,
    gpa: 3.45,
    totalMarks: 420,
    status: 'good',
    attendanceRate: 94,
    subjects: ['Math', 'Science', 'PE'],
  },
  {
    id: '4',
    name: 'Olivia Brown',
    grade: 11,
    gpa: 3.85,
    totalMarks: 475,
    status: 'excellent',
    attendanceRate: 97,
    subjects: ['Science', 'English', 'Math'],
  },
  {
    id: '5',
    name: 'Ethan Davis',
    grade: 9,
    gpa: 2.95,
    totalMarks: 355,
    status: 'average',
    attendanceRate: 88,
    subjects: ['English', 'History', 'Math'],
  },
  {
    id: '6',
    name: 'Sophia Miller',
    grade: 10,
    gpa: 2.45,
    totalMarks: 298,
    status: 'at-risk',
    attendanceRate: 75,
    subjects: ['Math', 'English', 'Science'],
  },
];

// Attendance Data
export const attendanceData: AttendanceRecord[] = [
  { date: 'May 1', totalStudents: 1245, presentStudents: 1170, rate: 94.0 },
  { date: 'May 2', totalStudents: 1245, presentStudents: 1190, rate: 95.6 },
  { date: 'May 3', totalStudents: 1245, presentStudents: 1155, rate: 92.8 },
  { date: 'May 4', totalStudents: 1245, presentStudents: 1180, rate: 94.8 },
  { date: 'May 5', totalStudents: 1245, presentStudents: 1200, rate: 96.4 },
  { date: 'May 8', totalStudents: 1245, presentStudents: 1175, rate: 94.4 },
  { date: 'May 9', totalStudents: 1245, presentStudents: 1185, rate: 95.2 },
  { date: 'May 10', totalStudents: 1245, presentStudents: 1195, rate: 95.9 },
  { date: 'May 11', totalStudents: 1245, presentStudents: 1165, rate: 93.6 },
  { date: 'May 12', totalStudents: 1245, presentStudents: 1210, rate: 97.2 },
];

// Financial Data
export const financialData: FinancialRecord[] = [
  { month: 'Jan', collected: 45000, outstanding: 8000, rate: 85 },
  { month: 'Feb', collected: 52000, outstanding: 6500, rate: 89 },
  { month: 'Mar', collected: 58000, outstanding: 5000, rate: 92 },
  { month: 'Apr', collected: 61000, outstanding: 4200, rate: 94 },
  { month: 'May', collected: 65000, outstanding: 3500, rate: 95 },
];

// Performance Distribution for Charts
export const performanceDistribution: ChartDataPoint[] = [
  { name: 'Excellent', value: 385, percentage: 31 },
  { name: 'Good', value: 425, percentage: 34 },
  { name: 'Average', value: 305, percentage: 24 },
  { name: 'At Risk', value: 130, percentage: 10 },
];

// Grade Distribution
export const gradeDistribution: ChartDataPoint[] = [
  { name: 'A (90-100)', value: 220 },
  { name: 'B (80-89)', value: 325 },
  { name: 'C (70-79)', value: 435 },
  { name: 'D (60-69)', value: 195 },
  { name: 'F (Below 60)', value: 70 },
];

// Teacher Ratings
export const teacherRatings: ChartDataPoint[] = [
  { name: 'Mathematics Dept', value: 4.7 },
  { name: 'Science Dept', value: 4.6 },
  { name: 'English Dept', value: 4.8 },
  { name: 'History Dept', value: 4.5 },
  { name: 'Art Dept', value: 4.4 },
];

// Department Distribution
export const departmentDistribution: ChartDataPoint[] = [
  { name: 'Mathematics', value: 18, percentage: 21 },
  { name: 'Science', value: 16, percentage: 19 },
  { name: 'English', value: 20, percentage: 24 },
  { name: 'History', value: 14, percentage: 16 },
  { name: 'Others', value: 17, percentage: 20 },
];

// Monthly Enrollment Trend
export const enrollmentTrend: ChartDataPoint[] = [
  { name: 'Jan', value: 1050 },
  { name: 'Feb', value: 1085 },
  { name: 'Mar', value: 1120 },
  { name: 'Apr', value: 1180 },
  { name: 'May', value: 1245 },
];

// Class Performance
export const classPerformance: ClassPerformance[] = [
  {
    className: 'Class 10-A',
    averageGPA: 3.82,
    studentsCount: 45,
    topStudent: 'Alex Kumar',
    attendance: 96,
  },
  {
    className: 'Class 10-B',
    averageGPA: 3.65,
    studentsCount: 42,
    topStudent: 'Brooklyn Hayes',
    attendance: 94,
  },
  {
    className: 'Class 11-A',
    averageGPA: 3.78,
    studentsCount: 48,
    topStudent: 'Olivia Brown',
    attendance: 95,
  },
  {
    className: 'Class 9-A',
    averageGPA: 3.42,
    studentsCount: 50,
    topStudent: 'Mason White',
    attendance: 92,
  },
];

// GPA Trends by Grade Level
export const gpaTrendByGrade: ChartDataPoint[] = [
  { name: 'Grade 9', value: 3.42 },
  { name: 'Grade 10', value: 3.65 },
  { name: 'Grade 11', value: 3.78 },
  { name: 'Grade 12', value: 3.55 },
];

// Subject Performance
export const subjectPerformance: ChartDataPoint[] = [
  { name: 'Mathematics', value: 78 },
  { name: 'Science', value: 82 },
  { name: 'English', value: 85 },
  { name: 'History', value: 81 },
  { name: 'PE', value: 88 },
];

// Attendance by Class
export const attendanceByClass: ChartDataPoint[] = [
  { name: 'Class 9-A', value: 96 },
  { name: 'Class 9-B', value: 92 },
  { name: 'Class 10-A', value: 97 },
  { name: 'Class 10-B', value: 94 },
  { name: 'Class 11-A', value: 95 },
  { name: 'Class 11-B', value: 93 },
];

// Fee Status
export const feeStatus: ChartDataPoint[] = [
  { name: 'Paid', value: 1050, percentage: 84 },
  { name: 'Partial', value: 125, percentage: 10 },
  { name: 'Outstanding', value: 70, percentage: 6 },
];

// Financial Metrics
export const financialMetrics: MetricCard[] = [
  {
    label: 'Total Fee Collected',
    value: '₹281,000',
    trend: 'up',
    trendValue: '+15%',
  },
  {
    label: 'Outstanding Dues',
    value: '₹23,500',
    trend: 'down',
    trendValue: '-8%',
  },
  {
    label: 'Collection Rate',
    value: '95%',
    trend: 'up',
    trendValue: '+3%',
  },
  {
    label: 'Budget Utilization',
    value: '78%',
    trend: 'neutral',
    trendValue: 'On track',
  },
];
