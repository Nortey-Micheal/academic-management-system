"use client"

import { Dispatch, SetStateAction } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Label } from "@/components/ui/label"

interface HeadteacherAssessmentProps {
  setConduct: Dispatch<SetStateAction<string>>
  setAttitude: Dispatch<SetStateAction<string>>
  setHeadteacherRemarks: Dispatch<SetStateAction<string>>
}

const conductOptions = [
  "Excellent",
  "Very Good",
  "Good",
  "Satisfactory",
  "Needs Improvement",
]

const attitudeOptions = [
  "Excellent",
  "Very Positive",
  "Positive",
  "Average",
  "Poor",
]

const remarksOptions = [
  "Excellent performance. Keep it up.",
  "Very hardworking and disciplined.",
  "Shows good academic potential.",
  "Needs to participate more actively in class.",
  "Needs improvement in attitude and studies.",
  "Promoted to the next class.",
  "Can do better with more effort.",
]

export default function HeadteacherAssessment({
  setConduct,
  setAttitude,
  setHeadteacherRemarks,
}: HeadteacherAssessmentProps) {

  return (

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Conduct */}
      <div className="space-y-2">

        <Label>Conduct</Label>

        <Select
          onValueChange={(value) => setConduct(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select conduct" />
          </SelectTrigger>

          <SelectContent>
            {conductOptions.map((option) => (
              <SelectItem
                key={option}
                value={option}
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>

        </Select>

      </div>

      {/* Attitude */}
      <div className="space-y-2">

        <Label>Attitude</Label>

        <Select
          onValueChange={(value) => setAttitude(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select attitude" />
          </SelectTrigger>

          <SelectContent>
            {attitudeOptions.map((option) => (
              <SelectItem
                key={option}
                value={option}
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>

        </Select>

      </div>

      {/* Headteacher Remarks */}
      <div className="space-y-2">

        <Label>Headteacher Remarks</Label>

        <Select
          onValueChange={(value) =>
            setHeadteacherRemarks(value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select remark" />
          </SelectTrigger>

          <SelectContent>
            {remarksOptions.map((option) => (
              <SelectItem
                key={option}
                value={option}
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>

        </Select>

      </div>

    </div>

  )

}