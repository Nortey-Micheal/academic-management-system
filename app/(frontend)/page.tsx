import { redirect } from "next/navigation"
// import { getSession } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  // const session = await getSession()

  // if (session) {
  //   redirect("/dashboard")
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-muted/20 to-background p-4">
      <LoginForm />
    </div>
  )
}
