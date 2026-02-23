'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ClassWithStudents, StudentWithRelations } from '@/lib/types';



interface ClassSelectorProps {
  onSelectStudent: (student: StudentWithRelations) => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({ onSelectStudent }) => {
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/classes');
        if (!response.ok) {
          throw new Error('Failed to load students data');
        }
        const data = await response.json();
        setClasses(data.classes);
        if (data.classes.length > 0) {
          setSelectedClass(data.classes[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback error handling
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentClass = classes.find(c => c.id === selectedClass);

  const handleSelectStudent = () => {
    if (currentClass && selectedStudent) {
      const student = currentClass.students.find(s => s.id === selectedStudent);
      if (student) {
        onSelectStudent(student);
      }
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Select Student Report</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedStudent('');
            }}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {`Basic ${cls.grade}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Student:</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a student --</option>
            {currentClass?.students.map(student => (
              <option key={student.id} value={student.id}>
                {student.user.lastName + ' ' + student.user.firstName}
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
