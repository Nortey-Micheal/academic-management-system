'use client';

import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { ClassWithStudents, StudentWithRelations } from '@/lib/types';
import { toast } from 'sonner';

interface ClassSelectorProps {
  onSelectStudent: (
    student: StudentWithRelations,
    academicYear: string,
    term: number
  ) => void;
  setTerm: Dispatch<SetStateAction<string>>
  setYear: Dispatch<SetStateAction<string>>
}

const ClassSelector: React.FC<ClassSelectorProps> = ({ onSelectStudent, setTerm, setYear }) => {
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // You can later fetch this dynamically from backend
  const academicYears = [
    '2024/2025',
    '2025/2026',
    '2026/2027'
  ];

  const terms = [1, 2, 3];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/classes');
        if (!response.ok) {
          toast.error('Failed to load students data');
        }

        const data = await response.json();
        setClasses(data.classes);

        if (data?.classes?.length! > 0) {
          setSelectedClass(data.classes[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const settingYear = () => {
      setYear(selectedYear)
    }
    const settingTerm = () => {
      setTerm(`${selectedTerm}`)
    }
    if (selectedYear.length > 0) {
      settingYear()
    }
    if (selectedTerm.valueOf() >= 1) {
      settingTerm()
    }
  },[selectedTerm,selectedYear])

  const currentClass = classes?.find(c => c?.id === selectedClass);

  const handleSelectStudent = () => {
    if (!currentClass || !selectedStudent) return;

    const student = currentClass.students.find(
      s => s.id === selectedStudent
    );

    if (student) {
      onSelectStudent(student, selectedYear, selectedTerm);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        Select Student Report
      </h2>

      <div className="space-y-4">

        {/* Academic Year Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Academic Year:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {academicYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Term Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Term:
          </label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {terms.map(term => (
              <option key={term} value={term}>
                Term {term}
              </option>
            ))}
          </select>
        </div>

        {/* Class Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Class:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedStudent('');
            }}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes?.map(cls => (
              <option key={cls.id} value={cls.id}>
                {`Basic ${cls.grade} - ${cls.section}`}
              </option>
            ))}
          </select>
        </div>

        {/* Student Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Student:
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a student --</option>
            {currentClass?.students.map(student => (
              <option key={student.id} value={student.id}>
                {student.user.lastName} {student.user.firstName}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleSelectStudent}
          disabled={!selectedStudent}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
          View Report
        </Button>
      </div>
    </div>
  );
};

export default ClassSelector;