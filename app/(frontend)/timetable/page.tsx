import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DUMMY_TIMETABLE } from "@/lib/dummy-data"
import AppLayout from "@/components/layouts/applayout"

export default async function TimetablePage() {
  // requireAuth returns a dummy user when auth is disabled in dev
  try {
    await requireAuth()
  } catch (e) {
    // ignore and continue with dummy data for demo
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeSlots = ["08:00 - 09:00", "09:00 - 10:00", "10:15 - 11:15", "11:15 - 12:15", "13:15 - 14:15"]

  // Use centralized dummy timetable data
  const sampleSchedule = DUMMY_TIMETABLE

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Timetable Management</h1>
        <p className="text-muted-foreground mt-1">Create and manage class schedules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timetable Builder</CardTitle>
          <CardDescription>Example timetable for local development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left">Time</th>
                  {days.map((d) => (
                    <th key={d} className="p-3 text-left">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot} className="border-t">
                    <td className="p-3 font-mono">{slot}</td>
                    {days.map((d) => {
                      const cell = (sampleSchedule as any).Grade1?.[d]?.find((s: any) => s.time === slot)
                      return (
                        <td key={d + slot} className="p-3 align-top">
                          {cell ? (
                            <div>
                              <div className="font-semibold">{cell.subject}</div>
                              <div className="text-sm text-muted-foreground">{cell.teacher} — {cell.room}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">—</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
