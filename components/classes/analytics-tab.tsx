'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Mock analytics data
const enrollmentData = [
  { month: 'Jan', enrollment: 32 },
  { month: 'Feb', enrollment: 34 },
  { month: 'Mar', enrollment: 36 },
  { month: 'Apr', enrollment: 37 },
  { month: 'May', enrollment: 38 },
  { month: 'Jun', enrollment: 38 },
]

const genderData = [
  { name: 'Male', value: 18 },
  { name: 'Female', value: 20 },
]

const performanceData = [
  { subject: 'Math', average: 78.5 },
  { subject: 'English', average: 75.2 },
  { subject: 'Science', average: 77.8 },
  { subject: 'Social Studies', average: 82.3 },
  { subject: 'P.E', average: 84.1 },
]

const attendanceData = [
  { week: 'Week 1', percentage: 94.2 },
  { week: 'Week 2', percentage: 96.1 },
  { week: 'Week 3', percentage: 92.8 },
  { week: 'Week 4', percentage: 95.3 },
  { week: 'Week 5', percentage: 94.7 },
]

const COLORS = ['#3b82f6', '#ef4444']

export function AnalyticsTab({ classId }: { classId: string }) {
  return (
    <div className="space-y-6">
      {/* Enrollment Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrollment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enrollment" stroke="#3b82f6" strokeWidth={2} name="Enrolled Students" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class Performance by Subject */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average Performance by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="subject" width={80} fontSize={12} />
                <Tooltip />
                <Bar dataKey="average" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Trends (Weekly)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[80, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="percentage" fill="#f59e0b" name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-base text-purple-900">Analytics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-purple-700 uppercase font-semibold">Current Enrollment</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">38/45</p>
              <p className="text-xs text-purple-600 mt-1">84.4% capacity</p>
            </div>
            <div>
              <p className="text-xs text-purple-700 uppercase font-semibold">Avg Attendance</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">94.6%</p>
              <p className="text-xs text-purple-600 mt-1">Very good</p>
            </div>
            <div>
              <p className="text-xs text-purple-700 uppercase font-semibold">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">79.6%</p>
              <p className="text-xs text-purple-600 mt-1">B grade</p>
            </div>
            <div>
              <p className="text-xs text-purple-700 uppercase font-semibold">Best Subject</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">P.E</p>
              <p className="text-xs text-purple-600 mt-1">84.1% avg</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
