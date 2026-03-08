'use client';

import { useState, useEffect, useCallback } from 'react';
import AssessmentGrid from '@/components/AssessmentGrid';
import HeaderSelectors from '@/components/SubjectSelector';
import type { Assessment, ClassWithStudentsAndSubjects } from '@/lib/types';
import { Subject } from '@/lib/generated/prisma/client';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '@/lib/store';
import { toast } from 'sonner';
import { setClasses } from '@/lib/store/features/classesSlice';


export default function AssessmentPage() {
  const classes = useSelector((state:StoreState) => state.classes)
  const [selectedClass, setSelectedClass] = useState<ClassWithStudentsAndSubjects | null>(classes[0]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [assessments, setAssessments] = useState<Record<string, Assessment>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const user = useSelector((state:StoreState) => state.user)
  const dispatch = useDispatch()
  const [academicYear,setAcademicYear] = useState<string>('')
  const [academicTerm,setAcademicTerm] = useState<string>('')
  const subjects = selectedClass?.subjects ?? []

  // Load data when class or subject changes
  useEffect(() => {
    const fetchClassAssessments = async () => {
      if (!selectedClass?.id || !selectedSubject?.id) {
        return 
      }
      try {
        const response = await fetch(
          `/api/assessments/class/${selectedClass?.id}?subjectId=${selectedSubject?.id}`
        )
        const data = await response.json()
        setAssessments(data)
      } catch (error:any) {
        toast.error(error)
      }
    }
    fetchClassAssessments()
    setSaveStatus('idle');
  }, [selectedClass?.id,selectedSubject?.id]);

  //Get academic year and term
  useEffect(() => {
    const fetchAcademicYearAndTerm = async () => {
      try {
        const response = await fetch('/api/system/active-term')
        const data = await response.json()
        setAcademicTerm(`${data.term.termNumber}`)
        setAcademicYear(data.academicYear.year)
      } catch (error:any) {
        toast.error(error)
      }
      
    }
    fetchAcademicYearAndTerm()
  },[])

  useEffect(() => {
    if (!selectedClass) return;

    if (selectedClass.subjects && selectedClass.subjects.length > 0) {
      setSelectedSubject(selectedClass.subjects[0]);
    } else {
      setSelectedSubject(null);
    }
  }, [selectedClass?.id, selectedClass?.subjects]);

  useEffect(() => {
    if (classes && classes.length > 0) {
      setSelectedClass(classes[0])
    }
  }, [classes])

  const handleAssessmentChange = useCallback((studentId: string, assessment: Assessment) => {
    setAssessments((prev) => ({ ...prev, [studentId]: assessment }));
    setSaveStatus('idle');
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/assessments',{
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessments })
      })
      const data = await response.json()
      toast.success(data.message)
      setTimeout(() => setSaveStatus('saved'), 300);
    } catch (error:any) {
      toast.error(error)
    }
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleClassChange = (cls: ClassWithStudentsAndSubjects) => {
    setSelectedClass(cls);
  };

  const handleSubjectChange = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  useEffect(() => {
    const fetchClasses = async() => {
      try {
          const response = await fetch(`/api/classWithStudents/${user.teacherProfile?.id}`)
          const data = await response.json()
          dispatch(setClasses(data))
      } catch (error:any) {
          toast.error(error)
      }
    }
    fetchClasses()
  },[])

  useEffect(() => {
    console.log({selectedClass,selectedSubject})
  },[selectedClass])

  const boys = selectedClass?.students?.filter((s) => s.gender === 'male');
  const girls = selectedClass?.students?.filter((s) => s.gender === 'female');

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
            classes={classes!}
            selectedClass={selectedClass!}
            onClassChange={handleClassChange}
          />

          <div className="flex items-center gap-4 text-xs">
            <span className="text-foreground">
              <span className="font-bold">TERM:</span> {academicTerm}
            </span>
            <span className="text-foreground">
              <span className="font-bold">YEAR:</span> {academicYear}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 text-xs text-foreground">
          <div className="flex items-center gap-6">
            <span>
              <span className="font-bold">NO. ON ROLL:</span> {selectedClass?.students.length}
            </span>
            <span>
              <span className="font-bold">BOYS:</span> {boys?.length!}
            </span>
            <span>
              <span className="font-bold">GIRLS:</span> {girls?.length!}
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
          students={selectedClass?.students!}
          selectedSubject={selectedSubject!}
          assessments={assessments}
          onAssessmentChange={handleAssessmentChange}
          classId={selectedClass?.id!}
        />
      </div>
    </main>
  );
}
