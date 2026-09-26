# Recorded teacher review

The Arabic student/teacher inbox is at `/tasmee`; individual reviews are at
`/tasmee/reviews/:name`. It uses the existing Figma theme and shared Vue
components. No AI analysis or Hifz mutation is triggered by this workflow.

## Setup

Backend companion branch: `codex/teacher-recorded-review` in `ismael-alkrad/smart_quran`.
Run `bench --site quran.localhost migrate` after deploying the backend. The migration
creates the Teacher Link, Teacher Review and Teacher Note DocTypes and the
`Smart Quran Teacher` role. It does not assign this role to existing users.

In Frappe's User form, an administrator assigns `Smart Quran Teacher` to an
enabled teacher account. The teacher also completes the existing app onboarding.
The student enters that teacher's email under **التسميع → المدرّسون والطلاب**.
Only that teacher can accept. Either participant can end the relationship.
Closed relationships cannot be reopened through the app in this version.

## Workflow

1. Record the daily assignment using the existing microphone and local recovery flow.
2. Preview and upload the recording, then select an accepted teacher relationship.
3. The teacher opens the inbox, downloads the private audio, pauses at a passage,
   presses **تثبيت موضع التشغيل**, and adds a note (optional ayah, category, text).
4. Notes remain drafts visible only to the teacher. Publishing either approves
   this recording or requests another attempt. Published reviews are immutable.
5. The student can listen from each note timestamp and record a new attempt.
   Retries preserve the original assignment even when today's assignment changes,
   use new recordings, and link back to the previous review.

Approval is recorded in the teacher review only. It does not automatically
approve memorization or rewrite an AI report. Audio is read through an authenticated,
participant-checked endpoint with private attachment and SHA-256 verification.
Revocation immediately prevents subsequent teacher downloads and reads; it cannot
erase audio that a recipient has already downloaded.

## Verification

- Frontend: `npm run typecheck`, `npm run lint`, `npm run build`.
- Backend integration: `bench --site quran.localhost execute smart_quran.api.test_teacher_review.run`.
  Synthetic users/assignments/sessions are rolled back. No historical recording is read.
- Isolated UI fixture: with Vite running, open
  `/tests/teacher-review.html#/tasmee/reviews/fixture-review`.
  It mounts the real page and supplies in-memory API responses and silent synthetic
  audio. It does not access the backend and is not included in the production build.

## Current limits

- Retries record the complete original assignment; selecting only a smaller
  ayah range is not implemented yet.
- Notes support timestamps and optional ayah references, not word selection.
- No push/email notifications, background upload queue or automatic Hifz updates.
- Inbox refresh is manual/re-entry; API pagination is 20 reviews per page.
- This work reuses the Figma design language; it does not add new Figma frames.
