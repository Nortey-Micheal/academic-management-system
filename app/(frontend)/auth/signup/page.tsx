"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSignup } from "@/hooks/useSignup";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Eye, EyeClosed } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Class } from "@/lib/generated/prisma/client";

type SubjectType = {
  id: string;
  subjectName: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "TEACHER",
    specialization: "",
    joinDate: "",
    selectedClasses: [] as string[],
    selectedSubjects: [] as string[],
  });
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const { signup, loading } = useSignup();

  // fetch available classes
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        setClasses(data.classes);
      } catch (err) {
        console.error("Failed to fetch classes", err);
      }
    }
    fetchClasses();
  }, []);

  // handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle class selection
  const handleClassChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;

    if (!classId || classId.length < 2) {
      return;
    }

    const classLevel = classes.find((clas) => clas.id === classId)?.level;
    setFormData((prev) => ({
      ...prev,
      selectedClasses: [classId],
      selectedSubjects: [],
    }));

    try {
      const res = await fetch(`/api/subjects/${classLevel}`);
      let data: SubjectType[] = await res.json();

      // apply business rule: lower classes teach all subjects except ICT/French
      const selectedClass = classes.find((c) => c.id === classId);
      if (
        selectedClass &&
        ["Preschool", "Lower Primary"].includes(selectedClass.level)
      ) {
        data = data.filter((s) => !["ICT", "French"].includes(s.subjectName));
      }

      setSubjects(data);
    } catch (err) {
      console.error("Failed to fetch subjects", err);
    }
  };

  // handle form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.role === "TEACHER") {
      if (!formData.selectedClasses.length) {
        setError("Please select a class");
        return;
      }
      if (!formData.selectedSubjects.length) {
        setError("Please select at least one subject");
        return;
      }
      if (!formData.specialization) {
        setError("Specialization is required");
        return;
      }
      if (!formData.joinDate) {
        setError("Join date is required");
        return;
      }
    }

    // call the signup hook
    const success = await signup({ ...formData });
    if (success) {
      router.push("/dashboard"); // redirect after signup
    }
  };

  const passwordStrength = formData.password.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <Image
              alt="school logo"
              width={150}
              height={150}
              src="/logo.webp"
              className="rounded-xl"
            />
          </div>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up for Mount Olives School
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <input
                  name="firstName"
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <input
                  name="lastName"
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                name="email"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            {/* Teacher-specific fields */}
            {formData.role === "TEACHER" && (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="specialization"
                    className="text-sm font-medium"
                  >
                    Specialization
                  </label>
                  <input
                    name="specialization"
                    id="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Mathematics, English..."
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="joinDate" className="text-sm font-medium">
                    Join Date
                  </label>
                  <input
                    name="joinDate"
                    id="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Class</label>
                  <div className="grid grid-cols-2 gap-2">
                    {classes.length > 0 ? (
                      classes.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            handleClassChange({
                              target: { value: c.id },
                            } as React.ChangeEvent<HTMLSelectElement>)
                          }
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium text-center ${
                            formData.selectedClasses[0] === c.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          <div className="font-semibold">{c.className}</div>
                          <div className="text-xs opacity-75">{c.level}</div>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground col-span-2">
                        Loading classes...
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Subjects</label>
                  {subjects.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                      {subjects.map((s) => (
                        <label
                          key={s.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedSubjects.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  selectedSubjects: [
                                    ...prev.selectedSubjects,
                                    s.id,
                                  ],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  selectedSubjects:
                                    prev.selectedSubjects.filter(
                                      (id) => id !== s.id,
                                    ),
                                }));
                              }
                            }}
                            className="w-4 h-4 rounded border-2 border-primary cursor-pointer"
                          />
                          <span className="text-sm font-medium">
                            {s.subjectName}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/30">
                      Select a class to see available subjects
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    📌 For lower classes, ICT & French are excluded
                  </p>
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  id="password"
                  type={isVisible ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2"
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? <EyeClosed /> : <Eye />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {passwordStrength ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Strong password</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    Minimum 8 characters
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  id="confirmPassword"
                  type={isVisible ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
