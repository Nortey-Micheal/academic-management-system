interface SubjectGrade {
  totalMarks: number
  obtainedMarks: number
}

export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+"
  if (percentage >= 85) return "A"
  if (percentage >= 80) return "A-"
  if (percentage >= 75) return "B+"
  if (percentage >= 70) return "B"
  if (percentage >= 65) return "B-"
  if (percentage >= 60) return "C+"
  if (percentage >= 55) return "C"
  if (percentage >= 50) return "C-"
  if (percentage >= 45) return "D"
  return "F"
}

export function getGradeRemarks(grade: string): string {
  switch (grade) {
    case "A+":
    case "A":
      return "Excellent"
    case "A-":
    case "B+":
      return "Very Good"
    case "B":
    case "B-":
      return "Good"
    case "C+":
    case "C":
      return "Satisfactory"
    case "C-":
    case "D":
      return "Needs Improvement"
    case "F":
      return "Fail"
    default:
      return ""
  }
}

export function calculateOverallGrade(subjects: SubjectGrade[]) {
  const totalMarks = subjects.reduce((sum, s) => sum + s.totalMarks, 0)
  const obtainedMarks = subjects.reduce((sum, s) => sum + s.obtainedMarks, 0)
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0
  const grade = calculateGrade(percentage)
  const remarks = getGradeRemarks(grade)

  return {
    totalMarks,
    obtainedMarks,
    percentage: Number.parseFloat(percentage.toFixed(2)),
    grade,
    remarks,
  }
}
