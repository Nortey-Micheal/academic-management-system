import { mountOlivesSchool } from "./schools/mos";

const schools = {
  "mountOlivesSchool": mountOlivesSchool,
};

export function getSchoolConfig() {
  const schoolKey = process.env.NEXT_PUBLIC_SCHOOL;

  const school =
    schoolKey && schoolKey in schools
      ? schools[schoolKey as keyof typeof schools]
      : mountOlivesSchool

  return Object.freeze(school);
}