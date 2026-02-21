'use client';

import { useState } from 'react';
import ScoreCell from './ScoreCell';
import { DEFAULT_WEIGHTS, getCalculatedValues, getWeightsTotal } from '@/lib/calculations';
import type { Assessment, TaskWeights, StudentWithRelations } from '@/lib/types';
import { Subject } from '@/lib/generated/prisma/client';

interface Props {
  students: StudentWithRelations[];
  selectedSubject: Subject;
  assessments: Record<string, Assessment>;
  onAssessmentChange: (studentId: string, assessment: Assessment) => void;
}

export default function AssessmentGrid({ students, selectedSubject, assessments, onAssessmentChange }: Props) {
  const [weights, setWeights] = useState<TaskWeights>({ ...DEFAULT_WEIGHTS });
  const weightsTotal = getWeightsTotal(weights);
  const weightsValid = weightsTotal === 100;

  const boys = students?.filter((s) => s.gender === 'male') || [];
  const girls = students?.filter((s) => s.gender === 'female') || [];
  // const allStudents = [...boys, ...girls];

  const getOrCreateAssessment = (studentId: string): Assessment => {
    return assessments[studentId] || {
      studentId,
      subjectId: selectedSubject?.id!,
      test1: 0,
      groupWork: 0,
      test2: 0,
      project: 0,
      exam: 0,
    };
  };

  const handleScoreChange = (studentId: string, field: keyof Assessment, value: number) => {
    const assessment = getOrCreateAssessment(studentId);
    const updated = { ...assessment, [field]: value };
    onAssessmentChange(studentId, updated);
  };

  const handleWeightChange = (field: keyof TaskWeights, value: string) => {
    const num = parseInt(value) || 0;
    setWeights((prev) => ({ ...prev, [field]: Math.max(0, num) }));
  };

  const renderStudentRow = (student: StudentWithRelations, displayIndex: number) => {
    const assessment = getOrCreateAssessment(student?.id!);
    const { taskSubtotal, taskPercent, examPercent, totalScore, grade } = getCalculatedValues(assessment, weights);

    return (
      <tr key={student.id} className="border border-foreground/30">
        <td className="border border-foreground/30 px-1 py-0.5 text-center w-8">{displayIndex}</td>
        <td className="border border-foreground/30 px-2 py-0.5 text-left truncate max-w-[160px]" title={student.user?.lastName! + " " + student.user?.firstName!}>
          {student.user?.lastName! + " " + student.user?.firstName!}
        </td>
        <td className="border border-foreground/30 p-0 text-center w-14">
          <ScoreCell value={assessment.test1} max={weights.test1} onChange={(v) => handleScoreChange(student.id, 'test1', v)} />
        </td>
        <td className="border border-foreground/30 p-0 text-center w-14">
          <ScoreCell value={assessment.groupWork} max={weights.groupWork} onChange={(v) => handleScoreChange(student.id, 'groupWork', v)} />
        </td>
        <td className="border border-foreground/30 p-0 text-center w-14">
          <ScoreCell value={assessment.test2} max={weights.test2} onChange={(v) => handleScoreChange(student.id, 'test2', v)} />
        </td>
        <td className="border border-foreground/30 p-0 text-center w-14">
          <ScoreCell value={assessment.project} max={weights.project} onChange={(v) => handleScoreChange(student.id, 'project', v)} />
        </td>
        <td className="border border-foreground/30 px-1 py-0.5 text-center text-xs font-medium bg-secondary w-14">
          {taskSubtotal || ''}
        </td>
        <td className="border border-foreground/30 px-1 py-0.5 text-center text-xs font-medium bg-secondary w-14">
          {taskPercent ? taskPercent.toFixed(1) : ''}
        </td>
        <td className="border border-foreground/30 p-0 text-center w-14">
          <ScoreCell value={assessment.exam} max={100} onChange={(v) => handleScoreChange(student.id, 'exam', v)} />
        </td>
        <td className="border border-foreground/30 px-1 py-0.5 text-center text-xs font-medium bg-secondary w-14">
          {examPercent ? examPercent.toFixed(1) : ''}
        </td>
        <td className="border border-foreground/30 px-1 py-0.5 text-center text-xs font-bold bg-secondary w-14">
          {totalScore || ''}
        </td>
        <td className="border border-foreground/30 px-1 py-0.5 text-center text-xs font-bold bg-secondary w-10">
          {grade}
        </td>
      </tr>
    );
  };

  const renderSectionHeader = (label: string) => (
    <tr className="border border-foreground/30">
      <td className="border border-foreground/30 px-1 py-1" />
      <td className="border border-foreground/30 px-2 py-1 text-xs font-bold italic text-foreground" colSpan={11}>
        {label}
      </td>
    </tr>
  );

  let rowNum = 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-2 border-foreground text-foreground">
        <thead>
          {/* Main header row */}
          <tr className="border-2 border-foreground bg-background">
            <th className="border border-foreground px-1 py-1 text-[10px] font-bold text-center w-8" rowSpan={2}>
              NO.
            </th>
            <th className="border border-foreground px-1 py-1 text-[10px] font-bold text-left max-w-[160px]" rowSpan={2}>
              NAME OF PUPIL
            </th>
            <th className="border border-foreground px-1 py-1 text-[10px] font-bold text-center" colSpan={4}>
              TASKS
            </th>
            <th className="border border-foreground px-1 py-1 text-[10px] font-bold text-center w-14" rowSpan={2}>
              SUB<br />TOT<br />({weightsTotal})
            </th>
            <th className="border border-foreground px-1 py-1 text-[10px] font-bold text-center w-14" rowSpan={2}>
              (A)<br />50%
            </th>
            <th className="border border-foreground px-1 py-1 text-[10px] font-bold text-center w-14" rowSpan={2}>
              TERM<br />EXAM<br />(100)
            </th>
            <th className="border border-foreground px-1 py-1 text-[10px] font-bold text-center w-14" rowSpan={2}>
              (B)<br />50%
            </th>
            <th className="border border-foreground px-1 py-1 text-[10px] font-bold text-center w-14" rowSpan={2}>
              TOTAL<br />(A+B)
            </th>
            <th className="border border-foreground px-1 py-1 text-[10px] font-bold text-center w-10" rowSpan={2}>
              GRADE
            </th>
          </tr>
          {/* Sub header for tasks */}
          <tr className="border border-foreground bg-background">
            <th className="border border-foreground px-1 py-0.5 text-[10px] font-bold text-center w-14">
              Test 1
            </th>
            <th className="border border-foreground px-1 py-0.5 text-[10px] font-bold text-center w-14">
              Group<br />Work
            </th>
            <th className="border border-foreground px-1 py-0.5 text-[10px] font-bold text-center w-14">
              Test 2
            </th>
            <th className="border border-foreground px-1 py-0.5 text-[10px] font-bold text-center w-14">
              Project
            </th>
          </tr>
          {/* Editable max values row */}
          <tr className={`border border-foreground ${weightsValid ? 'bg-secondary' : 'bg-destructive/10'}`}>
            <td className="border border-foreground px-1 py-0.5 text-[10px] text-center text-muted-foreground" colSpan={2}>
              <span className="font-bold">Max:</span>
              {!weightsValid && (
                <span className="ml-1 text-destructive font-bold">
                  {'(must = 100, now ' + weightsTotal + ')'}
                </span>
              )}
            </td>
            <td className="border border-foreground p-0 text-center w-14">
              <input
                type="number"
                value={weights.test1}
                onChange={(e) => handleWeightChange('test1', e.target.value)}
                className="w-full text-center text-[11px] font-bold bg-transparent border-0 outline-none p-1 text-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </td>
            <td className="border border-foreground p-0 text-center w-14">
              <input
                type="number"
                value={weights.groupWork}
                onChange={(e) => handleWeightChange('groupWork', e.target.value)}
                className="w-full text-center text-[11px] font-bold bg-transparent border-0 outline-none p-1 text-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </td>
            <td className="border border-foreground p-0 text-center w-14">
              <input
                type="number"
                value={weights.test2}
                onChange={(e) => handleWeightChange('test2', e.target.value)}
                className="w-full text-center text-[11px] font-bold bg-transparent border-0 outline-none p-1 text-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </td>
            <td className="border border-foreground p-0 text-center w-14">
              <input
                type="number"
                value={weights.project}
                onChange={(e) => handleWeightChange('project', e.target.value)}
                className="w-full text-center text-[11px] font-bold bg-transparent border-0 outline-none p-1 text-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </td>
            <td className="border border-foreground px-1 py-0.5 text-center text-[11px] font-bold text-foreground">
              {weightsTotal}
            </td>
            <td className="border border-foreground px-1 py-0.5 text-center text-[10px] text-muted-foreground">50%</td>
            <td className="border border-foreground px-1 py-0.5 text-center text-[11px] font-bold text-foreground">100</td>
            <td className="border border-foreground px-1 py-0.5 text-center text-[10px] text-muted-foreground">50%</td>
            <td className="border border-foreground px-1 py-0.5 text-center text-[10px] text-muted-foreground">100</td>
            <td className="border border-foreground px-1 py-0.5 text-center text-[10px] text-muted-foreground" />
          </tr>
        </thead>
        <tbody>
          {/* Boys section */}
          {boys.length > 0 && renderSectionHeader('Boys')}
          {boys.map((student) => {
            rowNum++;
            return renderStudentRow(student, rowNum);
          })}

          {/* Girls section */}
          {girls.length > 0 && renderSectionHeader('Girls')}
          {girls.map((student) => {
            rowNum++;
            return renderStudentRow(student, rowNum);
          })}
        </tbody>
      </table>
    </div>
  );
}
