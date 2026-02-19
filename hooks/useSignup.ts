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


  const signup = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    specialization?: string;
    joinDate?: string;
    selectedClasses?: string[];
    selectedSubjects?: string[];
    role?: string;
  }) => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed");
        return false;
      }

      // Save user to Redux store
      dispatch(setUser(data.user));

      toast.success("Signup successful");

      return true;
    } catch (error: any) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading };
}
