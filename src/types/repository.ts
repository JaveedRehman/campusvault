export interface AcademicResource {
  id?: string;
  title: string;
  description?: string;
  college: string;
  department: string;
  semester: string;
  subject: string;
  fileKey: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedByEmail?: string;
  uploadedByName?: string;
  uploadedAt: string;
  averageRating: number;
  ratingCount: number;
  isSample?: boolean;
}

export interface RatingRecord {
  id?: string;
  resourceId: string;
  anonymousIdentifier: string;
  rating: number;
  createdAt: string;
}

export const COLLEGES = [
  {
    name: "College of Engineering & Technology",
    departments: [
      "Computer Science & Engineering",
      "Electrical & Electronics Engineering",
      "Mechanical Engineering",
      "Civil & Environmental Engineering",
      "Chemical Engineering"
    ]
  },
  {
    name: "College of Science & Mathematics",
    departments: [
      "Physics & Astronomy",
      "Chemistry & Biochemistry",
      "Mathematics & Statistics",
      "Biological Sciences",
      "Earth & Environmental Sciences"
    ]
  },
  {
    name: "College of Business Administration",
    departments: [
      "Economics & Finance",
      "Accounting & Information Systems",
      "Management & Marketing",
      "Business Analytics"
    ]
  },
  {
    name: "College of Arts & Humanities",
    departments: [
      "English Literature & Composition",
      "History & Political Science",
      "Philosophy & Ethics",
      "Sociology & Anthropology"
    ]
  }
];

export const SEMESTERS = [
  "Semester 1 (Fall - Freshman)",
  "Semester 2 (Spring - Freshman)",
  "Semester 3 (Fall - Sophomore)",
  "Semester 4 (Spring - Sophomore)",
  "Semester 5 (Fall - Junior)",
  "Semester 6 (Spring - Junior)",
  "Semester 7 (Fall - Senior)",
  "Semester 8 (Spring - Senior)",
  "Graduate / Master's Level",
  "Doctoral / Ph.D. Level"
];
