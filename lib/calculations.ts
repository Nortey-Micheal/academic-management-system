import type { Assessment, TaskWeights } from './types';

// Default task weights - must sum to 100
export const DEFAULT_WEIGHTS: TaskWeights = {
  test1: 30,
  groupWork: 20,
  test2: 30,
  project: 20,
};

/**
 * Validate that task weights sum to exactly 100
 */
export function validateWeights(weights: TaskWeights): boolean {
  const sum = weights.test1 + weights.groupWork + weights.test2 + weights.project;
  return sum === 100;
}

/**
 * Get the sum of all weights
 */
export function getWeightsTotal(weights: TaskWeights): number {
  return weights.test1 + weights.groupWork + weights.test2 + weights.project;
}

/**
 * Calculate raw task subtotal (sum of all task scores)
 * Each task score is entered out of the max (weight) for that task
 */
export function calculateTaskSubtotal(assessment: Assessment, weights: TaskWeights): number {
  return assessment.test1 + assessment.groupWork + assessment.test2 + assessment.project;
}

/**
 * Calculate task percentage (subtotal / total possible * 50)
 * Tasks contribute 50% to the final score
 */
export function calculateTaskPercent(assessment: Assessment, weights: TaskWeights): number {
  const subtotal = calculateTaskSubtotal(assessment, weights);
  const totalPossible = getWeightsTotal(weights);
  if (totalPossible === 0) return 0;
  return (subtotal / totalPossible) * 50;
}

/**
 * Calculate exam percentage (exam / 100 * 50)
 * Exam contributes 50% to the final score
 */
export function calculateExamPercent(exam: number): number {
  return (exam / 100) * 50;
}

/**
 * Calculate total score = task% + exam%
 */
export function calculateTotalScore(assessment: Assessment, weights: TaskWeights): number {
  const taskPercent = calculateTaskPercent(assessment, weights);
  const examPercent = calculateExamPercent(assessment.exam);
  return Math.round((taskPercent + examPercent) * 10) / 10;
}

/**
 * Convert score to letter grade
 */
export function calculateGrade(score: number): string {
  if (score === 0) return '-';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  if (score >= 30) return 'F';
  if (score >= 20) return 'F';
  if (score >= 10) return 'F';
  return '9';
}

/**
 * Get all calculated values for an assessment
 */
export function getCalculatedValues(assessment: Assessment, weights: TaskWeights) {
  const taskSubtotal = calculateTaskSubtotal(assessment, weights);
  const taskPercent = calculateTaskPercent(assessment, weights);
  const examPercent = calculateExamPercent(assessment.exam);
  const totalScore = calculateTotalScore(assessment, weights);
  const grade = calculateGrade(totalScore);

  return {
    taskSubtotal,
    taskPercent,
    examPercent,
    totalScore,
    grade,
  };
}
