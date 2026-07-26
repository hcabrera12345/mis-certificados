import { Course } from '@/types';
import { MOCK_COURSES } from './mockData';

export async function fetchVigentesCoursesFromQuinto(): Promise<Course[]> {
  return MOCK_COURSES;
}
