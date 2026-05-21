'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import AssessmentGrid from '@/components/AssessmentGrid';
import HeaderSelectors from '@/components/SubjectSelector';
import type { Assessment, ClassWithStudentsAndSubjects } from '@/lib/types';
import { Subject } from '@/lib/generated/prisma/client';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '@/lib/store';
import { toast } from 'sonner';
import { setClasses } from '@/lib/store/features/classesSlice';

export default function AssessmentPage() {
  const dispatch = useDispatch();

  const user = useSelector((state: StoreState) => state.user);
  const classes = useSelector((state: StoreState) => state.classes);

  const [selectedClass, setSelectedClass] =
    useState<ClassWithStudentsAndSubjects | null>(null);

  const [selectedSubject, setSelectedSubject] =
    useState<Subject | null>(null);

  const [assessments, setAssessments] =
    useState<Record<string, Assessment>>({});

  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved'
  >('idle');

  const [academicYear, setAcademicYear] = useState('');
  const [academicTerm, setAcademicTerm] = useState('');

  const [loadingClasses, setLoadingClasses] = useState(true);

  // ------------------------------------------------
  // ACCESS CONTROL
  // ------------------------------------------------
  const isTeacher = user.role === 'TEACHER' ;

  /**
   * ONLY approved teachers can edit/save
   * Everyone else can only VIEW
   */
  const canEditAssessments =
    isTeacher &&
    selectedSubject?.teacherId === user.teacherProfile?.id;

  const filteredClasses = useMemo(() => {
    // Admins/staff see all classes
    if (!isTeacher) {
      return classes;
    }

    return classes.filter((cls) => {
      const assignedSubjects =
        cls.subjects?.filter(
          (subject) =>
            subject.teacherId === user.teacherProfile?.id
        ) ?? [];

      // Teacher must teach at least one subject
      return assignedSubjects.length > 0;
    });
  }, [classes, isTeacher, user.teacherProfile?.id]);

  // ------------------------------------------------
  // SUBJECTS
  // ------------------------------------------------
  const subjects = useMemo(() => {
    const allSubjects = selectedClass?.subjects ?? [];

    // Teachers only see assigned subjects
    if (isTeacher) {
    console.log(allSubjects)
      return allSubjects.filter(
        (subject) =>
          subject.teacherId === user.teacherProfile?.id
      );
    }

    return allSubjects;
  }, [selectedClass, isTeacher, user.teacherProfile?.id]);

  // ------------------------------------------------
  // FETCH ASSESSMENTS
  // ------------------------------------------------
  useEffect(() => {
    const fetchClassAssessments = async () => {
      if (!selectedClass?.id || !selectedSubject?.id) return;

      try {
        const response = await fetch(
          `/api/assessments/class/${selectedClass.id}?subjectId=${selectedSubject.id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch assessments');
        }

        const data = await response.json();
        setAssessments(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch assessments');
      }
    };

    fetchClassAssessments();
    setSaveStatus('idle');
  }, [selectedClass?.id, selectedSubject?.id]);

  // ------------------------------------------------
  // FETCH ACTIVE TERM + YEAR
  // ------------------------------------------------
  useEffect(() => {
    const fetchAcademicYearAndTerm = async () => {
      try {
        const response = await fetch('/api/system/active-term');

        if (!response.ok) {
          throw new Error('Failed to fetch active term');
        }

        const data = await response.json();

        setAcademicTerm(`${data.term.termNumber}`);
        setAcademicYear(data.academicYear.year);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch term');
      }
    };

    fetchAcademicYearAndTerm();
  }, []);

  // ------------------------------------------------
  // AUTO SELECT FIRST SUBJECT
  // ------------------------------------------------
  useEffect(() => {
    if (subjects.length > 0) {
      setSelectedSubject(subjects[0]);
    } else {
      setSelectedSubject(null);
    }
  }, [subjects]);

  // ------------------------------------------------
  // AUTO SELECT FIRST CLASS
  // ------------------------------------------------
  useEffect(() => {
    if (
      filteredClasses?.length > 0 &&
      !selectedClass
    ) {
      setSelectedClass(filteredClasses[0]);
    }
  }, [filteredClasses]);

  // ------------------------------------------------
  // CHANGE ASSESSMENT
  // ------------------------------------------------
  const handleAssessmentChange = useCallback(
    (studentId: string, assessment: Assessment) => {
      // BLOCK NON-APPROVED USERS
      if (!canEditAssessments) return;

      setAssessments((prev) => ({
        ...prev,
        [studentId]: assessment,
      }));

      setSaveStatus('idle');
    },
    [canEditAssessments]
  );

  // ------------------------------------------------
  // SAVE
  // ------------------------------------------------
  const handleSave = async () => {
    if (!canEditAssessments) {
      toast.error(
        'You are not allowed to edit this subject assessment'
      );
      return;
    }

    setSaveStatus('saving');

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save');
      }

      toast.success(data.message || 'Saved successfully');

      setTimeout(() => {
        setSaveStatus('saved');
      }, 300);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    }

    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  };

  console.log(selectedClass)

  // ------------------------------------------------
  // SELECTORS
  // ------------------------------------------------
  const handleClassChange = (
    cls: ClassWithStudentsAndSubjects
  ) => {
    setSelectedClass(cls);
  };

  const handleSubjectChange = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  // ------------------------------------------------
  // FETCH CLASSES
  // ------------------------------------------------
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);

        let endpoint = '';

        /**
         * Teachers:
         * only their assigned classes/subjects
         */
        if (isTeacher) {
          endpoint = `/api/classWithStudents/${user.teacherProfile?.id}`;
        }

        /**
         * Admin / Headmaster / Staff:
         * all classes + all subjects
         */
        else {
          endpoint = `/api/classWithStudents/admin/${user.id}`;
        }

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }

        const data = await response.json();

        dispatch(setClasses(data));
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch classes');
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // ------------------------------------------------
  // STATS
  // ------------------------------------------------
  const boys =
    selectedClass?.enrollments?.filter(
      (s) => s.student.gender === 'male'
    ) ?? [];

  const girls =
    selectedClass?.enrollments?.filter(
      (s) => s.student.gender === 'female'
    ) ?? [];

  useEffect(() => {
    console.log({selectedClass,selectedSubject,subjects})
  },[selectedClass,selectedSubject,subjects])

  // ------------------------------------------------
  // LOADING
  // ------------------------------------------------
  if (loadingClasses) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Loading assessments...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* -------------------------------------- */}
        {/* TITLE */}
        {/* -------------------------------------- */}
        <div className="text-center mb-5">
          <h1 className="text-sm md:text-base font-bold tracking-wide">
            SCHOOL BASED ASSESSMENT AT BASIC EDUCATION LEVEL
          </h1>

          <p className="text-xs font-bold underline mt-1">
            TERMLY ASSESSMENT RECORDING SHEET
          </p>
        </div>

        {/* -------------------------------------- */}
        {/* INFO BAR */}
        {/* -------------------------------------- */}
        <div className="border rounded-xl p-4 mb-4 bg-card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <HeaderSelectors
            subjects={subjects}
            selectedSubject={selectedSubject!}
            onSubjectChange={handleSubjectChange}
            classes={filteredClasses!}
            selectedClass={selectedClass!}
            onClassChange={handleClassChange}
          />

          <div className="flex items-center gap-5 text-xs">
            <span>
              <span className="font-bold">TERM:</span>{' '}
              {academicTerm}
            </span>

            <span>
              <span className="font-bold">YEAR:</span>{' '}
              {academicYear}
            </span>
          </div>
        </div>

        {/* -------------------------------------- */}
        {/* ACCESS NOTICE */}
        {/* -------------------------------------- */}
        {!canEditAssessments && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
            View Only Mode — Only the assigned subject teacher can
            edit assessment records.
          </div>
        )}

        {/* -------------------------------------- */}
        {/* STATS */}
        {/* -------------------------------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">

          <div className="flex flex-wrap items-center gap-5 text-xs">
            <span>
              <span className="font-bold">NO. ON ROLL:</span>{' '}
              {selectedClass?.enrollments.length || 0}
            </span>

            <span>
              <span className="font-bold">BOYS:</span>{' '}
              {boys.length}
            </span>

            <span>
              <span className="font-bold">GIRLS:</span>{' '}
              {girls.length}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={
              saveStatus === 'saving' || !canEditAssessments
            }
            className={`px-5 py-2 rounded-md text-xs font-bold border transition-all
              ${
                saveStatus === 'saved'
                  ? 'bg-green-600 text-white border-green-600'
                  : saveStatus === 'saving'
                  ? 'bg-muted text-muted-foreground border-muted'
                  : !canEditAssessments
                  ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                  : 'bg-foreground text-background border-foreground hover:opacity-90'
              }
            `}
          >
            {saveStatus === 'saved'
              ? 'SAVED'
              : saveStatus === 'saving'
              ? 'SAVING...'
              : 'SAVE RECORDS'}
          </button>
        </div>

        {/* -------------------------------------- */}
        {/* GRID */}
        {/* -------------------------------------- */}
        <AssessmentGrid
          students={selectedClass?.enrollments || []}
          selectedSubject={selectedSubject!}
          assessments={assessments}
          onAssessmentChange={handleAssessmentChange}
          classId={selectedClass?.id || ''}
          readOnly={!canEditAssessments}
        />
      </div>
    </main>
  );
}