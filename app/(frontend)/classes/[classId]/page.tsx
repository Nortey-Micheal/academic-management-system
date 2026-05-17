import ClassDetailPage from "@/components/class-details-page"
import AppLayout from "@/components/layouts/applayout"

export default async function ClassDetails({params}:{params: Promise<{classId:string}>}) {
  const { classId } = await params
  return (
    <AppLayout>
      <ClassDetailPage params={{classId}}/>
    </AppLayout>
  )
}
