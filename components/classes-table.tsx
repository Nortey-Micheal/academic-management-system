"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AddClassDialog } from "@/components/add-class-dialog"
import { Class } from "@/lib/generated/prisma/client"

export function ClassesTable() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      setClasses(data.classes)
      // setClasses(DUMMY_CLASSES)
    } catch (error) {
      console.error("[v0] Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-0 pb-25">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Classes ({classes?.length || 0})</CardTitle>
            <AddClassDialog onClassAdded={fetchClasses} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading classes...</div>
          ) : classes?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No classes added yet.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classes?.map((classItem) => (
                <Card key={classItem.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{`Basic ${classItem.grade}`}</h3>
                        <p className="text-sm text-muted-foreground">Academic Year: {classItem.academicYear}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Enrollment</span>
                          <span className="font-medium">
                            {classItem.currentEnrollment} / {classItem.capacity}
                          </span>
                        </div>
                        <Progress value={(classItem.currentEnrollment / classItem.capacity) * 100} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          View Students
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
