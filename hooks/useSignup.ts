'use client'

import { setUser } from "@/lib/store/features/userSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter()


  const signup = async ({firstName, lastName, email, password}:{firstName: string, lastName:string, email: string, password: string }) => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed");
        return;
      }

      // Save user to Redux store
      dispatch(
        setUser(data.user)
      );

      router.push('/dashboard')

      toast.success("Signup successful");

    } catch (error: any) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading };
}
