import { useState } from "react";
import { toast } from "sonner";

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Reset link sent to your email.");
      return data;

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading };
};
