'use client';

import React, { useEffect, useState } from 'react';
import ClassSelector from '@/components/ClassSelector';
import ReportCard from '@/components/ReportCard';
import { StudentReport, StudentWithRelations } from '@/lib/types';

export default function ReportCardGenerator() {
  // store just the selected student ID
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentReport, setStudentReport] = useState<StudentReport | null>(null);
  const [term, setTerm] = useState<string>('')
  const [year, setYear] = useState<string>('')

  // fetch the report when a student ID is set
  useEffect(() => {
    if (!selectedStudentId) return; // only fetch if ID exists

    const fetchStudentReport = async () => {
      try {
        const response = await fetch(`/api/report/${selectedStudentId}?term=${term}&year=${year}`);
        if (!response.ok) throw new Error('Failed to fetch report');
        const data: StudentReport = await response.json();
        setStudentReport(data);
      } catch (error) {
        console.error('Error fetching student report:', error);
      }
    };

    fetchStudentReport();
  }, [selectedStudentId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {!selectedStudentId ? (
          <div className="flex justify-center">
            <ClassSelector onSelectStudent={(student) => setSelectedStudentId(student.id)} setTerm={setTerm} setYear={setYear}/>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedStudentId(null);
                setStudentReport(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Selection
            </button>

            {studentReport ? (
              <ReportCard 
                student={studentReport}
                schoolLogo="https://via.placeholder.com/100?text=School+Logo"
                headteacherSignature="https://via.placeholder.com/150x80?text=Signature"
              />
            ) : (
              <p>Loading student report...</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}