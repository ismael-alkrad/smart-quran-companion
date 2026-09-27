# Recorded teacher review

The Arabic student/teacher inbox is at `/tasmee`; individual reviews are at
`/tasmee/reviews/:name`. It uses the existing Figma theme and shared Vue
components. No AI analysis or Hifz mutation is triggered by this workflow.

## Setup

Backend companion branch: `codex/teacher-recorded-review` in `ismael-alkrad/smart_quran`.
Run `bench --site quran.localhost migrate` after deploying the backend. The migration
creates the Teacher Link, Teacher Review and Teacher Note DocTypes and the
`Smart Quran Teacher` role. It does not assign this role to existing users.

No teacher role assignment is needed. Any enabled regular account can learn and
review; the role is determined separately for each recording. The legacy Frappe
role is retained for compatibility, but is not an authorization requirement.
Under **التسميع → شركاء التسميع**, enter the partner's email and choose either
**أسمّع له فقط** or **نسمّع لبعض**. Only the invitation recipient can accept.
Mutual consent allows submissions in both directions. Existing links remain
one-way (`is_mutual = 0`); they are never silently upgraded. Either participant
can end the relationship, stopping reviewer access in both directions.
Closed relationships cannot be reopened through the app in this version.

## Workflow

1. Record today's assignment or choose a surah and ayah range at `/tasmee/select`.
   Standalone recordings use an account-scoped recovery key, create no daily
   assignment and cannot start AI analysis or apply a Hifz result. New local
   recordings carry an owner ID and are not opened under a different account.
2. Preview and upload the recording, then select an accepted teacher relationship.
3. The teacher opens the inbox, downloads the private audio, pauses at a passage,
   presses **تثبيت موضع التشغيل**, and adds a note (optional ayah, category, text).
4. Notes remain drafts visible only to the teacher. Publishing either approves
   this recording or requests another attempt. Published reviews are immutable.
5. The student can listen from each note timestamp and record a new attempt.
   Retries preserve the original range even when today's assignment changes,
   use new recordings, and link back to the previous review.

The sender cannot approve their own recording. Inbox tabs distinguish recordings
the user sent from recordings they review; status filtering happens on the server
before pagination. A crossed mutual invitation does not count as acceptance.

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

The current integration suite has 11 tests, including all 114 surah boundaries,
standalone upload/review/retry, immutable scope, and unchanged Hifz document counts.
