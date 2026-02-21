'use client';

import React, { useState } from 'react';
import ClassSelector from '@/components/ClassSelector';
import ReportCard from '@/components/ReportCard';

interface Student {
  id: string;
  name: string;
  age: number;
  attendance: string;
  term: string;
  academicPeriod: string;
  termEnding: string;
  nextTermBegins: string;
  promotedTo: string;
  conduct: string;
  attitude: string;
  classTeacherRemark: string;
  subjects: any[];
}

export default function ReportCardGenerator() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {!selectedStudent ? (
          <div className="flex justify-center">
            <ClassSelector onSelectStudent={setSelectedStudent} />
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Selection
            </button>
            
            <ReportCard 
              student={selectedStudent}
              schoolLogo="https://via.placeholder.com/100?text=School+Logo"
              headteacherSignature="https://via.placeholder.com/150x80?text=Signature"
            />
          </div>
        )}
      </div>
    </main>
  );
}
