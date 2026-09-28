# Recorded teacher review

The Arabic student/teacher inbox is at `/tasmee`; individual reviews are at
`/tasmee/reviews/:name`. It uses the existing Figma theme and shared Vue
components. No AI analysis or Hifz mutation is triggered by this workflow.

## Setup

Backend companion branch: `codex/teacher-recorded-review` in `ismael-alkrad/smart_quran`.
Run `bench --site quran.localhost migrate` after deploying the backend. The migration
creates the Teacher Link, Teacher Review, Teacher Note and Recitation Marker DocTypes and the
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
3. Opening the review loads the private audio automatically. One **تشغيل التلاوة**
   action starts listening and records the human review start. The Mushaf is the
   primary surface, with transport controls in a separate row below the page.
   **إضافة ملاحظة** pauses audio and preselects the current time/recognized ayah.
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

- One assigned reviewer per recording currently. Group membership and supplementary
  reviews by multiple people are specified in `product-roadmap.md`, not implemented.

- Retries record the complete original assignment; selecting only a smaller
  ayah range is not implemented yet.
- Notes support timestamps and optional ayah references, not word selection.
- No push/email notifications, background upload queue or automatic Hifz updates.
- Inbox refresh is manual/re-entry; API pagination is 20 reviews per page.
- This work reuses the Figma design language; it does not add new Figma frames.

The current integration suite has 16 tests, including all 114 surah boundaries,
standalone upload/review/retry, immutable scope, and unchanged Hifz document counts.

## Review activity and automatic Mushaf tracking

Playback by the assigned reviewer, an explicit **بدء المراجعة**, first note, or
first legacy marker records the start time.
Reading the detail or downloading audio does not. Both participants see the named
reviewer's started/published state; existing reviews do not get a fabricated start
time. Notes carry their author's name and creation time (legacy notes use the
assigned reviewer's name, with no invented date).

Opening a review now starts automatic tracking preparation in a background job.
Timed words from the existing local ASR service are matched to unique Quran
phrases within the selected range. The player clock selects a word span, and the
local Mushaf highlights that word and changes page as needed, including long
ayahs spanning pages. Seeking/replaying follows the audio clock; uncertain gaps
have no active word. Manual pinning has been removed from the main UI. Existing
manual markers remain stored for compatibility but do not drive automatic tracking.

This is an experimental navigation aid, not correctness/tajweed assessment.
Conservative matching can leave gaps, and confident ASR errors remain possible.
It has not been validated across student voices or real-time calls. Live audio
chunking, latency evaluation and call transport are not implemented. Clicking an
ayah is still available to attach a review note; it pauses following until the
reviewer re-enables **متابعة التلاوة تلقائيًا**.

The worker requires the existing ASR service to provide words and speech segment
metadata, Quran reference access and a running Frappe long queue. Results are
cached for 24 hours by review ID and recording hash; every status/prepare request
rechecks participant access. Tracking does not start/complete the human review or
modify Tasmee analysis, Hifz or scores. Preparation/poll failures keep audio usable.

Verification also includes seven matcher tests for repetition, backwards jumps,
ambiguous text, invalid timing/confidence and silence evidence. An explicit
`bench --site quran.localhost execute smart_quran.services.test_recitation_tracking.public_probe`
uses a public [Alafasy 1:2 sample](https://everyayah.com/data/Alafasy_128kbps/001002.mp3),
not historical user audio. It located the four verse words and omitted an extra
word hallucinated after the verse; that single sample is not an accuracy benchmark.

The optional local `/tests/teacher-review.html?audio=public#/tasmee/reviews/fixture-review`
preview reads untracked `tests/.tracking-sample.json` (probe stdout) and
`tests/.tracking-sample.mp3` (the sample above). They are locally ignored and are
not shipped or committed. Its account/review data are synthetic; timing is actual
probe output. The default preview remains a silent synthetic UI fixture.

## Reader controls and possible differences

Private audio is fetched as the review opens, with abort/version guards against
late responses from another recording. There is no initial download button. The
custom transport provides play/pause, scrub, five-second rewind, speed, a contextual
note action and a link to final review. It occupies normal document flow below
the Mushaf, never a sticky layer over Quran text. Playback begins on a user gesture
and uses the play promise/events rather than assuming autoplay succeeded; see
[MDN playback guidance](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play).

The reviewer may see **possible substitutions**, marked with a dotted red underline.
These require an unmatched high-confidence timed word bracketed by two anchored
words, exactly one expected word between them, and speech evidence. Silence,
missing words or ambiguous positioning are not automatically colored red. This
limited hypothesis detector is not a validated exhaustive error/tajweed detector,
and the absence of red is not evidence that the recitation is correct.

Suggestions are hidden from the student at the API level, even after publication.
The reviewer can replay a suggestion and draft a note, then edit/save/publish it.
Nothing is automatically published or graded. `/tests/teacher-review.html?case=difference#/tasmee/reviews/fixture-review`
is an explicitly synthetic UI-only red-marker fixture, separate from the public
recitation probe; it is not evidence of real-world detection accuracy.
