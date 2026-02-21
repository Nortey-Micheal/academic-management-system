'use client';

import { useState, useEffect, useCallback } from 'react';
import AssessmentGrid from '@/components/AssessmentGrid';
import HeaderSelectors from '@/components/SubjectSelector';
import { CLASSES } from '@/lib/mockData';
import type { SchoolClass, Assessment } from '@/lib/types';
import { Subject } from '@/lib/generated/prisma/client';

function getStorageKey(classId: string, subjectId: string) {
  return `assess_${classId}_${subjectId}`;
}

export default function AssessmentPage() {
  const [selectedClass, setSelectedClass] = useState<SchoolClass>(CLASSES[0]);
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [assessments, setAssessments] = useState<Record<string, Assessment>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load data when class or subject changes
  useEffect(() => {
    const key = getStorageKey(selectedClass.id, selectedSubject?.id!);
    const stored = localStorage.getItem(key);
    if (stored) {
      setAssessments(JSON.parse(stored));
    } else {
      setAssessments({});
    }
    setSaveStatus('idle');
  }, [selectedClass, selectedSubject]);

  const handleAssessmentChange = useCallback((studentId: string, assessment: Assessment) => {
    setAssessments((prev) => ({ ...prev, [studentId]: assessment }));
    setSaveStatus('idle');
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    const key = getStorageKey(selectedClass.id, selectedSubject?.id!);
    localStorage.setItem(key, JSON.stringify(assessments));
    setTimeout(() => setSaveStatus('saved'), 300);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleClassChange = (cls: SchoolClass) => {
    setSelectedClass(cls);
  };

  const handleSubjectChange = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  useEffect(() => {
    const fetchSubjects = async() => {
        try {
            const subjects: Subject[] = await (await fetch('/api/subjects')).json()
            setSubjects(subjects)
        } catch (error) {
            
        }
    }
  },[])

  const boys = selectedClass.students.filter((s) => s.gender === 'male');
  const girls = selectedClass.students.filter((s) => s.gender === 'female');

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-sm md:text-base font-bold text-foreground tracking-wide">
            SCHOOL BASED ASSESSMENT AT BASIC EDUCATION LEVEL
          </h1>
          <p className="text-xs font-bold text-foreground underline">
            TERMLY ASSESSMENT RECORDING SHEET
          </p>
        </div>

        {/* Info bar */}
        <div className="border border-foreground/30 p-3 mb-4 flex flex-wrap items-center justify-between gap-4">
          <HeaderSelectors
            subjects={subjects}
            selectedSubject={selectedSubject!}
            onSubjectChange={handleSubjectChange}
            classes={CLASSES}
            selectedClass={selectedClass}
            onClassChange={handleClassChange}
          />

          <div className="flex items-center gap-4 text-xs">
            <span className="text-foreground">
              <span className="font-bold">TERM:</span> 1
            </span>
            <span className="text-foreground">
              <span className="font-bold">YEAR:</span> 2025
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 text-xs text-foreground">
          <div className="flex items-center gap-6">
            <span>
              <span className="font-bold">NO. ON ROLL:</span> {selectedClass.students.length}
            </span>
            <span>
              <span className="font-bold">BOYS:</span> {boys.length}
            </span>
            <span>
              <span className="font-bold">GIRLS:</span> {girls.length}
            </span>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`px-4 py-1.5 text-xs font-bold border transition-colors ${
              saveStatus === 'saved'
                ? 'bg-green-600 text-white border-green-600'
                : saveStatus === 'saving'
                  ? 'bg-muted text-muted-foreground border-muted'
                  : 'bg-foreground text-background border-foreground hover:bg-foreground/80'
            }`}
          >
            {saveStatus === 'saved' ? 'SAVED' : saveStatus === 'saving' ? 'SAVING...' : 'SAVE RECORDS'}
          </button>
        </div>

        {/* Grid */}
        <AssessmentGrid
          students={selectedClass.students}
          selectedSubject={selectedSubject!}
          assessments={assessments}
          onAssessmentChange={handleAssessmentChange}
        />
      </div>
    </main>
  );
}
