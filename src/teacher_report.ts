import { infrai } from "./infrai_sms.js";
import { VerificationRequest, shouldResend, teacherReport } from "./verification_decision.js";

const input = VerificationRequest.parse({
  courseId: process.env.COURSE_ID ?? "algebra-101",
  learnerId: process.env.LEARNER_ID ?? "learner-17",
  verificationId: process.env.VERIFICATION_ID ?? "verification-17",
  deadline: process.env.LEARNER_DEADLINE ?? "2099-06-30T16:00:00Z"
});

if (!shouldResend(input, new Date())) {
  console.log(JSON.stringify(teacherReport(input, "deadline_passed"), null, 2));
} else {
  const sent = await infrai.sms.resend(input.verificationId);
  const events = await infrai.sms.events(sent.id ?? input.verificationId);
  const latest = events.at(-1)?.status ?? "submitted";
  console.log(JSON.stringify(teacherReport(input, latest), null, 2));
}
