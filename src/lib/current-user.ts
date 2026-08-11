import { currentUser as fallbackUser, students as fallbackStudents, type Student } from "./mock-data";
import { getSessionUserId } from "./session";

let liveStudents: Student[] | null = null;

export function setLiveStudents(list: Student[]) {
  liveStudents = list;
}

export function getStudents(): Student[] {
  return liveStudents ?? fallbackStudents;
}

export function getCurrentUser(): Student {
  const id = getSessionUserId();
  return getStudents().find((s) => s.id === id) ?? fallbackUser;
}

export function findStudentById(id: string): Student | undefined {
  return getStudents().find((s) => s.id === id);
}
