export interface Project {
  id: string;
  name: string;
  status: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
}

export interface Feedback {
  text: string;
  author: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  loginID: string;
  emailWork: string;
  role: "Employee" | "Manager" | "Admin";
  status: "Active" | "Inactive";
  projects: Project[];
  tasks: Task[];
  feedback: Feedback[];
}
