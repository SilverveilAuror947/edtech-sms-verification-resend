import { z } from "zod";

export const VerificationRequest = z.object({
  courseId: z.string().min(1),
  learnerId: z.string().min(1),
  verificationId: z.string().min(1),
  deadline: z.coerce.date()
});

export type VerificationRequest = z.infer<typeof VerificationRequest>;

export function shouldResend(request: VerificationRequest, now: Date): boolean {
  return request.deadline.getTime() >= now.getTime();
}

export function teacherReport(request: VerificationRequest, status: string) {
  return {
    courseId: request.courseId,
    learnerId: request.learnerId,
    deadline: request.deadline.toISOString(),
    deliveryState: status
  };
}
