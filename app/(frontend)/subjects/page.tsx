import { redirect } from "next/navigation"
import { StudentsTable } from "@/components/students-table"
import AppLayout from "@/components/layouts/applayout"
import SubjectsPage from "@/components/subject-pge"

export default async function StudentsPage() {

  return (
    <AppLayout>
       <SubjectsPage />
    </AppLayout>
  )
}
