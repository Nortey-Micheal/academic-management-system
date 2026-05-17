'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, FileText } from 'lucide-react'

// Mock assessment data
const mockAssessments = [
  {
    id: '1',
    subject: 'Mathematics',
    type: 'Midterm',
    date: '2024-01-15',
    highestScore: 95,
    lowestScore: 62,
    averageScore: 78.5,
  },
  {
    id: '2',
    subject: 'English Language',
    type: 'Midterm',
    date: '2024-01-14',
    highestScore: 92,
    lowestScore: 58,
    averageScore: 75.2,
  },
  {
    id: '3',
    subject: 'Science',
    type: 'Quiz',
    date: '2024-01-13',
    highestScore: 88,
    lowestScore: 65,
    averageScore: 77.8,
  },
  {
    id: '4',
    subject: 'Social Studies',
    type: 'Assignment',
    date: '2024-01-12',
    highestScore: 98,
    lowestScore: 70,
    averageScore: 82.3,
  },
  {
    id: '5',
    subject: 'Physical Education',
    type: 'Practical',
    date: '2024-01-11',
    highestScore: 90,
    lowestScore: 75,
    averageScore: 84.1,
  },
]

export function AssessmentsTab({ classId }: { classId: string }) {
  return (
    <div className="space-y-6">
      {/* Assessment Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject Assessment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assessment Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Highest Score</TableHead>
                  <TableHead className="text-right">Lowest Score</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">{assessment.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{assessment.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{assessment.date}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {assessment.highestScore}
                    </TableCell>
                    <TableCell className="text-right font-medium text-amber-600">
                      {assessment.lowestScore}
                    </TableCell>
                    <TableCell className="text-right font-medium">{assessment.averageScore}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <FileText className="h-4 w-4" />
                            View Grades
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Class Performance Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-base text-green-900">Class Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-green-700 mb-1">Overall Class Average</p>
              <p className="text-3xl font-bold text-green-900">79.6%</p>
            </div>
            <div>
              <p className="text-sm text-green-700 mb-1">Highest Performer</p>
              <p className="text-lg font-semibold text-green-900">Abena Owusu (96)</p>
            </div>
            <div>
              <p className="text-sm text-green-700 mb-1">Lowest Performer</p>
              <p className="text-lg font-semibold text-green-900">Kwame Amoah (62)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { grade: 'A (90-100)', count: 8, percentage: 21 },
              { grade: 'B (80-89)', count: 14, percentage: 37 },
              { grade: 'C (70-79)', count: 12, percentage: 32 },
              { grade: 'D (60-69)', count: 4, percentage: 10 },
            ].map((item) => (
              <div key={item.grade}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.grade}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.count} students ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
