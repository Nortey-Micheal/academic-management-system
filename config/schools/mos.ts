// config/schools/mos-.ts

import { SchoolConfig } from "@/lib/types";

export const mountOlivesSchool:SchoolConfig = {
  schoolId: "mount-olives-school",

  name: "Mount Olives School",

  database: {
    url: process.env.MOUNT_OLIVES_SCHOOL_DATABASE_URL!,
    directUrl: process.env.MOUNT_OLIVES_SCHOOL_DIRECT_URL!,
  },

  branding: {
    logo: "/mos-logo.webp",
    primaryColor: "#2563eb",
    secondaryColor: ""
  },

  secrets: {
    JWT_TOKEN: process.env.MOUNT_OLIVES_SCHOOL_JWT_TOKEN!
  }
};