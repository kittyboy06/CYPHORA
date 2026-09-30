# CYPHORA ROUND 1 — TASK DESCRIPTION REDESIGN

The current Round 1 task descriptions are not good enough.

The current UI uses generic descriptions such as:

> "An intercepted signal stream from an unknown relay has been saved on your workstation."

followed by:

> "Convert the encoded value into a human-readable format and enter the resulting message below."

This feels like a generic worksheet rather than an immersive technical investigation.

REDESIGN THE PLAYER-FACING TASK DESCRIPTIONS.

This is primarily a **content + UX clarity correction**.

Do NOT redesign the underlying task logic unless necessary.

---

# 1. PLAYER-FACING TASK STRUCTURE

Every task should contain exactly these conceptual sections:

```text
TASK NUMBER

TASK TITLE

SHORT SCENARIO / CONTEXT

OBJECTIVE

FINAL ANSWER
[ answer field ]

[ SUBMIT ANSWER ]

[ ? HINT ]
```

The scenario should usually be 1–2 short sentences.

The objective should usually be 1–2 short sentences.

Do not create long paragraphs.

---

# 2. DO NOT REVEAL THE SOLUTION METHOD

The task description must NOT tell participants:

* which app to open
* which file to choose
* which conversion to use
* what encoding is being used
* what application comes next
* the number of steps
* the full solution path

For example:

## BAD

> Open the Metadata Inspector, select the image, copy the metadata description, then convert it using Hexadecimal → Decimal.

## GOOD

> The image contains information that is not visible when viewed normally. Investigate the file and recover the readable value hidden within it.

---

# 3. DO NOT USE TECHNICAL TYPE NAMES UNNECESSARILY

Do NOT mention in the task description:

```text
Binary
ASCII
Hexadecimal
Decimal
Base64
QR
Metadata Inspector
Universal Converter
```

when the participant is supposed to recognize the representation or tool independently.

Instead use natural descriptions.

Examples:

### Instead of Binary

> encoded value

or:

> value represented using 0s and 1s

ONLY use the second form when the actual input clearly benefits from that clue.

### Instead of Decimal

> 0–9 numerical format

### Instead of ASCII

> readable characters

### Instead of Metadata

> information stored with the file

### Instead of QR

> machine-readable information embedded in the image

Do not over-explain.

---

# 4. DO NOT WRITE TASKS LIKE TUTORIALS

Do NOT do:

> Step 1: Find the image.
>
> Step 2: Open Metadata Inspector.
>
> Step 3: Copy the value.
>
> Step 4: Convert the value.

The participant must discover the path.

The task should simply communicate:

> What is happening?

and:

> What must I ultimately recover?

---

# 5. THE SCENARIO SHOULD MAKE THE TASK FEEL LIKE PART OF A MISSION

Use the existing forest/adventure/investigation theme.

The participant is investigating a workstation recovered during the journey.

Make each task feel like a small piece of a larger investigation.

Do NOT make every task sound like a cybersecurity incident.

Vary the framing:

* recovered message
* damaged record
* unexplained image
* misplaced log
* conflicting documents
* fragmented evidence
* suspicious file
* trail of clues
* recovered transfer record
* final incident reconstruction

---

# 6. IMPORTANT UI CHANGE

The current top text:

```text
TIER 1 — ONE-STEP TECHNICAL RECONNAISSANCE
```

is too technical and feels like developer terminology.

Change player-facing tier text to something more natural.

Use:

### Tasks 1–5

```text
STAGE 1 — DISCOVERY
```

### Tasks 6–10

```text
STAGE 2 — INVESTIGATION
```

### Tasks 11–12

```text
STAGE 3 — RECONSTRUCTION
```

This should be small secondary text, not larger than the task title.

---

# 7. TASK DESCRIPTIONS

Replace the existing player-facing descriptions with the following.

---

# TASK 01 — ENCODED MESSAGE

## Scenario

> A short message recovered from an unknown source has been left on the workstation. The original meaning is unreadable in its current form.

## Objective

> Convert the recovered value into a human-readable form and enter the message below.

## Answer

```text
HIDE
```

Do NOT mention:

* Binary
* ASCII
* Universal Converter

---

# TASK 02 — FILE INFORMATION

## Scenario

> An image was recovered from the investigation, but its visible contents do not identify its creator. There may be useful information stored with the file.

## Objective

> Investigate the file and enter the recorded author's name below.

## Answer

```text
ARLO
```

Do NOT say:

> Use Metadata Inspector.

Do NOT use the word:

> metadata

in the player-facing task unless necessary.

---

# TASK 03 — IMAGE MESSAGE

## Scenario

> A strange marking has been found inside one of the recovered images. It does not reveal its meaning when viewed normally.

## Objective

> Determine what information the image contains and enter the revealed value below.

## Answer

```text
SECTOR-7
```

Do NOT explicitly mention:

```text
QR
QR code
QR Scanner
```

---

# TASK 04 — THE EARLIEST RECORD

## Scenario

> Several events were recorded by the workstation, but the records are not arranged in the order they occurred.

## Objective

> Determine which event happened first and enter its associated value below.

## Answer

```text
YELLOW
```

This task should feel like a small reasoning problem, not a technical command-line problem.

---

# TASK 05 — THE CHANGED RECORD

## Scenario

> Two versions of the same record were recovered. Most of their contents are identical, but one important value has changed.

## Objective

> Determine what changed between the two records and enter the changed value below.

## Answer

```text
9941
```

Do NOT mention the File Comparison application.

---

# 8. TASK 06 — THE FRAGMENTED PASSWORD

This is the first major difficulty jump.

## Scenario

> Three fragments of a message were recovered separately. Their order is unclear, and the fragments appear incomplete on their own.

## Objective

> Reconstruct the message in the correct order, interpret the recovered value, and enter the final result below.

## Answer

```text
JUMP
```

The participant must discover:

```text
fragment 01
fragment 02
fragment 03
```

and use their associated information to determine the correct order.

Do NOT mention:

* timestamps
* hexadecimal
* ASCII
* converter

---

# 9. TASK 07 — THE HIDDEN RECORD

IMPORTANT:

Do NOT reuse the same image from Task 02.

Use a different evidence file.

## Scenario

> A photograph from the investigation appears ordinary, but the information surrounding the file may tell a different story. Something useful has been preserved with the evidence.

## Objective

> Recover the hidden value associated with the file, interpret it, and enter the resulting readable message below.

## Answer

```text
HELP
```

The intended internal chain can be:

```text
image
↓
stored file information
↓
encoded value
↓
conversion
↓
readable result
```

But NONE of this should be shown to the player.

---

# 10. TASK 08 — THE DISGUISED FILE

## Scenario

> Several recovered files appear ordinary at first glance, but one of them does not match what it claims to be. Somewhere inside the collection is the evidence you need.

## Objective

> Identify the suspicious file, recover the information it contains, and enter the resulting word below.

## Answer

```text
RECOVERY
```

Do NOT tell the participant:

* which file is suspicious
* why it is suspicious
* which property to inspect
* what conversion to use

They must determine this.

---

# 11. TASK 09 — THE EVIDENCE TRAIL

## Scenario

> A clue recovered from one piece of evidence points to another location on the workstation. That trail appears to continue through several records.

## Objective

> Follow the evidence trail and determine the final value associated with the requested activity.

## Answer

```text
17
```

Do NOT mention:

* QR
* search
* index.txt
* activity.log
* CLUE-42

Those are implementation details, not task instructions.

---

# 12. TASK 10 — THE ALTERED RECORD

## Scenario

> Two versions of a recovered record contain a small but meaningful difference. The changed information does not directly reveal its meaning.

## Objective

> Identify the changed value, interpret it, and enter the resulting message below.

## Answer

```text
JUMP
```

This must feel more advanced than Task 05.

Task 05 asks:

> What changed?

Task 10 asks:

> What changed, and what does that change mean?

That distinction must be preserved.

---

# 13. TASK 11 — FOLLOW THE TRAIL

Do NOT make this another copy of Task 07.

Use a different starting point.

## Scenario

> A note recovered from the workstation references an unidentified record. That record points to another piece of evidence, continuing a trail across the computer.

## Objective

> Follow the trail from one piece of evidence to the next and recover the final value requested below.

## Answer

```text
SHIFT
```

The participant should need to move between several applications/files.

Do NOT expose the path.

---

# 14. TASK 12 — FINAL BOSS — TRACE THE INCIDENT

This should be the strongest player-facing description in the round.

## Scenario

> Four pieces of evidence were recovered from different parts of the workstation. At first they appear unrelated, but together they form a single chain of events.

## Objective

> Reconstruct the evidence trail, follow its connections, and recover the final clearance code.

## Answer

```text
SYMPO
```

Do NOT mention:

* system.log
* device ID
* VX-27
* transfer ID
* metadata
* hexadecimal
* ASCII
* converter
* exact files
* exact sequence

The player should discover all of these.

---

# 15. IMPORTANT — QUESTIONS SHOULD SOUND LIKE CHALLENGES

Avoid repetitive wording such as:

> Find the value.

> Find the answer.

> Convert the value.

Instead vary language naturally:

### Examples

> Recover the readable message.

> Identify the recorded author.

> Determine what the image reveals.

> Identify the earliest event.

> Determine what changed.

> Reconstruct the fragments.

> Recover the hidden value.

> Identify the suspicious file.

> Follow the evidence trail.

> Interpret the changed information.

> Recover the final value.

> Reconstruct the incident.

Do not force every task to use the same sentence pattern.

---

# 16. TASK TITLE STYLE

Task titles should be short and memorable.

Use:

```text id="v2mh9p"
TASK 01 — ENCODED MESSAGE
TASK 02 — FILE INFORMATION
TASK 03 — IMAGE MESSAGE
TASK 04 — THE EARLIEST RECORD
TASK 05 — THE CHANGED RECORD

TASK 06 — THE FRAGMENTED PASSWORD
TASK 07 — THE HIDDEN RECORD
TASK 08 — THE DISGUISED FILE
TASK 09 — THE EVIDENCE TRAIL
TASK 10 — THE ALTERED RECORD

TASK 11 — FOLLOW THE TRAIL
TASK 12 — TRACE THE INCIDENT
```

Do NOT use overly dramatic titles for every task.

Reserve the stronger titles for Tasks 6+.

---

# 17. TASK PANEL LAYOUT

The task panel should look like:

```text id="rb2asw"
STAGE 2 — INVESTIGATION

TASK 07 / 12

THE HIDDEN RECORD

A photograph from the investigation appears ordinary,
but the information surrounding the file may tell a
different story. Something useful has been preserved
with the evidence.

OBJECTIVE

Recover the hidden value associated with the file,
interpret it, and enter the resulting readable message
below.

────────────────────────────────────

FINAL ANSWER

[____________________________]

[ SUBMIT ANSWER ]

[ ? HINT ]

────────────────────────────────────
```

Keep the hierarchy clear.

The task title should be prominent.

The scenario should be visually secondary.

The objective should be clearly separated.

The answer box should be obvious.

The Hint button should always be visible.

---

# 18. DO NOT ADD A "RECOMMENDED TOOL" SECTION

Do NOT display:

```text
Recommended App
Suggested Tool
Try This
Useful Application
```

The participant must discover the application.

---

# 19. DO NOT ADD THE SOLUTION TYPE TO THE QUESTION

Do not display:

```text
Input type: Binary
Encoding: Hexadecimal
Output: ASCII
Method: Metadata
Scanner: QR
```

The participant must infer the method from the evidence and available tools.

---

# 20. HINTS MUST MATCH THE NEW DESCRIPTION STYLE

Hints should feel like subtle nudges.

### Task 01

Hint 1:

> Look closely at the way the recovered value is represented.

Hint 2:

> One of the workstation's tools can transform encoded values into another form.

---

### Task 02

Hint 1:

> The information you need may not be visible when the image is opened normally.

Hint 2:

> Think about information that can be stored alongside a file.

---

### Task 06

Hint 1:

> The fragments contain more information than their text alone suggests.

Hint 2:

> Before interpreting the message, determine the order in which the pieces belong.

---

### Task 07

Hint 1:

> The useful information is stored somewhere other than the visible picture.

Hint 2:

> Look for a tool that can reveal additional information associated with a file.

---

### Task 08

Hint 1:

> Do not trust a file only because of what it is called.

Hint 2:

> Compare what the file claims to be with what the file actually contains.

---

### Task 09

Hint 1:

> The first clue is only a pointer to something else.

Hint 2:

> Use the value you recover to locate the next piece of evidence.

---

### Task 12

Hint 1:

> The four pieces of evidence are connected.

Hint 2:

> A value discovered in one file can help you identify another file.

---

# 21. IMPORTANT TASK PANEL BEHAVIOR

The task panel should NOT automatically:

* open the relevant application
* select a file
* populate an application
* populate the converter
* select a conversion type
* copy an intermediate value
* fill the answer field

The participant must do all of this.

---

# 22. EXAMPLE OF CORRECT TASK 01 EXPERIENCE

Task panel says only:

> **A short message recovered from an unknown source has been left on the workstation. The original meaning is unreadable in its current form.**
>
> **Convert the recovered value into a human-readable form and enter the message below.**

Participant then:

```text id="z4m1p7"
explores virtual OS
↓
finds message.txt
↓
opens file
↓
recognizes representation
↓
opens Universal Converter
↓
chooses appropriate conversion
↓
gets result
↓
types answer
↓
SUBMITS
```

The task panel never told them:

> Binary → ASCII

That is intentional.

---

# 23. EXAMPLE OF CORRECT TASK 07 EXPERIENCE

Task panel says:

> **A photograph from the investigation appears ordinary, but the information surrounding the file may tell a different story. Something useful has been preserved with the evidence.**
>
> **Recover the hidden value associated with the file, interpret it, and enter the resulting readable message below.**

Participant must discover:

```text id="2ke4u1"
find image
↓
inspect file information
↓
recover value
↓
recognize representation
↓
open converter
↓
perform transformation
↓
perform next transformation if required
↓
obtain HELP
↓
enter HELP
↓
submit
```

No part of that sequence appears in the task panel.

---

# 24. IMPORTANT DISTINCTION

The question should be:

### "What do I need to accomplish?"

NOT:

### "How do I accomplish it?"

This distinction is the core design requirement.

---

# 25. FINAL QA FOR EVERY TASK DESCRIPTION

Before implementing each task, verify:

### Does it provide context?

Yes.

### Does it clearly explain what the participant needs to obtain?

Yes.

### Does it avoid naming the application?

Yes.

### Does it avoid unnecessarily naming the encoding?

Yes.

### Does it avoid revealing the solution chain?

Yes.

### Is it short enough to read during a timed competition?

Yes.

### Does it sound like a mission/challenge rather than a programming assignment?

Yes.

---

# 26. DO NOT MODIFY THE TASK LOGIC JUST TO SUPPORT THE COPY

The purpose of this change is to improve the PLAYER-FACING TASK CONTENT.

Keep the previously specified mechanics:

```text
Tasks 1–5:
one-step

Tasks 6–10:
3+ meaningful steps

Tasks 11–12:
advanced investigation
```

Keep:

```text
virtual filesystem
virtual file selection
applications
manual data transfer between apps
manual final answer
hint system
answer validation
progression
```

The new descriptions must sit on top of that system.

---

# 27. FINAL RESULT

The task panel should feel like a mission briefing:

```text id="0bvzaw"
What happened?
       ↓
What do I need to recover?
       ↓
I need to figure out how.
```

NOT:

```text id="3k7g46"
Here is the file.
Here is the app.
Here is the conversion.
Here is the answer.
```

Implement the revised player-facing descriptions exactly in this style.
