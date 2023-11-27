import { SubAssignment } from "src/app/shared/services/baker-api.service";

export interface AssignmentSuccessEvent {
  success: SubAssignment | null;
}

export function isAssignmentSuccessEvent(e: any): e is AssignmentSuccessEvent {
  return 'success' in e;
}

export  interface FormSubmittedEvent {
  submitted: boolean;
}

export function isFormSubmittedEvent(e: any): e is FormSubmittedEvent {
  return 'submitted' in e;
}

export interface Substitute {
  id: number;
  sub_id?: number;
  sub_name: string;
}