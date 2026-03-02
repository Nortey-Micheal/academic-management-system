'use client';

import { Subject } from '@/lib/generated/prisma/client';
import type { ClassWithStudentsAndSubjects } from '@/lib/types';
import { toast } from 'sonner';

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
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <label htmlFor="class-select" className="font-bold text-foreground text-xs">
          CLASS:
        </label>
        <select
          id="class-select"
          value={selectedClass?.id!}
          onChange={(e) => {
            const cls = classes.find((c) => c.id === e.target.value);
            if (cls) onClassChange(cls);
          }}
          className="px-2 py-1 border border-foreground text-xs font-medium text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {classes.length > 0 && classes?.map((cls) => (
            <option key={cls.id} value={cls.id}>
              Basic {`${cls.grade}`}
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
          value={selectedSubject?.id!}
          onChange={(e) => {
            const subject = subjects.find((s) => s.id === e.target.value);
            if (subject) onSubjectChange(subject);
          }}
          className="px-2 py-1 border border-foreground text-xs font-medium text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {subjects?.map((subject) => (
            <option key={subject?.id!} value={subject?.id!}>
              {subject?.subjectName!}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
