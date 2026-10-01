You are working on the CYPHORA repository.

IMPORTANT:
This is an existing competition platform. Do NOT rewrite the project from scratch.
First inspect the existing implementation, understand the current architecture and data flow, then make targeted changes.

The goal of this task is to fully update and stabilize ROUND 1 of CYPHORA according to the canonical task/hint specification below while fixing the listed bugs, errors, UX problems, task-flow issues, and visual polish issues.

==================================================
1. SOURCE OF TRUTH
==================================================

The following Round 1 task table is now the CANONICAL source of truth.

Do not preserve conflicting old task answers, hints, objectives, or validation rules from the existing implementation.

--------------------------------------------------
TASK 01 — ENCODED MESSAGE
--------------------------------------------------

Objective:
Decode the numerical values in `message.txt`.

Answer:
HIDE

Hint 1:
`message.txt` is on the Desktop.

Hint 2:
Open the file, identify the number sequence, and use Universal Converter Decimal/ASCII → Text.

--------------------------------------------------
TASK 02 — FILE INFORMATION
--------------------------------------------------

Objective:
Inspect `evidence.jpg` metadata and find the registered author.

Answer:
ARLO

Hint 1:
The file is in Pictures.

Hint 2:
Open the image with Metadata Inspector, examine the metadata fields, and look for the creator/author information.

--------------------------------------------------
TASK 03 — IMAGE MESSAGE
--------------------------------------------------

Objective:
Scan the optical matrix in `poster.png`.

Answer:
SECTOR-7

Hint 1:
The image is in Pictures.

Hint 2:
Use QR/Barcode Scanner and scan the matrix to retrieve the encoded message.

--------------------------------------------------
TASK 04 — THE EARLIEST RECORD
--------------------------------------------------

Objective:
Find the earliest timestamp in `access.log` and determine the associated color.

Answer:
YELLOW

Hint 1:
`access.log` is in Documents.

Hint 2:
Compare the timestamps and identify the earliest record and its associated information.

IMPORTANT:
The color/code used for Task 4 must be changed according to the new task design if the existing evidence currently uses the old color/code.
Do not leave stale Task 4 evidence that contradicts the new intended answer.

--------------------------------------------------
TASK 05 — THE CHANGED RECORD
--------------------------------------------------

Objective:
Compare the old and new transmission logs and find the changed value.

Answer:
9941

Hint 1:
Both files are in Documents.

Hint 2:
Use File Comparison Tool, compare the files line by line, and locate the differing value.

IMPORTANT:
The File Comparison Tool must NOT visually highlight the answer/difference in a way that gives the solution away.

--------------------------------------------------
TASK 06 — THE FRAGMENTED PASSWORD
--------------------------------------------------

Objective:
Chronologically arrange three fragments and decode them.

Answer:
CYPHORA

Hint 1:
The fragments are in Documents.

Hint 2:
Check their timestamps, arrange them from earliest to latest, combine the fragments, and decode the result using Base64.

IMPORTANT:
Task 6 currently has a serious validation bug where performing arbitrary conversions can result in a correct task submission.

Fix this completely.

A generic conversion event MUST NOT complete Task 6.

The task must only be considered solved when the participant submits the correct final answer:

CYPHORA

If conversion events are used internally for task tracking, they must be contextual and must not independently award completion.

For example:
- opening Converter ≠ completion
- performing Decimal conversion ≠ completion
- performing Hex conversion ≠ completion
- performing arbitrary conversion ≠ completion
- any conversion result ≠ completion

Final task completion must depend on validated task answer/submission.

--------------------------------------------------
TASK 07 — THE HIDDEN RECORD
--------------------------------------------------

Objective:
Inspect image metadata and decode the embedded character codes.

Answer:
RESCUE

Hint 1:
`archive_photo.png` is in Pictures.

Hint 2:
Use Metadata Inspector, examine the description/details, and convert the numerical character codes using Decimal/ASCII → Text.

IMPORTANT:
Metadata Inspector must not directly reveal the answer through UI affordances.

--------------------------------------------------
TASK 08 — THE DISGUISED FILE
--------------------------------------------------

Objective:
Find the file hidden inside the concealed directory.

Answer:
7314

Hint 1:
Look in Archive.

Hint 2:
Enable Show Hidden Files in File Manager, inspect the concealed directories, and locate the text file.

IMPORTANT:
"Show Hidden Files" MUST default to OFF whenever a new OS session starts.

It must not persist as ON from a previous team/session unless persistence is explicitly intended for the same active OS session.

--------------------------------------------------
TASK 09 — THE EVIDENCE TRAIL
--------------------------------------------------

Objective:
Follow the image clue → index → activity log.

Answer:
17

Hint 1:
The starting image is in Pictures. Related files are in Documents.

Hint 2:
Scan the image to obtain the first clue, use that clue to locate the relevant entry in the index file, follow the reference to the activity log, and inspect the specified record.

--------------------------------------------------
TASK 10 — THE ALTERED RECORD
--------------------------------------------------

Objective:
Compare two configuration files, identify the changed hexadecimal data, and decode it.

Answer:
VECTOR

Hint 1:
`alpha.txt` and `beta.txt` are in Documents.

Hint 2:
Compare both files, locate the modified line, identify the hexadecimal sequence, and convert Hexadecimal → Text.

IMPORTANT:
Do not visually highlight the changed data in a way that immediately exposes the answer.

--------------------------------------------------
TASK 11 — FOLLOW THE TRAIL
--------------------------------------------------

Objective:
Follow the chain from the incident note through the archive and device image, inspect the referenced metadata, and decode the recovered character sequence.

Answer:
SHIFT

Hint 1:
Start with `incident_note.txt` in Documents.

Hint 2:
Follow the reference path in the note, continue through the archive and device image, inspect the metadata, and decode the character sequence using the appropriate conversion.

IMPORTANT:
The required evidence file must actually exist.

Ensure:

`archive-17.txt`

exists in the appropriate Archive location and is reachable through the intended evidence chain.

Do not simply place the answer somewhere obvious.

The participant must follow the intended chain.

--------------------------------------------------
TASK 12 — TRACE THE INCIDENT
--------------------------------------------------

Objective:
Reconstruct the incident by following the references across the system record, device evidence, archive record, and transfer record. Decode the final hexadecimal payload to recover the clearance code.

Answer:
SYMPO

Hint 1:
Evidence is spread across Documents, Pictures, Archive, and Transfers.

Hint 2:
Start with the system record and follow each file/reference identifier to the next piece of evidence. Reach the final transfer file and decode the hexadecimal payload into text.

IMPORTANT:
The objective must clearly communicate that this is a multi-file investigation chain.

Do not make the task simply "find a file".

The intended experience is:

system record
→ referenced evidence
→ next reference
→ archive/device/transfer evidence
→ final hexadecimal payload
→ decoded answer

==================================================
2. CANONICAL ANSWER SET
==================================================

The final Round 1 answers MUST be:

T01 = HIDE
T02 = ARLO
T03 = SECTOR-7
T04 = YELLOW
T05 = 9941
T06 = CYPHORA
T07 = RESCUE
T08 = 7314
T09 = 17
T10 = VECTOR
T11 = SHIFT
T12 = SYMPO

Search the entire repository for old/conflicting versions of these answers.

Pay special attention to:

- src/round1/taskContent.js
- src/round1/round1Engine.js
- backend/app/routers/stage1.py
- backend/app/schemas.py
- virtual filesystem/evidence definitions
- legacy round1/index.html
- task components
- converter components
- inspector components
- admin/task configuration
- static/build files if they are actually used

Do not leave contradictory answer definitions.

==================================================
3. SINGLE SOURCE OF TRUTH
==================================================

The current repository contains duplicated Round 1 task definitions.

There are currently multiple possible sources of truth, including frontend task content and backend `STAGE1_TASKS`.

Fix this architecture.

Prefer:

ONE canonical task definition.

The frontend and backend must not contain independently maintained conflicting answer lists.

If practical, create a shared task configuration/module that defines:

- task ID
- title
- objective
- hints
- expected answer
- accepted answer normalization rules
- evidence requirements
- task metadata

The backend must remain authoritative for scoring and validation.

Do NOT blindly expose the entire answer set to participants through the frontend.

Competition participants should not be able to simply inspect the frontend JavaScript and retrieve every answer.

If the current architecture requires frontend task metadata, do not include secret answers in the participant-facing bundle unless absolutely necessary.

==================================================
4. BACKEND ANSWER VALIDATION
==================================================

Fix the current backend validation bug.

Current behavior is effectively allowing validation to be skipped when `req.proof` is empty/null.

This is NOT acceptable.

A submission with:

- null answer
- empty answer
- whitespace
- missing answer

must NOT receive points.

Every task submission must be validated server-side.

Expected behavior:

1. Receive task ID.
2. Receive submitted answer/proof.
3. Normalize safely:
   - trim whitespace
   - normalize case where appropriate
4. Reject empty submissions.
5. Look up canonical task answer.
6. Compare against accepted answer(s).
7. Only then award completion/score.
8. Record the submission.
9. Prevent duplicate scoring for the same completed task.

Do not trust frontend completion state.

The frontend can display progress, but the backend must determine whether a task submission is correct.

==================================================
5. TASK 6 VALIDATION
==================================================

Specifically test Task 6 against these cases:

- random Decimal conversion → MUST NOT complete
- random ASCII conversion → MUST NOT complete
- random Hex conversion → MUST NOT complete
- random Base64 conversion → MUST NOT complete
- opening converter → MUST NOT complete
- converting an unrelated value → MUST NOT complete
- entering wrong answer → MUST NOT complete
- entering CYPHORA → MUST complete
- entering `cyphora` if answer normalization is case-insensitive → MUST complete
- entering whitespace around CYPHORA → MUST complete after trimming

If task-specific workflow events are tracked, they must remain separate from actual answer completion.

==================================================
6. HINT SYSTEM
==================================================

Replace ALL existing Round 1 hints with the canonical hints above.

Do not combine old hints with the new hints.

Do not make hints reveal the answer.

Hints should guide:

Hint 1:
WHERE to investigate.

Hint 2:
WHAT METHOD/TOOL/REASONING APPROACH to use.

Hints must not directly reveal:

- answer strings
- decoded values
- exact numerical answer
- exact metadata value
- exact QR result
- exact hex string
- exact Base64 payload
- exact final record

Also inspect the hint UI for accidental answer leakage.

==================================================
7. INSPECTOR ANSWER LEAKS
==================================================

Fix Metadata Inspector and all similar inspection tools.

Current issue:
Inspectors highlight or expose information that effectively gives the answer.

Remove/rework:

- answer highlighting
- suspicious automatic selection
- "copy answer" affordances
- copy buttons that directly expose the solution
- labels such as "Correct Value"
- visual emphasis around the exact answer
- hidden solution fields displayed in inspector UI

The inspector should behave like a realistic investigation tool.

It should show evidence.

The player must interpret the evidence themselves.

For example:

GOOD:
Author: ARLO

BAD:
Author: ARLO
[Correct Answer ✓]
[Copy Answer]

Similarly, if metadata contains a character sequence, display the evidence naturally without telling the participant what it means.

==================================================
8. FILE COMPARISON TOOL
==================================================

Task 5 and Task 10 depend on comparison.

The File Comparison Tool must NOT make the answer obvious.

Remove automatic visual answer highlighting.

Do not show:

"Changed value → 9941"

Do not color/highlight the exact answer.

Do not add "correct difference" labels.

The tool can show two files side-by-side or line-by-line.

The participant should determine the difference themselves.

The same rule applies to Task 10.

==================================================
9. START BUTTON BUG
==================================================

Fix:

"Start button requires two clicks to start."

Find the actual event/state issue.

The Start button must work on the first click.

Check for:

- duplicate state initialization
- stale React state
- asynchronous state race
- click handler depending on previous state
- overlay intercepting the first click
- disabled state being removed too late
- double event binding
- initialization requiring a second render

Make the handler deterministic and idempotent.

Test:

Single click → game starts.

Do not require double click.

==================================================
10. NEW TEAM / SESSION RESET
==================================================

Current problem:

Tabs/windows are still open even after a new team registers.

A new team must receive a clean virtual OS session.

When a new team/session starts:

RESET:

- open windows
- active apps
- tabs
- inspector state
- converter state
- file comparison state
- task app state
- temporary selections
- temporary clipboard state
- Show Hidden Files state
- task-specific ephemeral state
- previous team's UI state

DO NOT reset:

- authenticated current team identity
- legitimate server-side competition progress for that team

A new team must NEVER inherit another team's open applications or transient OS state.

Investigate localStorage/sessionStorage/global React state/context stores.

Do not simply reload the page and assume the state is clean.

Explicitly reset the virtual OS state.

==================================================
11. SHOW HIDDEN FILES
==================================================

Fix the startup state.

Current bug:
Show Hidden Files is always ON when the OS starts.

Required:

DEFAULT:
OFF

When participant manually enables it:
ON for the current session.

When a new team/session starts:
reset to OFF.

Task 8 should explicitly require the participant to discover and enable it.

Do not make hidden files permanently visible.

==================================================
12. FILE INPUT / APP DROPDOWN
==================================================

Current UI has an app dropdown/file selection mechanism that should be removed.

Do NOT make the task UI tell the player which application to use.

Participants should discover the correct application themselves.

Remove task-specific app suggestions from the task interface.

For files:

Use only the intended virtual OS mechanisms:

- upload
- drag and drop
- virtual file selection
- File Manager

Do not add a normal browser/native file picker if the competition architecture is intended to remain inside the simulated OS.

The task panel should not say:

"Open with Metadata Inspector"

unless that information is explicitly part of the hint system.

The participant should use the virtual OS to discover applications.

==================================================
13. TASKS AS AN OS APP
==================================================

Currently tasks appear as popups.

Change the task experience so that Tasks can function as a proper virtual OS application/window.

Requirements:

- Tasks should have an app/window identity.
- Tasks should appear in the taskbar.
- Task window should be resizable/minimizable according to OS conventions.
- Task information should not block the entire OS.
- Participant should be able to move between Task app and investigation apps naturally.
- Avoid modal popups that unnecessarily cover the OS.

The task app should contain:

- objective
- answer input
- submit button
- hint controls
- progress

Do not reveal the recommended application.

==================================================
14. SMALL WINDOW / SUBMIT BUTTON BUG
==================================================

Current issue:

Apps opened in small windows hide the Copy/Submit buttons.

Fix the responsive layout.

No important control should become inaccessible when a window is resized.

Ensure:

- minimum window dimensions
- responsive content
- footer controls remain visible
- scrolling works inside the correct area
- buttons don't disappear underneath content
- modal/dialog controls remain accessible

Test apps at:

- minimum supported window size
- normal size
- large size

==================================================
15. SCROLL LOCK
==================================================

Fix scroll locking in:

- Menu
- Story
- Task content
- other relevant OS overlays

Users must be able to scroll naturally.

Do not lock the entire document unnecessarily.

Use independent scroll containers where appropriate.

Ensure opening/closing menus or story screens does not permanently lock body scrolling.

==================================================
16. TASK 11 EVIDENCE
==================================================

Ensure the following evidence chain exists and works:

incident_note.txt
→ referenced archive evidence
→ archive-17.txt
→ referenced device image
→ device image metadata
→ character sequence
→ decode
→ SHIFT

The participant must actually be able to follow the chain.

Do not put the answer in an unrelated file.

Do not create dead references.

Verify every path and filename.

==================================================
17. TASK 12 EVIDENCE
==================================================

Build/verify a complete four-file incident chain.

Evidence should be distributed across:

Documents
Pictures
Archive
Transfers

The chain should require actual investigation.

The final transfer file contains the hexadecimal payload.

The participant must decode it to obtain:

SYMPO

Verify:

- all files exist
- all references are correct
- filenames match
- paths match
- metadata is accessible
- hexadecimal payload is correct
- task answer matches backend validation

==================================================
18. PICTURE ASSETS
==================================================

Currently some picture evidence does not have proper visual assets.

Add/repair the required images for ALL picture-based tasks.

At minimum inspect:

- evidence.jpg
- poster.png
- archive_photo.png
- Task 9 starting image
- Task 11 device image
- Task 12 device/evidence image(s)

Do not use placeholder images where the task depends on actual visual evidence.

Images must contain the intended evidence.

For example:

Task 3:
poster.png must contain a valid scannable optical matrix/QR-style payload corresponding to the intended clue.

Task 2:
evidence.jpg must contain metadata corresponding to the intended author.

Task 7:
archive_photo.png must contain the intended metadata/character-code evidence.

Task 11/12:
device/evidence images must contain the intended metadata and references.

Keep image dimensions/aspect ratios consistent where they are part of the story presentation.

==================================================
19. STORY / PROLOGUE IMAGES
==================================================

Beginning story/prologue images currently have inconsistent aspect ratios.

Normalize the presentation.

All story images should:

- use the same visual aspect ratio
- fit the same story panel/container
- avoid unexpected stretching
- avoid inconsistent cropping
- maintain consistent comic/story presentation

If necessary, crop/reframe existing images rather than distorting them.

==================================================
20. REMOVE OS HEADER
==================================================

Remove the unnecessary OS header from the virtual desktop.

The OS should feel like a clean simulated desktop environment.

Do not remove functionality that is genuinely required.

Preserve:

- taskbar
- desktop
- app controls
- required system indicators

But remove the redundant top header currently occupying space.

==================================================
21. DESKTOP ICON LABELS
==================================================

Fix broken desktop icon names.

Ensure:

- names render correctly
- no clipping
- no broken wrapping
- no overflow
- consistent alignment
- proper spacing

Test long and short application names.

==================================================
22. HELP / START FILE
==================================================

Add a simple virtual OS help/start file.

For example:

`START.txt`

or

`HELP.txt`

Place it on the virtual Desktop.

It should explain basic OS controls and navigation.

It may explain:

- how to open apps
- how to move windows
- how to use File Manager
- how to access files
- how to use the task application
- basic simulated OS controls

It MUST NOT provide task answers.

It MUST NOT tell players which application solves each task.

It should help first-time participants understand the simulated OS without reducing the investigation challenge.

==================================================
23. REMOVE RIGHT CLICK
==================================================

Remove/disable the right-click context menu from the virtual OS if it is not part of the intended competition mechanics.

Participants should not get browser/native context menus interfering with the simulation.

Ensure this does not break:

- text selection
- input fields
- accessibility
- normal left-click interactions

==================================================
24. POP CELEBRATION
==================================================

Redesign the task completion celebration.

Current celebration should be replaced with something cleaner and more polished.

Requirements:

- short
- visually satisfying
- does not block gameplay
- does not obscure important UI
- appropriate for a competition
- consistent with CYPHORA visual identity

Avoid excessive animation that causes performance issues.

After completion, participant must smoothly continue to the next task.

==================================================
25. TASKBAR
==================================================

Update taskbar behavior.

Taskbar icons and application names must accurately reflect the currently opened application.

For example:

File Manager
Terminal
Text Editor
Tasks
Metadata Inspector
Universal Converter
File Comparison
etc.

Do not show stale names.

Do not show duplicate tabs unnecessarily.

If an application is open:

- its taskbar entry should exist
- clicking it should focus the existing window
- it should not create unnecessary duplicates unless multi-instance behavior is intentional

==================================================
26. REMOVE TASK NUMBERS FROM APP DROPDOWN
==================================================

Do not display task numbers in generic app-selection/dropdown UI.

Applications should be represented by their actual names/icons.

Do not create UI such as:

Task 1 - Converter
Task 2 - Metadata Inspector

The OS should feel like an OS, not a list of solutions.

==================================================
27. JOURNEY PERCENTAGE
==================================================

Increase the font size and readability of:

- Journey Percentage
- progress indicator
- important completion percentage

Make it clearly readable during competition.

Do not allow it to dominate the interface.

==================================================
28. LEADERBOARD
==================================================

Increase leaderboard font size.

Make:

- team names
- rank
- score
- progress

easy to read at competition distance.

Maintain responsive behavior.

Do not break the live WebSocket leaderboard updates.

==================================================
29. TASK COMPLETION / STUCK AFTER 12 TASKS
==================================================

Fix the issue where the game becomes stuck after completing all 12 tasks.

Expected behavior:

T12 submitted correctly
→ backend validates
→ T12 marked completed
→ Round 1 completion state set
→ final celebration/state shown
→ participant can clearly see Round 1 is completed
→ no infinite loading
→ no stuck task
→ no attempt to unlock T13
→ timer stops appropriately
→ leaderboard/progress updates correctly

Verify:

- refresh behavior
- duplicate submission
- websocket update
- local state update
- backend state
- completion screen
- navigation after completion

The application must have a clean terminal state.

==================================================
30. TIMER / ROUND STATE
==================================================

Review Round 1 timer/state handling.

Ensure task completion and round completion do not create race conditions.

When all 12 tasks are completed:

- timer stops
- round status becomes completed
- final state is stable
- refresh does not accidentally reopen an incomplete task
- backend and frontend agree on completion state

Do not rely only on localStorage for competition completion.

==================================================
31. LEGACY ROUND 1 IMPLEMENTATION
==================================================

There appears to be a legacy/static Round 1 implementation under:

`round1/index.html`

Determine whether it is still used.

If it is unused:
- remove or clearly isolate it
- ensure it cannot accidentally become a second source of truth

If it is still used:
- bring it into alignment with the canonical implementation

Do not leave two competing Round 1 implementations with different tasks/answers.

==================================================
32. AUTH / TEAM SESSION
==================================================

Review registration/login flow.

When a team registers or logs in:

- establish clean session
- initialize clean virtual OS
- ensure no previous team's UI state leaks
- ensure task progress belongs to correct team
- ensure leaderboard identifies correct team
- ensure WebSocket session is correctly associated

Do not accidentally reset legitimate server-side progress when refreshing the UI.

==================================================
33. SECURITY / COMPETITION INTEGRITY
==================================================

Review the existing hardcoded secrets/passwords.

There are currently hardcoded admin credentials and a default JWT secret.

Do not expose sensitive credentials unnecessarily.

Move secrets into environment configuration where practical.

At minimum inspect:

- backend admin authentication
- admin password
- JWT secret
- frontend admin authentication assumptions

Do not break the current competition deployment.

The goal is to avoid shipping obvious production secrets in source code.

==================================================
34. TESTING REQUIREMENTS
==================================================

After implementation, test every task individually.

For each task verify:

1. Task opens.
2. Objective is correct.
3. Hint 1 is correct.
4. Hint 2 is correct.
5. Required evidence exists.
6. Evidence is discoverable.
7. Intended application works.
8. Wrong answer is rejected.
9. Correct answer is accepted.
10. Completion unlocks only the next task.
11. Score is awarded exactly once.
12. Refresh preserves legitimate progress.
13. New team does not inherit transient state.

Specifically test:

T01 → HIDE
T02 → ARLO
T03 → SECTOR-7
T04 → YELLOW
T05 → 9941
T06 → CYPHORA
T07 → RESCUE
T08 → 7314
T09 → 17
T10 → VECTOR
T11 → SHIFT
T12 → SYMPO

==================================================
35. NEGATIVE TESTS
==================================================

Test that these cannot accidentally complete tasks:

- opening an app
- opening a file
- clicking a hint
- using Converter
- scanning unrelated QR data
- comparing unrelated files
- opening Metadata Inspector
- copying text
- entering blank answer
- submitting whitespace
- performing an unrelated conversion
- closing/reopening apps
- refreshing the page
- opening hidden files before Task 8

No task should complete merely because the player performed an action associated with the task.

Final answer submission must remain authoritative.

==================================================
36. UX PRINCIPLE
==================================================

The core design principle is:

THE GAME SHOULD GIVE EVIDENCE, NOT SOLUTIONS.

The player should have to:

- investigate
- discover
- connect clues
- use tools
- decode information
- reason about evidence

Do NOT make the UI solve the puzzle for them.

Avoid:

- answer highlighting
- solution labels
- automatic answer copying
- explicit app recommendations outside hints
- task-specific solution buttons
- unnecessary confirmation messages containing the answer

==================================================
37. DO NOT OVERWRITE THE DESIGN
==================================================

Preserve the existing CYPHORA visual identity and architecture wherever possible.

Do not rewrite unrelated components.

Do not replace the entire OS implementation.

Do not introduce unnecessary dependencies.

Do not remove working functionality unless it conflicts with the requirements above.

Prefer small, testable changes.

==================================================
38. IMPLEMENTATION WORKFLOW
==================================================

Before editing:

1. Inspect the repository structure.
2. Identify the active Round 1 entry point.
3. Trace task definitions from frontend → engine → backend.
4. Trace task submission from UI → API → database → leaderboard.
5. Identify all duplicate task definitions.
6. Identify virtual filesystem/evidence definitions.
7. Identify state persistence.
8. Identify window/tab management.
9. Identify inspector/converter/comparison implementations.

Then implement the changes.

After implementation:

1. Search the entire repo for old task answers/hints.
2. Search for conflicting task definitions.
3. Search for old Task 6 completion logic.
4. Search for Show Hidden default state.
5. Search for old Task 11 filename references.
6. Search for inspector answer-highlighting logic.
7. Search for File Comparison highlighting.
8. Search for task-number dropdown logic.
9. Search for stale taskbar labels.
10. Search for old completion/final-state behavior.

==================================================
39. FINAL ACCEPTANCE CRITERIA
==================================================

The implementation is complete only when all of the following are true:

[ ] Start button works with one click.

[ ] New team receives a clean virtual OS session.

[ ] Old tabs/windows do not leak between teams.

[ ] Show Hidden Files starts OFF.

[ ] App dropdown no longer acts as a task solution selector.

[ ] Files can be accessed through the intended virtual OS mechanisms.

[ ] All 12 task objectives match the canonical specification.

[ ] All 12 Hint 1 values match the canonical specification.

[ ] All 12 Hint 2 values match the canonical specification.

[ ] All 12 answers match the canonical answer set.

[ ] Backend validates every answer.

[ ] Empty/null submissions cannot receive points.

[ ] Task 6 cannot be completed by arbitrary conversion.

[ ] Task 6 only completes with CYPHORA.

[ ] Metadata Inspector does not leak answers through highlighting/copy UI.

[ ] File Comparison does not highlight the answer.

[ ] Task 11 contains the required `archive-17.txt` evidence.

[ ] Task 11 chain actually works.

[ ] Task 12 chain actually works.

[ ] Task 12 final hexadecimal payload decodes to SYMPO.

[ ] All required image evidence exists.

[ ] Story images have consistent aspect ratio.

[ ] OS header is removed.

[ ] Desktop icon names are fixed.

[ ] START/HELP file exists.

[ ] Right-click context menu is removed.

[ ] Tasks can function as an OS application/window.

[ ] Taskbar names/icons correctly reflect open applications.

[ ] Task numbers are removed from generic app dropdowns.

[ ] Small app windows do not hide important buttons.

[ ] Menu/story scrolling works.

[ ] Journey percentage is readable.

[ ] Leaderboard is readable.

[ ] Completion celebration is redesigned.

[ ] Completing T12 does not leave the game stuck.

[ ] Round 1 reaches a stable completed state.

[ ] Legacy Round 1 implementation does not conflict with the active implementation.

[ ] No duplicate/conflicting task answer definitions remain.

[ ] No obvious hardcoded production secret remains where environment configuration can be used.

==================================================
40. IMPORTANT FINAL INSTRUCTION
==================================================

Do not simply modify the visible UI and stop.

Trace every requirement through the complete system:

UI
→ virtual OS
→ task engine
→ task state
→ API
→ backend validation
→ database
→ leaderboard
→ completion state

The competition must remain logically secure.

A participant should not be able to receive points without actually submitting the correct answer.

The final implementation must use the canonical Round 1 specification supplied in this prompt.

After completing the implementation, provide a concise report containing:

1. Files changed
2. Major changes made
3. Task-by-task verification
4. Bugs fixed
5. Any remaining issues
6. Any architectural deviations from the existing implementation and why