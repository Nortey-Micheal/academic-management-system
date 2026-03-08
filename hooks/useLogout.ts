import { clearClasses } from "@/lib/store/features/classesSlice";
import { clearUser } from "@/lib/store/features/userSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

export const useLogout = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      // If your backend uses a logout API to clear cookies:
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear redux store
      dispatch(clearUser());
      dispatch(clearClasses())

      toast.success("Logged out successfully.");

      // Redirect
      router.push("/");

    } catch (error) {
      toast.error("Failed to logout.");
      console.error("Logout error:", error);
    }
  };

  return { logout };
};
