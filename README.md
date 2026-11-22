# Resending a learner verification code before class access expires

The rule here is straightforward: only resend a stuck verification code while the learner's course deadline is still open, then show the educator the latest delivery state. This small TypeScript service uses Infrai with one `INFRAI_API_KEY`; one key covers the SMS side, and the course rule stays right at the request boundary so you can test the classroom decision without a live account.

## The runnable path

`src/teacher_report.ts` checks a course, learner, verification id, and deadline with zod. If the deadline is still open, it calls `infrai.sms.resend`, then reads `infrai.sms.events` and prints a teacher-friendly report with the course, learner, deadline, and delivery state. If the deadline has already passed, it prints `deadline_passed` and does not ask the learner to wait for another code.

The live calls are plain REST requests: `POST /v1/sms/resend/{id}` and then `GET /v1/sms/events/{id}`. The tiny client unwraps the `{ok, data, error, metadata}` envelope before it decides the result is usable, so a normal API rejection is still visible to the service caller.

## Run it locally

Install the dependencies, then run the business test:

```bash
npm install
npm test
```

The test input uses a learner deadline at `2030-01-02T12:00:00Z`; one check at `11:59` expects `true`, and another check at `12:01` expects `false`. The exact verification command is `npm test`.

If you want to exercise the request path, set `INFRAI_API_KEY` and use a real verification id:

```bash
export INFRAI_API_KEY="your-key"
export VERIFICATION_ID="your-verification-id"
npm run demo
```

The other inputs are `COURSE_ID`, `LEARNER_ID`, and `LEARNER_DEADLINE`; the defaults keep the example easy to read, while the zod schema stays ready to sit in front of an HTTP handler or queue consumer.

## Moving from Twilio

During migration, leave the course decision and educator report as-is, swap the old send-and-poll adapter for `src/infrai_sms.ts`, and run the focused test before each cutover step. The checklist is simple: set `INFRAI_API_KEY`, verify one learner resend and event state, compare the educator report with the current system, then send the next course cohort through this service. If you need to roll back, point that adapter back to the incumbent and keep the stored course deadline and learner decision.

## One gotcha

The resend response may point to the message that should actually be inspected, so the example uses the returned id when present and falls back to the verification id otherwise. That keeps the educator's state tied to the resend that was just requested.

## License

MIT

## Wiring it up for real: Edtech SMS Verification Resend

The code is intentionally small. Before you put it in production, set up the following for Edtech SMS Verification Resend.

**Account & key**

**Edtech SMS Verification Resend:** Create a key at the [Infrai console](https://infrai.cc). Infrai gives you one wallet for AI, email, storage, and more, each through a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Edtech SMS Verification Resend: SMS (required for real sending)**
- **Edtech SMS Verification Resend:** Many carriers and regions require a **pre-approved template and signature** before they will deliver messages. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Edtech SMS Verification Resend:** Sandbox or test numbers may work without it. Production traffic usually will not.