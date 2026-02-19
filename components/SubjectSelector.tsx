'use client';

import type { Subject, SchoolClass } from '@/lib/types';

interface Props {
  subjects: Subject[];
  selectedSubject: Subject;
  onSubjectChange: (subject: Subject) => void;
  classes: SchoolClass[];
  selectedClass: SchoolClass;
  onClassChange: (cls: SchoolClass) => void;
}

export default function HeaderSelectors({
  subjects,
  selectedSubject,
  onSubjectChange,
  classes,
  selectedClass,
  onClassChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <label htmlFor="class-select" className="font-bold text-foreground text-xs">
          CLASS:
        </label>
        <select
          id="class-select"
          value={selectedClass.id}
          onChange={(e) => {
            const cls = classes.find((c) => c.id === e.target.value);
            if (cls) onClassChange(cls);
          }}
          className="px-2 py-1 border border-foreground text-xs font-medium text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="subject-select" className="font-bold text-foreground text-xs">
          SUBJECT:
        </label>
        <select
          id="subject-select"
          value={selectedSubject.id}
          onChange={(e) => {
            const subject = subjects.find((s) => s.id === e.target.value);
            if (subject) onSubjectChange(subject);
          }}
          className="px-2 py-1 border border-foreground text-xs font-medium text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
