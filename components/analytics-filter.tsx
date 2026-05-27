"use client"

import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Card } from "@/components/ui/card"

type ClassItem = {
  id: string
  grade: string
  section: string
  level: string
}

export default function AnalyticsFilters({
  startDate,
  endDate,
  classId,
  setStartDate,
  setEndDate,
  setClassId,
  fetchAnalytics,
}: any) {

  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true)

      const res = await fetch("/api/classes")
      const data = await res.json()

      setClasses(data.classes || [])

    } catch (err) {
      console.error("Failed to load classes", err)
    } finally {
      setLoadingClasses(false)
    }
  }

  return (
    <Card className="rounded-3xl p-4 bg-white/60 backdrop-blur border shadow-sm">

      <div className="flex flex-col lg:flex-row gap-4 lg:items-end">

        {/* DATE RANGE */}
        <div className="flex gap-3 flex-1">

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs text-muted-foreground">
              Start Date
            </label>

            <Input
              type="date"
              className="rounded-2xl"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs text-muted-foreground">
              End Date
            </label>

            <Input
              type="date"
              className="rounded-2xl"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

        </div>

        <div className="flex items-center">
            {/* CLASS SELECT */}
            <div className="flex flex-col gap-1 w-full lg:w-65">
              <label className="text-xs text-muted-foreground">
                Class
              </label>
              <Select
                value={classId || "all"}
                onValueChange={(value) =>
                  setClassId(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Classes
                  </SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.level} - {cls.grade}{cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* APPLY BUTTON */}
            <div className="lg:ml-auto">
              <Button
                onClick={fetchAnalytics}
                className="rounded-2xl px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                Apply Filters
              </Button>
            </div>
        </div>

      </div>

    </Card>
  )
}