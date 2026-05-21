'use client';

import { useState } from 'react';
import ScoreCell from './ScoreCell';
import {
  DEFAULT_WEIGHTS,
  getCalculatedValues,
  getWeightsTotal,
} from '@/lib/calculations';

import type {
  Assessment,
  TaskWeights,
  StudentWithRelations,
} from '@/lib/types';

import { Subject } from '@/lib/generated/prisma/client';

interface Props {
  students: {
    student: StudentWithRelations
  }[];
  selectedSubject: Subject;
  assessments: Record<string, Assessment>;
  onAssessmentChange: (
    studentId: string,
    assessment: Assessment
  ) => void;
  classId: string;

  /**
   * NEW
   * controls editing access
   */
  readOnly?: boolean;
}

export default function AssessmentGrid({
  students,
  selectedSubject,
  assessments,
  onAssessmentChange,
  classId,
  readOnly,
}: Props) {

  const [weights, setWeights] = useState<TaskWeights>({
    ...DEFAULT_WEIGHTS,
  });

  const weightsTotal = getWeightsTotal(weights);

  console.log({students})

  const weightsValid = weightsTotal === 100;

  const boys =
    students?.filter((s) => s.student.gender === 'male') || [];

  const girls =
    students?.filter((s) => s.student.gender === 'female') || [];

  // ------------------------------------------------
  // GET OR CREATE
  // ------------------------------------------------
  const getOrCreateAssessment = (
    studentId: string
  ): Assessment => {
    return (
      assessments?.[studentId] || {
        studentId,
        subjectId: selectedSubject?.id!,
        test1: 0,
        groupWork: 0,
        test2: 0,
        project: 0,
        exam: 0,
        classId,
      }
    );
  };

  // ------------------------------------------------
  // CHANGE SCORE
  // ------------------------------------------------
  const handleScoreChange = (
    studentId: string,
    field: keyof Assessment,
    value: number
  ) => {

    /**
     * BLOCK EDITS
     */
    if (readOnly) return;

    const assessment = getOrCreateAssessment(studentId);

    const updated = {
      ...assessment,
      [field]: value,
    };

    onAssessmentChange(studentId, updated);
  };

  // ------------------------------------------------
  // CHANGE WEIGHTS
  // ------------------------------------------------
  const handleWeightChange = (
    field: keyof TaskWeights,
    value: string
  ) => {

    /**
     * BLOCK EDITS
     */
    if (readOnly) return;

    const num = parseInt(value) || 0;

    setWeights((prev) => ({
      ...prev,
      [field]: Math.max(0, num),
    }));
  };

  // ------------------------------------------------
  // STUDENT ROW
  // ------------------------------------------------
  const renderStudentRow = (
    student: StudentWithRelations,
    displayIndex: number
  ) => {

    const assessment = getOrCreateAssessment(student.id);

    const {
      taskSubtotal,
      taskPercent,
      examPercent,
      totalScore,
      grade,
    } = getCalculatedValues(assessment, weights);

    return (
      <tr
        key={student.id}
        className="border border-border hover:bg-muted/20 transition-colors"
      >

        {/* NUMBER */}
        <td className="border border-border px-1 py-1 text-center w-8 text-xs">
          {displayIndex}
        </td>

        {/* NAME */}
        <td
          className="border border-border px-2 py-1 text-left text-xs font-medium truncate max-w-[180px]"
          title={`${student.user?.lastName} ${student.user?.firstName}`}
        >
          {student.user?.lastName} {student.user?.firstName}
        </td>

        {/* TEST 1 */}
        <td className="border border-border p-0 text-center w-14">
          <ScoreCell
            value={assessment.test1}
            max={weights.test1}
            onChange={(v) =>
              handleScoreChange(student.id, 'test1', v)
            }
            disabled={readOnly!}
          />
        </td>

        {/* GROUP WORK */}
        <td className="border border-border p-0 text-center w-14">
          <ScoreCell
            value={assessment.groupWork}
            max={weights.groupWork}
            onChange={(v) =>
              handleScoreChange(student.id, 'groupWork', v)
            }
            disabled={readOnly!}
          />
        </td>

        {/* TEST 2 */}
        <td className="border border-border p-0 text-center w-14">
          <ScoreCell
            value={assessment.test2}
            max={weights.test2}
            onChange={(v) =>
              handleScoreChange(student.id, 'test2', v)
            }
            disabled={readOnly!}
          />
        </td>

        {/* PROJECT */}
        <td className="border border-border p-0 text-center w-14">
          <ScoreCell
            value={assessment.project}
            max={weights.project}
            onChange={(v) =>
              handleScoreChange(student.id, 'project', v)
            }
            disabled={readOnly!}
          />
        </td>

        {/* SUBTOTAL */}
        <td className="border border-border px-1 py-1 text-center text-xs font-semibold bg-muted/30 w-14">
          {taskSubtotal || ''}
        </td>

        {/* TASK % */}
        <td className="border border-border px-1 py-1 text-center text-xs font-semibold bg-muted/30 w-14">
          {taskPercent ? taskPercent.toFixed(1) : ''}
        </td>

        {/* EXAM */}
        <td className="border border-border p-0 text-center w-14">
          <ScoreCell
            value={assessment.exam}
            max={100}
            onChange={(v) =>
              handleScoreChange(student.id, 'exam', v)
            }
            disabled={readOnly!}
          />
        </td>

        {/* EXAM % */}
        <td className="border border-border px-1 py-1 text-center text-xs font-semibold bg-muted/30 w-14">
          {examPercent ? examPercent.toFixed(1) : ''}
        </td>

        {/* TOTAL */}
        <td className="border border-border px-1 py-1 text-center text-xs font-bold bg-muted/40 w-14">
          {totalScore || ''}
        </td>

        {/* GRADE */}
        <td className="border border-border px-1 py-1 text-center text-xs font-bold bg-muted/40 w-10">
          {grade}
        </td>
      </tr>
    );
  };

  // ------------------------------------------------
  // SECTION HEADER
  // ------------------------------------------------
  const renderSectionHeader = (label: string) => (
    <tr className="bg-muted/40">
      <td className="border border-border px-1 py-2" />

      <td
        className="border border-border px-3 py-2 text-xs font-bold uppercase tracking-wide"
        colSpan={11}
      >
        {label}
      </td>
    </tr>
  );

  let rowNum = 0;

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">

      {/* READ ONLY NOTICE */}
      {readOnly && (
        <div className="px-4 py-3 border-b bg-amber-50 text-amber-700 text-sm">
          You are in view-only mode.
        </div>
      )}

      <table className="w-full border-collapse text-foreground min-w-[1000px]">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}
        <thead>

          {/* TOP HEADER */}
          <tr className="bg-muted/60">
            <th
              className="border border-border px-1 py-2 text-[10px] font-bold text-center w-8"
              rowSpan={2}
            >
              NO.
            </th>

            <th
              className="border border-border px-2 py-2 text-[10px] font-bold text-left max-w-[180px]"
              rowSpan={2}
            >
              NAME OF STUDENT
            </th>

            <th
              className="border border-border px-1 py-2 text-[10px] font-bold text-center"
              colSpan={4}
            >
              TASKS
            </th>

            <th
              className="border border-border px-1 py-2 text-[10px] font-bold text-center w-14"
              rowSpan={2}
            >
              SUB
              <br />
              TOTAL
            </th>

            <th
              className="border border-border px-1 py-2 text-[10px] font-bold text-center w-14"
              rowSpan={2}
            >
              (A)
              <br />
              50%
            </th>

            <th
              className="border border-border px-1 py-2 text-[10px] font-bold text-center w-14"
              rowSpan={2}
            >
              EXAM
              <br />
              (100)
            </th>

            <th
              className="border border-border px-1 py-2 text-[10px] font-bold text-center w-14"
              rowSpan={2}
            >
              (B)
              <br />
              50%
            </th>

            <th
              className="border border-border px-1 py-2 text-[10px] font-bold text-center w-14"
              rowSpan={2}
            >
              TOTAL
            </th>

            <th
              className="border border-border px-1 py-2 text-[10px] font-bold text-center w-10"
              rowSpan={2}
            >
              GRADE
            </th>
          </tr>

          {/* TASK HEADER */}
          <tr className="bg-muted/40">
            <th className="border border-border px-1 py-1 text-[10px] font-bold text-center w-14">
              Test 1
            </th>

            <th className="border border-border px-1 py-1 text-[10px] font-bold text-center w-14">
              Group
              <br />
              Work
            </th>

            <th className="border border-border px-1 py-1 text-[10px] font-bold text-center w-14">
              Test 2
            </th>

            <th className="border border-border px-1 py-1 text-[10px] font-bold text-center w-14">
              Project
            </th>
          </tr>

          {/* WEIGHT ROW */}
          <tr
            className={`${
              weightsValid
                ? 'bg-muted/20'
                : 'bg-destructive/10'
            }`}
          >

            <td
              className="border border-border px-2 py-1 text-[10px] text-center"
              colSpan={2}
            >
              <span className="font-bold">Max Scores</span>

              {!weightsValid && (
                <span className="ml-2 text-destructive font-bold">
                  Total must equal 100
                </span>
              )}
            </td>

            {(
              [
                'test1',
                'groupWork',
                'test2',
                'project',
              ] as (keyof TaskWeights)[]
            ).map((field) => (
              <td
                key={field}
                className="border border-border p-0 text-center"
              >
                <input
                  type="number"
                  value={weights[field]}
                  onChange={(e) =>
                    handleWeightChange(
                      field,
                      e.target.value
                    )
                  }
                  disabled={readOnly}
                  className={`
                    w-full p-1 text-center text-[11px]
                    bg-transparent border-0 outline-none
                    font-semibold
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  `}
                />
              </td>
            ))}

            <td className="border border-border px-1 py-1 text-center text-[11px] font-bold">
              {weightsTotal}
            </td>

            <td className="border border-border px-1 py-1 text-center text-[10px]">
              50%
            </td>

            <td className="border border-border px-1 py-1 text-center text-[11px] font-bold">
              100
            </td>

            <td className="border border-border px-1 py-1 text-center text-[10px]">
              50%
            </td>

            <td className="border border-border px-1 py-1 text-center text-[10px]">
              100
            </td>

            <td className="border border-border" />
          </tr>
        </thead>

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}
        <tbody>

          {/* BOYS */}
          {boys.length > 0 &&
            renderSectionHeader('Boys')}

          {boys.map((student) => {
            rowNum++;
            return renderStudentRow(student.student, rowNum);
          })}

          {/* GIRLS */}
          {girls.length > 0 &&
            renderSectionHeader('Girls')}

          {girls.map((student) => {
            rowNum++;
            return renderStudentRow(student.student, rowNum);
          })}
        </tbody>
      </table>
    </div>
  );
}