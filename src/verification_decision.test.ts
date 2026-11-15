import assert from "node:assert/strict";
import { VerificationRequest, shouldResend } from "./verification_decision.js";

const request = VerificationRequest.parse({
  courseId: "history-201",
  learnerId: "learner-4",
  verificationId: "msg-4",
  deadline: "2030-01-02T12:00:00Z"
});

assert.equal(shouldResend(request, new Date("2030-01-02T11:59:00Z")), true);
assert.equal(shouldResend(request, new Date("2030-01-02T12:01:00Z")), false);
console.log("verification decision test passed");
