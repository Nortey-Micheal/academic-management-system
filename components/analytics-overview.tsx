'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  schoolMetrics,
  financialMetrics,
  teachers,
  students,
  attendanceData,
  performanceDistribution,
  gradeDistribution,
  teacherRatings,
  departmentDistribution,
  enrollmentTrend,
  classPerformance,
  gpaTrendByGrade,
  subjectPerformance,
  attendanceByClass,
  feeStatus,
  financialData,
} from '@/lib/mock-data';
import { MetricsGrid } from './dashboard/MetricsGrid';
import { ChartCard } from './dashboard/ChartCard';
import { TableCard } from './dashboard/TableCard';

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#8b5cf6',
  light: '#e5e7eb',
  dark: '#374151',
};

export function AnalyticsOverview() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            School Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Comprehensive school performance and analytics overview
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <MetricsGrid metrics={schoolMetrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Student Performance Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[COLORS.secondary, COLORS.primary, COLORS.warning, COLORS.danger][
                            index % 4
                          ]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Monthly Enrollment Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.primary, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Grade Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.info} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6 mt-6">
            <div>
              <MetricsGrid
                metrics={[
                  {
                    label: 'Total Teachers',
                    value: '85',
                    trend: 'up',
                    trendValue: '+3%',
                  },
                  {
                    label: 'Average Rating',
                    value: '4.6',
                    trend: 'up',
                    trendValue: '+0.2',
                  },
                  {
                    label: 'Avg Students/Teacher',
                    value: '14.6',
                    trend: 'neutral',
                    trendValue: 'Stable',
                  },
                ]}
                columns={3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Teacher Performance Ratings">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teacherRatings}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Classes per Department">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.info, COLORS.danger][
                            index % 5
                          ]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <TableCard
              title="Teacher Performance Details"
              headers={[
                'Name',
                'Department',
                'Classes',
                'Rating',
                'Students',
                'Experience',
              ]}
            >
              {teachers.map((teacher) => (
                <TableRow key={teacher.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="text-slate-900 dark:text-white font-medium">
                    {teacher.name}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {teacher.department}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {teacher.classes}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {teacher.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {teacher.studentsCount}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {teacher.yearsExperience} years
                  </TableCell>
                </TableRow>
              ))}
            </TableCard>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricsGrid
                metrics={[
                  {
                    label: 'Total Students',
                    value: '1,245',
                    trend: 'up',
                    trendValue: '+12%',
                  },
                  {
                    label: 'Average GPA',
                    value: '3.65',
                    trend: 'neutral',
                    trendValue: 'Stable',
                  },
                  {
                    label: 'At Risk Students',
                    value: '130',
                    trend: 'down',
                    trendValue: '-5%',
                  },
                ]}
                columns={1}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="GPA Trends by Grade Level">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={gpaTrendByGrade}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[2, 4]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.primary, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Subject-wise Performance">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.info} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <TableCard
              title="Top Student Performers"
              headers={['Name', 'Grade', 'GPA', 'Total Marks', 'Status', 'Attendance']}
            >
              {students.slice(0, 6).map((student) => (
                <TableRow key={student.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="text-slate-900 dark:text-white font-medium">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {student.grade}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {student.gpa.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {student.totalMarks}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                        student.status === 'excellent'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : student.status === 'good'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : student.status === 'average'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {student.attendanceRate}%
                  </TableCell>
                </TableRow>
              ))}
            </TableCard>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricsGrid
                metrics={[
                  {
                    label: 'Overall Attendance Rate',
                    value: '94.2%',
                    trend: 'up',
                    trendValue: '+2.1%',
                  },
                  {
                    label: 'Average Days Present',
                    value: '47.2',
                    trend: 'up',
                    trendValue: '+1.2',
                  },
                  {
                    label: 'Chronic Absenteeism',
                    value: '45',
                    trend: 'down',
                    trendValue: '-8%',
                  },
                ]}
                columns={1}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Attendance Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[70, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke={COLORS.secondary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.secondary, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Attendance by Class">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceByClass}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.warning} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <TableCard
              title="Recent Attendance Records"
              headers={['Date', 'Total Students', 'Present', 'Rate']}
            >
              {attendanceData.map((record, index) => (
                <TableRow key={index} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="text-slate-900 dark:text-white font-medium">
                    {record.date}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {record.totalStudents}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {record.presentStudents}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {record.rate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableCard>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6 mt-6">
            <MetricsGrid metrics={financialMetrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Monthly Collection Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="collected"
                      stroke={COLORS.secondary}
                      strokeWidth={2}
                      name="Collected"
                    />
                    <Line
                      type="monotone"
                      dataKey="outstanding"
                      stroke={COLORS.danger}
                      strokeWidth={2}
                      name="Outstanding"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Fee Status Breakdown">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={feeStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {feeStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[COLORS.secondary, COLORS.warning, COLORS.danger][index % 3]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <TableCard
              title="Monthly Financial Summary"
              headers={['Month', 'Collected', 'Outstanding', 'Collection Rate']}
            >
              {financialData.map((record, index) => (
                <TableRow key={index} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="text-slate-900 dark:text-white font-medium">
                    {record.month}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    ₹{record.collected.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    ₹{record.outstanding.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {record.rate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
