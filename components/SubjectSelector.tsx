'use client';

import { useMemo } from 'react';
import { Subject } from '@/lib/generated/prisma/client';
import type { ClassWithStudentsAndSubjects } from '@/lib/types';

interface Props {
  subjects: Subject[];
  selectedSubject: Subject;
  onSubjectChange: (subject: Subject) => void;
  classes: ClassWithStudentsAndSubjects[];
  selectedClass: ClassWithStudentsAndSubjects;
  onClassChange: (cls: ClassWithStudentsAndSubjects) => void;
}

export default function HeaderSelectors({
  subjects,
  selectedSubject,
  onSubjectChange,
  classes,
  selectedClass,
  onClassChange,
}: Props) {

  // ------------------------------------------------
  // SORT CLASSES BY GRADE
  // ------------------------------------------------
  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      // sort by grade first
      if (a.grade !== b.grade) {
        return a.grade - b.grade;
      }

      // optional: sort sections alphabetically
      return a.section.localeCompare(b.section);
    });
  }, [classes]);

  // ------------------------------------------------
  // SORT SUBJECTS ALPHABETICALLY
  // ------------------------------------------------
  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) =>
      a.subjectName.localeCompare(b.subjectName)
    );
  }, [subjects]);

  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">

      {/* CLASS SELECT */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="class-select"
          className="font-bold text-foreground text-xs"
        >
          CLASS:
        </label>

        <select
          id="class-select"
          value={selectedClass?.id || ''}
          onChange={(e) => {
            const cls = sortedClasses.find(
              (c) => c.id === e.target.value
            );

            if (cls) {
              onClassChange(cls);
            }
          }}
          className="px-2 py-1 border border-foreground text-xs font-medium text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {sortedClasses.map((cls) => (
            <option key={cls.id} value={cls.id}>
              Basic {cls.grade}
              {cls.section ? ` ${cls.section}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* SUBJECT SELECT */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="subject-select"
          className="font-bold text-foreground text-xs"
        >
          SUBJECT:
        </label>

        <select
          id="subject-select"
          value={selectedSubject?.id || ''}
          onChange={(e) => {
            const subject = sortedSubjects.find(
              (s) => s.id === e.target.value
            );

            if (subject) {
              onSubjectChange(subject);
            }
          }}
          className="w-full px-2 py-1 border border-foreground text-xs font-medium text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {sortedSubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subjectName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}