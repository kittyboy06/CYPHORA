# CYPHORA // OS NAVIGATOR

## ROUND 1 — FINAL TASK SYSTEM BUILD SPECIFICATION

You are working on an existing competition application.

Your task is to implement the final Round 1 investigation system described below.

This is a FUNCTIONAL implementation request.

Do not only modify text or visuals.

You must correctly implement:

* task data
* virtual filesystem
* virtual file selection
* application interactions
* task state
* hints
* answer submission
* answer validation
* progression
* multi-step investigation
* application state
* task analytics

---

# 0. MOST IMPORTANT CONCEPT

Round 1 is a **simulated computer investigation game**.

The OS is the environment.

Participants are NOT being tested on operating-system internals.

Do NOT center the tasks around:

* PID
* processes
* services
* kernel
* systemctl
* advanced Linux
* advanced networking
* checksums
* cryptography
* obscure commands

Instead, the challenge should be:

```text
READ TASK
    ↓
THINK
    ↓
EXPLORE THE VIRTUAL COMPUTER
    ↓
FIND THE RELEVANT FILE / INFORMATION
    ↓
CHOOSE AN APPLICATION
    ↓
PERFORM THE OPERATION
    ↓
INTERPRET THE RESULT
    ↓
USE RESULT FOR NEXT STEP
    ↓
DERIVE FINAL VALUE
    ↓
ENTER FINAL VALUE
    ↓
SUBMIT
```

---

# 1. ABSOLUTE RULE — THE TASK PANEL MUST NOT GIVE THE SOLUTION

The participant must discover the solution path.

The task panel should NOT tell them:

* which application to use
* which file to open
* which conversion to perform
* which encoding is being used
* what the next step is
* what intermediate value to look for

The task panel should only explain:

1. The situation.
2. What the participant ultimately needs to obtain.

---

# 2. TASK QUESTION STYLE

The question must describe the desired outcome without revealing the technical method.

## BAD

> Convert the binary value to ASCII.

## GOOD

> Convert the encoded value into a human-readable format and enter the resulting message below.

---

## BAD

> Convert hexadecimal to decimal.

## GOOD

> Convert the recovered value into a 0–9 numerical format and enter the result below.

---

## BAD

> Use Metadata Inspector to find the author.

## GOOD

> Investigate the file's stored information and enter the recorded author below.

---

## BAD

> Scan the QR code.

## GOOD

> The image contains information that cannot be read directly. Determine what it reveals and enter the result below.

The participant should know WHAT they need.

They should discover HOW to get it.

---

# 3. TASK PANEL

Keep the task panel clean.

It should look approximately like:

```text
┌──────────────────────────────────────┐
│ TASK 06 / 12                      — │
│                                      │
│ THE FRAGMENTED PASSWORD              │
│                                      │
│ Three pieces of information were     │
│ recovered from the workstation.      │
│ Reconstruct them in the correct      │
│ order and recover the final value.   │
│                                      │
│ FINAL ANSWER                         │
│                                      │
│ [_______________________________]    │
│                                      │
│        [ SUBMIT ANSWER ]             │
│                                      │
│        [? HINT]                      │
└──────────────────────────────────────┘
```

Do NOT show:

```text
Recommended App
Step 1
Step 2
Step 3
Binary
ASCII
Hex
Base64
Metadata Inspector
Universal Converter
```

unless the user discovers them inside the applications.

---

# 4. TASK PANEL IS NOT THE WORKSPACE

The virtual OS is the workspace.

The participant can minimize the task panel and investigate the computer.

The task panel should not automatically open an application.

The task panel should not automatically load evidence.

The task panel should not automatically populate inputs.

The task panel should not inject task values into applications.

---

# 5. VIRTUAL OS FILE SYSTEM

All Round 1 evidence must exist inside a simulated filesystem.

Example:

```text
/
├── Desktop/
├── Documents/
├── Downloads/
├── Pictures/
├── Archive/
├── Evidence/
├── Clues/
└── Shared/
```

Participants interact with this filesystem through the simulated OS.

---

# 6. NEVER USE THE REAL COMPUTER FILESYSTEM

Round 1 must NOT use the browser's native file picker.

Do NOT use:

```html
<input type="file">
```

for Round 1 evidence.

Do NOT open:

```text
Windows Explorer
macOS Finder
Linux native file picker
```

All file selection must remain inside the simulated OS.

---

# 7. VIRTUAL FILE SELECTION

Applications that need files must have a custom virtual-file selection mechanism.

Example:

```text
[ SELECT VIRTUAL FILE ]
```

opens:

```text
┌──────────────────────────────────────┐
│ VIRTUAL FILES                        │
├──────────────────────────────────────┤
│ Desktop                              │
│ Documents                            │
│ Downloads                            │
│ Pictures                             │
│ Evidence                             │
│ Archive                              │
│                                      │
│                 [CANCEL] [OPEN]      │
└──────────────────────────────────────┘
```

The participant must choose the file themselves.

Do NOT automatically select the correct file.

---

# 8. APPLICATIONS

Round 1 should contain:

* Universal Converter
* Metadata Inspector
* QR Scanner
* Image Inspector
* File Manager
* Text Editor
* File Comparison
* Text Analyzer
* Audio Inspector
* Terminal

The participant discovers which application is useful.

---

# 9. APPLICATIONS MUST OPEN EMPTY

This is critical because the current screenshot shows incorrect behavior.

For example, Universal Converter currently appears to already contain the task's encoded data.

REMOVE THAT BEHAVIOR.

When opened:

```text
INPUT:
[ empty ]

FROM:
[ default ]

TO:
[ default ]

[ CONVERT ]

OUTPUT:
[ empty ]
```

No task evidence should be prefilled.

Same principle for every application.

---

# 10. NO AUTOMATIC DATA FLOW

Do NOT implement:

```text
Task started
↓
Converter automatically gets task input
```

Do NOT implement:

```text
Metadata opened
↓
Value automatically sent to Converter
```

Do NOT implement:

```text
Converter output
↓
Answer field automatically filled
```

Every transfer must be performed manually by the participant.

---

# 11. APPLICATION OUTPUT DOES NOT COMPLETE TASK

These events NEVER complete a task:

```text
File selected
Metadata extracted
QR scanned
Image analyzed
Conversion completed
Text compared
File opened
Output copied
Application opened
```

They are investigation events only.

---

# 12. ONLY ANSWER SUBMISSION COMPLETES TASK

The ONLY completion condition:

```text
Participant derives final answer
        ↓
Manually enters answer
        ↓
Clicks SUBMIT ANSWER
        ↓
System validates
        ↓
Correct
        ↓
TASK COMPLETED
```

Do not allow any application action to bypass this.

---

# 13. HINT SYSTEM

RESTORE THE HINT SYSTEM.

Every task should have:

```text
[ ? HINT ]
```

At least one hint.

Harder tasks should have two hints.

Hint structure:

### Hint 1

Conceptual direction.

Example:

> Think about what kind of information can be stored alongside the visible contents of a file.

### Hint 2

Directional guidance.

Example:

> One of the workstation applications can reveal additional information attached to the file.

Hints MUST NOT directly reveal the full solution.

Do not say:

> Open Metadata Inspector, choose evidence.jpg, copy Description, then use Hex → Decimal.

That defeats the task.

---

# 14. TASK PROGRESSION

Initially:

```text
Task 1 = AVAILABLE

Tasks 2–12 = LOCKED
```

Correctly submitting Task 1 unlocks Task 2.

The next task must NOT unlock because the participant:

* opened an app
* found a file
* clicked Convert
* scanned a QR
* viewed metadata

Only correct final answer submission unlocks the next task.

---

# 15. TASK DIFFICULTY

Use this exact structure:

```text
TASK 01 → EASY
TASK 02 → EASY
TASK 03 → EASY
TASK 04 → EASY
TASK 05 → EASY

TASK 06 → HARD
TASK 07 → MEDIUM+
TASK 08 → HARD
TASK 09 → HARD
TASK 10 → HARD

TASK 11 → VERY HARD
TASK 12 → BOSS
```

The major difficulty increase happens after Task 5.

---

# 16. TASKS 1–5

These are single-concept tasks.

They should involve:

```text
Find evidence
↓
Choose application
↓
Perform ONE main conceptual operation
↓
Determine answer
↓
Submit
```

Do not add fake complexity.

---

# TASK 01 — ENCODED MESSAGE

## Evidence

Virtual file:

```text
/Desktop/message.txt
```

Contents can be:

```text
72 73 68 69
```

or another suitable encoded representation.

The actual representation must be recognizable from the data itself.

## Question

Display ONLY:

> Convert the encoded value into a human-readable format and enter the resulting message below.

Do NOT mention:

* Binary
* ASCII
* Decimal
* Converter

The participant should inspect the file and discover the correct transformation.

## Expected final answer

```text
HIDE
```

## Completion

The participant MUST:

```text
Find message.txt
↓
Open it
↓
Choose relevant application
↓
Transform value
↓
Obtain HIDE
↓
Manually type HIDE
↓
SUBMIT ANSWER
```

---

# TASK 02 — FILE INFORMATION

## Evidence

Virtual file:

```text
/Pictures/evidence.jpg
```

Metadata contains:

```text
Author: ARLO
```

## Question

> Investigate the file's stored information and enter the recorded author below.

Do NOT say:

> Use Metadata Inspector.

Participant must find the appropriate application.

## Final answer

```text
ARLO
```

---

# TASK 03 — IMAGE MESSAGE

## Evidence

Virtual image:

```text
/Pictures/poster.png
```

It contains an optical/machine-readable code.

## Question

> Determine what the information embedded in the image reveals and enter the resulting value below.

Do NOT use the words:

```text
QR
QR code
QR Scanner
```

## Final answer

```text
SECTOR-7
```

Scanning is NOT completion.

Participant must manually submit:

```text
SECTOR-7
```

---

# TASK 04 — ORDERING / REASONING

## Evidence

Virtual file:

```text
/Documents/access.log
```

Contents:

```text
[04:12] BLUE
[04:07] RED
[04:19] GREEN
[04:03] YELLOW
[04:15] WHITE
```

## Question

> The records are out of order. Determine the earliest recorded event and enter its associated value.

## Final answer

```text
YELLOW
```

No special application is required.

The task tests observation and reasoning.

---

# TASK 05 — FILE COMPARISON

## Evidence

Two virtual files:

```text
/Documents/message_old.txt
/Documents/message_new.txt
```

They contain almost identical information.

One value has changed.

## Question

> The two records are almost identical. Determine what value changed between them and enter that value below.

## Final answer

```text
9941
```

Participant must discover the File Comparison application.

The comparison output does NOT complete the task.

---

# 17. TASKS 6–10

These MUST require at least three meaningful reasoning/operation steps.

A multi-step task means:

```text
Step 1 result
      ↓
is needed for
      ↓
Step 2
      ↓
produces something needed for
      ↓
Step 3
```

Do not count:

```text
click
open
close
move window
```

as meaningful steps.

---

# TASK 06 — THE FRAGMENTED PASSWORD

## Purpose

First major difficulty jump.

## Evidence

Three virtual files:

```text
/Documents/fragment_01.txt
/Documents/fragment_02.txt
/Documents/fragment_03.txt
```

Contents:

### fragment_01.txt

```text
4A
```

Timestamp:

```text
09:31
```

### fragment_02.txt

```text
55 4D
```

Timestamp:

```text
09:42
```

### fragment_03.txt

```text
50
```

Timestamp:

```text
09:56
```

The participant does NOT initially know the order.

## Question

> Three fragments of a recovered message were found separately. Reconstruct them in the correct order, interpret the combined value, and enter the final message below.

Do NOT mention:

* timestamps as the exact solution method
* hexadecimal
* ASCII
* converter

## Expected chain

```text
Find three files
↓
Inspect their timestamps
↓
Determine order
↓
Combine:
4A + 55 4D + 50
↓
4A 55 4D 50
↓
Interpret/convert
↓
JUMP
↓
Submit JUMP
```

## Final answer

```text
JUMP
```

---

# TASK 07 — METADATA → CONVERSION

IMPORTANT:

DO NOT reuse:

```text
/Pictures/evidence.jpg
```

from Task 2.

Create a different evidence file.

## Evidence

```text
/Pictures/archive_photo.png
```

Metadata contains:

```text
Description:
72 69 76 80
```

## Question

> Important information is stored with the file rather than in its visible contents. Recover that value, interpret it, and enter the readable message below.

Do NOT mention:

* metadata
* Decimal
* ASCII
* Converter
* conversion sequence

## Intended chain

```text
Find archive_photo.png
↓
Inspect stored file information
↓
Find Description
↓
Recover:
72 69 76 80
↓
Interpret as character values
↓
Convert appropriately
↓
Readable message:
HELP
↓
Submit
```

Use enough conversion interaction that the participant must reason about the representation.

Do not automatically send the Description into the converter.

The participant manually copies/pastes it.

## Final answer

```text
HELP
```

---

# TASK 08 — HIDDEN EVIDENCE

This is the ONLY hidden-folder task in the entire round.

Do NOT use hidden folders anywhere else.

## Virtual filesystem

There is one concealed location:

```text
/Archive/.hidden/
```

Inside:

```text
clue.txt
```

## Question

> The visible folders do not contain the required evidence. Something appears to have been deliberately concealed. Locate the hidden information and enter the value you recover.

The participant must reason that information has been hidden.

Once the hidden file is found, keep the final operation simple.

For example:

```text
clue.txt

The missing value is:
7314
```

## Final answer

```text
7314
```

This task is about discovering the concealed information.

Do not combine hidden-folder mechanics with another complicated puzzle.

---

# TASK 09 — THE EVIDENCE NETWORK

## Evidence

Three virtual files:

```text
/Pictures/map.png
/Documents/clues/index.txt
/Documents/logs/activity.log
```

The image contains machine-readable information.

The image's embedded value:

```text
CLUE-42
```

`index.txt` contains:

```text
CLUE-17 → notes.txt
CLUE-31 → archive.txt
CLUE-42 → activity.log
CLUE-58 → report.txt
```

`activity.log` contains:

```text
08:14 USER-A LOGIN
08:21 USER-B LOGIN
08:37 USER-A DOWNLOAD FILE=17
08:42 USER-C LOGIN
08:51 USER-A LOGOUT
09:03 USER-B DOWNLOAD FILE=22
```

## Question

> Follow the information from the first piece of evidence to the next, then determine the final value associated with the requested activity.

The participant must determine:

```text
map.png
↓
machine-readable result
↓
CLUE-42
↓
index.txt
↓
activity.log
↓
CLUE-42's relevant activity
↓
FILE=17
↓
Submit
```

## Final answer

```text
17
```

Do NOT mention QR in the task question.

Do NOT tell them to search index.txt.

The participant must decide how to follow the clue.

---

# TASK 10 — DIFF → INTERPRET → CONVERT

## Evidence

Two different files:

```text
/Documents/alpha.txt
/Documents/beta.txt
```

Example:

### alpha.txt

```text
STATUS=READY
TOKEN=ACTIVE
NOTE=48 45 4C 50
```

### beta.txt

```text
STATUS=READY
TOKEN=ACTIVE
NOTE=4A 55 4D 50
```

## Question

> Two versions of the record contain one meaningful change. Identify the changed information, interpret it, and enter the resulting message below.

Expected:

```text
Compare
↓
changed value = 4A 55 4D 50
↓
interpret encoded value
↓
JUMP
↓
Submit
```

## Final answer

```text
JUMP
```

This is deliberately different from Task 5 because Task 5 only asks for the changed value, while Task 10 requires interpreting the changed value.

---

# 18. TASK 11 — CROSS-APPLICATION INVESTIGATION

Do NOT repeat the exact Metadata → Converter pattern from Task 7.

Start from a different kind of evidence.

## Example evidence

```text
/Documents/incident_note.txt
```

Contents:

```text
The trail begins where the picture ends.

REFERENCE:
ARCHIVE-17
```

Participant must:

```text
Open note
↓
Identify ARCHIVE-17
↓
Find related file
↓
Open archive-17
↓
Discover another clue
↓
Use appropriate application
↓
Derive final value
↓
Submit
```

For example:

```text
/archive/archive-17.txt

NEXT:
DEVICE-9
```

Then:

```text
/Pictures/device-9.jpg
```

Metadata is:

```text
Description:
53 48 49 46 54
```

Participant converts it.

Final result:

```text
SHIFT
```

## Question

> The evidence points from one file to another. Follow the trail across the workstation and recover the final value requested below.

## Final answer

```text
SHIFT
```

The important difference from Task 7:

Task 7 begins with an image and hidden file information.

Task 11 begins with a text clue and requires:

```text
text clue
→ file relationship
→ second file
→ image
→ information
→ interpretation
```

---

# 19. TASK 12 — FINAL BOSS: TRACE THE TRANSFER

Do not make this a generic Linux/system-debugging task.

It is an evidence reconstruction puzzle.

## Mission briefing

> Four pieces of evidence were recovered from different areas of the workstation. They appear unrelated, but together they describe a single trail. Follow the evidence from one clue to the next and recover the final clearance code.

## Evidence 1

```text
/Documents/system.log
```

Contents:

```text
08:15 — SYSTEM START
08:27 — FILE ACCESS
08:43 — UNKNOWN DEVICE
08:51 — FILE TRANSFER
09:02 — SYSTEM LOCK
```

The important clue is:

```text
UNKNOWN DEVICE
```

## Evidence 2

```text
/Pictures/device.png
```

The file's stored information contains:

```text
Device ID:
VX-27
```

Participant must discover this independently.

## Evidence 3

The virtual filesystem contains:

```text
/Documents/Archive/VX-27.txt
```

Contents:

```text
DEVICE: VX-27

TRANSFER ID:
TR-904
```

## Evidence 4

The virtual filesystem contains:

```text
/Documents/Transfers/TR-904.txt
```

Contents:

```text
PAYLOAD:
53 59 4D 50 4F
```

Participant interprets it and obtains:

```text
SYMPO
```

## Question

Display ONLY:

> Four pieces of evidence from the workstation describe the same trail. Follow the connections between them and recover the final clearance code.

Do NOT mention:

* system log
* metadata
* Device ID
* VX-27
* transfer ID
* hexadecimal
* ASCII
* converter

Those must be discovered.

## Final answer

```text
SYMPO
```

---

# 20. TASK 12 INVESTIGATION PATH

Internally the task engine may know:

```text
system.log
↓
UNKNOWN DEVICE
↓
device.png
↓
stored device information
↓
VX-27
↓
VX-27.txt
↓
TR-904
↓
TR-904.txt
↓
encoded payload
↓
conversion
↓
SYMPO
```

But NEVER show this sequence to the participant.

---

# 21. UNIVERSAL CONVERTER

Fix and standardize the converter.

It must open EMPTY.

It must NEVER receive task data automatically.

Supported choices:

### Binary

```text
Binary → Decimal
Binary → Hexadecimal
Binary → ASCII
Binary → Octal
```

### Decimal

```text
Decimal → Binary
Decimal → Hexadecimal
Decimal → ASCII
Decimal → Octal
```

### Hexadecimal

```text
Hexadecimal → Binary
Hexadecimal → Decimal
Hexadecimal → ASCII
```

### ASCII

```text
ASCII → Binary
ASCII → Decimal
ASCII → Hexadecimal
ASCII → Text
```

### Base64

```text
Base64 → Text
Text → Base64
```

### URL

```text
URL Encode
URL Decode
```

### Octal

```text
Octal → Decimal
Decimal → Octal
```

---

# 22. CONVERTER BEHAVIOR MUST BE CONSISTENT

The current screenshot shows a mismatch where:

```text
FROM: Binary
TO: ASCII

OUTPUT:
72 69 76 80
```

This is inconsistent if the application claims that ASCII output is characters.

Fix the conversion semantics.

Every operation must have a predictable and correctly labelled output.

Do NOT make:

```text
Binary → ASCII
```

produce a decimal-number list while calling it ASCII.

Choose one consistent internal representation and use it everywhere.

Run tests for every conversion.

---

# 23. NO AUTO-DETECT

Do NOT add:

```text
Auto Detect
Smart Decode
Magic Decode
Auto Solve
```

Participants must choose the operation.

---

# 24. NO AUTO-CHAINING

If a participant performs:

```text
Hexadecimal → Decimal
```

and receives:

```text
74 85 77 80
```

the system must STOP there.

It should NOT automatically perform another conversion.

The participant must decide what to do next.

---

# 25. NO AUTOMATIC ANSWER COPY

If an application produces:

```text
JUMP
```

do NOT automatically place:

```text
JUMP
```

into the task answer box.

The participant manually copies/pastes/types it.

---

# 26. TASK ANSWER FLOW

Every task uses:

```text
FINAL ANSWER
[____________________________]

[ SUBMIT ANSWER ]
```

Participant enters their answer.

Clicking Submit validates it.

---

# 27. WRONG ANSWER

Show:

```text
Not quite.

Review the evidence and try again.
```

Do not reveal the correct answer.

Do not automatically open an app.

Do not reveal the next step.

---

# 28. CORRECT ANSWER

Show:

```text
✓ CORRECT

Investigation complete.
```

Then unlock the next task.

---

# 29. HINTS

The hint button must always be available.

For Task 1:

```text
Hint:
Think about what kind of representation the recovered value uses.
```

For Task 6:

```text
Hint 1:
The fragments contain more than just data. Compare the information associated with each file.

Hint 2:
The pieces need to be reconstructed before they can be interpreted.
```

For Task 7:

```text
Hint 1:
Useful information may exist outside the visible image.

Hint 2:
Look for an application that can reveal information stored with a file.
```

For Task 9:

```text
Hint 1:
The first result is not the final answer.

Hint 2:
Use the recovered identifier to locate the next evidence.
```

For Task 12:

```text
Hint 1:
The evidence becomes useful when you connect information found in different files.

Hint 2:
A value discovered in one piece of evidence can help you locate another.
```

Do not expose full procedures.

---

# 30. TASK STEP TRACKING

Internally track meaningful actions.

For example:

```ts
{
  taskId,
  events: [
    "file_opened",
    "metadata_viewed",
    "value_copied",
    "converter_opened",
    "conversion_performed",
    "result_copied",
    "answer_submitted"
  ]
}
```

For multi-step tasks, maintain an internal logical progression.

BUT:

Do not force a rigid click sequence if there is another legitimate route to the same result.

---

# 31. MULTI-STEP TASK VALIDATION

For Tasks 6–12, the task engine should understand the intended investigation chain.

However:

The participant does NOT have to visibly complete a checklist.

Do NOT show:

```text
✓ Step 1
✓ Step 2
✓ Step 3
```

This is an investigation game, not a guided tutorial.

---

# 32. IMPORTANT — DO NOT COUNT UI ACTIONS AS STEPS

These are NOT meaningful steps:

```text
Open app
Move app window
Minimize app
Copy button
Close app
Open task panel
```

Meaningful steps are:

```text
identify evidence
interpret representation
reconstruct data
extract useful information
use one result as another input
compare records
derive a value
```

---

# 33. TASK VARIETY

Ensure the final 12 tasks feel different.

Use:

```text
01 → conversion
02 → file investigation
03 → image investigation
04 → chronological reasoning
05 → comparison

06 → reconstruction + conversion
07 → file information + conversion
08 → hidden evidence
09 → cross-file investigation
10 → comparison + interpretation

11 → cross-application evidence trail
12 → full evidence reconstruction
```

Do NOT repeat one mechanic unnecessarily.

---

# 34. ONLY ONE HIDDEN FOLDER

Exactly ONE task may use:

```text
.hidden
```

No other task may depend on hidden folders/files.

---

# 35. NO EXTERNAL SEARCH REQUIRED

Everything necessary to solve a task must be inside the virtual computer.

Do not require:

```text
Google
internet
external decoder
external QR scanner
external metadata site
ChatGPT
```

---

# 36. FILE DISCOVERY SHOULD NOT BE TEDIOUS

The challenge is NOT:

> "Can you search 100 files?"

Do not put dozens of irrelevant files into directories.

The participant should have enough information to reason about where useful evidence is.

File discovery should take thinking, not excessive clicking.

---

# 37. TASK PANEL SHOULD NOT DISPLAY INTERNAL EVIDENCE PATHS

Do NOT show:

```text
Evidence:
 /Pictures/evidence.jpg
```

inside the task panel if the participant is supposed to discover the file themselves.

The paths in this specification are for IMPLEMENTATION ONLY.

The participant should discover the files through the virtual OS.

---

# 38. IMPORTANT: FILES SHOULD STILL BE PROVIDED

Do not interpret "participants find the file themselves" as requiring them to bring files from their real computer.

The competition supplies all evidence.

The evidence is simply placed inside the virtual OS.

The participant discovers it there.

---

# 39. ROUND 2 MUST REMAIN SEPARATE

Round 2 can continue using participant-generated/uploaded images.

Do not modify Round 2 to use the Round 1 virtual evidence model.

The distinction is:

```text
ROUND 1:
Provided evidence inside virtual OS
↓
Investigate
↓
Derive answer
↓
Submit

ROUND 2:
Participant creates image
↓
Upload own generated image
↓
Evaluate image
```

---

# 40. UI REQUIREMENT

The task panel must not cover the entire application.

The current screenshot shows the task window substantially covering the converter.

Fix the layout.

Recommended:

* draggable task panel
* minimizable task panel
* compact dimensions
* does not block most of the workspace
* answer field always available when task panel is open
* apps remain usable behind it

When minimized, show a small task indicator such as:

```text
TASK 06
```

Clicking it restores the panel.

---

# 41. DO NOT PRESELECT THE APPLICATION

At task start:

```text
Desktop visible
Task panel visible
No app opened
No evidence loaded
```

The participant decides what to open.

---

# 42. DO NOT PRESELECT CONVERSION

When Universal Converter opens:

```text
Input = empty
From = default
To = default
Output = empty
```

Do not automatically select:

```text
Binary
ASCII
Hex
Decimal
```

based on the current task.

The participant must choose.

---

# 43. FINAL ACCEPTANCE TEST — TASK 7

Run this manually.

### Start Task 7

Expected:

```text
Task question only
Answer field
Hint button
Desktop
```

No application opens.

### Participant finds archive_photo.png

Expected:

```text
file discovered
```

### Participant opens Metadata Inspector

Expected:

```text
No file selected initially
```

### Participant manually selects archive_photo.png

Expected:

```text
metadata appears
```

### Metadata contains:

```text
72 69 76 80
```

### Participant manually copies the value

### Participant opens Converter

Expected:

```text
input = empty
```

### Participant manually pastes:

```text
72 69 76 80
```

### Participant performs conversion

Task remains:

```text
INCOMPLETE
```

### Participant obtains:

```text
HELP
```

Task STILL remains:

```text
INCOMPLETE
```

### Participant enters:

```text
HELP
```

into answer box.

Clicks:

```text
SUBMIT ANSWER
```

Only now:

```text
CORRECT
TASK COMPLETE
TASK 8 UNLOCKED
```

---

# 44. FINAL ACCEPTANCE TEST — TASK 12

Start Task 12.

Verify:

```text
No app automatically opened
No file automatically selected
No evidence preloaded
No conversion preselected
No answer prefilled
```

Participant must independently:

```text
discover system.log
↓
interpret clue
↓
discover relevant image
↓
inspect its stored information
↓
obtain identifier
↓
locate associated file
↓
obtain transfer identifier
↓
locate next file
↓
interpret final encoded value
↓
derive SYMPO
↓
manually enter SYMPO
↓
SUBMIT ANSWER
```

Before final submission, task must remain incomplete.

---

# 45. IMPLEMENTATION ORDER

DO NOT attempt to build all tasks at once.

Follow this order.

## PHASE 1 — INSPECT

Inspect the existing architecture.

Find:

* task system
* virtual filesystem
* desktop
* applications
* converter
* task panel
* hints
* answer validation
* Round 2 upload flow

---

## PHASE 2 — FIX TASK ENGINE

First implement:

```text
task started
task active
answer entered
answer submitted
answer validated
task completed
next unlocked
```

Make sure only answer submission can complete a task.

---

## PHASE 3 — FIX VIRTUAL FILE SYSTEM

Ensure task evidence exists as virtual files.

Ensure applications consume virtual files.

Ensure no native file picker is used.

---

## PHASE 4 — FIX APPLICATIONS

Make applications open clean.

Fix converter semantics.

Fix metadata inspector.

Fix QR scanner.

Fix file comparison.

Fix file manager.

---

## PHASE 5 — HINTS

Restore the hint UI and hint data system.

---

## PHASE 6 — IMPLEMENT TASKS 1–5

Test that they work as single-concept tasks.

---

## PHASE 7 — IMPLEMENT TASKS 6–10

Build the real multi-step chains.

Test that intermediate results are not automatically transferred.

---

## PHASE 8 — IMPLEMENT TASKS 11–12

Build the advanced investigation chains.

---

## PHASE 9 — TEST THE ENTIRE ROUND

Test:

```text
Task 1
↓
2
↓
3
↓
...
↓
12
```

Verify no task can accidentally complete from an app action.

---

# 46. FINAL IMPLEMENTATION RULE

At no point should the software think:

> "The participant clicked the correct application, so they probably solved it."

The only authoritative completion event is:

```text
CORRECT FINAL ANSWER SUBMITTED
```

Everything else is investigation.

---

# 47. FINAL DESIGN TARGET

The participant should experience:

```text
TASK
 ↓
"What do they want me to find?"
 ↓
"What information do I have?"
 ↓
"Where is that information?"
 ↓
"Which application can help?"
 ↓
"Okay, what did I just obtain?"
 ↓
"How does this connect to the next clue?"
 ↓
"Now I have the final value."
 ↓
"Enter it."
 ↓
"Submit."
 ↓
"CORRECT."
```

That is the intended CYPHORA Round 1 experience.

BUILD THE SYSTEM TO SUPPORT THIS EXPERIENCE.
