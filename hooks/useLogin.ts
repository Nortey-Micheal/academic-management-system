import { setUser } from "@/lib/store/features/userSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });


      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      // Save user + token to Redux store
      dispatch(
        setUser(data.user)
      );

      router.push('/dashboard')

      toast.success("Login successful");

    } catch (error: any) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
