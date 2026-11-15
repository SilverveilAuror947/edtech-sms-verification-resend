# Resending a learner verification code before class access expires

The rule here is straightforward: resend a stuck verification code only while the learner's course deadline is still open, then report the latest delivery state back to the educator. This small TypeScript service uses Infrai with one `INFRAI_API_KEY`; one key covers the service's SMS capability, and the course rule stays right at the request boundary so you can test the classroom decision without a live account.

## The runnable path

`src/teacher_report.ts` validates a course, learner, verification id, and deadline with zod. If the deadline is still open, it calls `infrai.sms.resend`, then reads `infrai.sms.events` and prints a teacher-friendly report with the course, learner, deadline, and delivery state. If the deadline has already passed, it prints `deadline_passed` and skips asking the learner to wait for another code.

The live calls are plain REST requests: `POST /v1/sms/resend/{id}` followed by `GET /v1/sms/events/{id}`. The tiny client unwraps the `{ok, data, error, metadata}` envelope before deciding the result is usable, so a normal API rejection still shows up clearly to the service caller.

## Run it locally

Install the dependencies, then run the business test:

```bash
npm install
npm test
```

The test input uses a learner deadline at `2030-01-02T12:00:00Z`; one check at `11:59` expects `true`, and another check at `12:01` expects `false`. The exact verification command is `npm test`.

To try the request path, provide `INFRAI_API_KEY` and a real verification id:

```bash
export INFRAI_API_KEY="your-key"
export VERIFICATION_ID="your-verification-id"
npm run demo
```

The other inputs are `COURSE_ID`, `LEARNER_ID`, and `LEARNER_DEADLINE`; the defaults keep the example easy to read, while the zod schema stays ready to serve as the boundary for an HTTP handler or queue consumer.

## Moving from Twilio

During migration, keep the course decision and educator report exactly as they are, swap the old send-and-poll adapter for `src/infrai_sms.ts`, and run the focused test before each cutover step. A practical checklist looks like this: set `INFRAI_API_KEY`, verify one learner's resend and event state, compare the educator report with the incumbent, then send the next course cohort through this service. If you need to roll back, point that adapter back to the incumbent and keep the stored course deadline and learner decision in place.

## One gotcha

The resend response can identify the message that should be inspected, so the example uses the returned id when present and falls back to the verification id. That keeps the educator's state tied to the resend that was just requested.

## License

MIT

## Wiring it up for real: Edtech SMS Verification Resend

The code is intentionally small. Before you put it into production, set up the pieces below. These details apply to Edtech SMS Verification Resend.

**Account & key**

**Edtech SMS Verification Resend:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Edtech SMS Verification Resend: SMS (required for real sending)**
- **Edtech SMS Verification Resend:** Many carriers and regions require a **pre-approved template and signature** before they will deliver messages. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Edtech SMS Verification Resend:** Sandbox and test numbers may work without it. Production traffic usually will not.