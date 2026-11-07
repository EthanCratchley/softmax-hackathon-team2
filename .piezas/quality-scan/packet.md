# Piezas quality scan packet

Scan code: qs-68b07c392679125172
Round: 3 of 3
Project folder: /Users/ethancratchley/Documents/GitHub/softmax-hackathon-team2

## The app description (what the owner approved)

# Product Spec: Kestrel Kids Safety

Sources: "Pending Chaos at Kestrel Kids" case (Case), Team 2 shared product spec and build split (Team), Hackathon Launch deck (Launch). Each requirement is tagged [Stated] when a source says it and [Assumed] when we decided it. Provenance follows each claim.

## Overview

Parents of children in Kestrel Kids (a ski school for ages 5 to 12) give each child's emergency, medical and pickup details once, from a phone. Instructors, desk staff and ski patrol then see only the part they need, at the moment they need it. Hana Sato, the snow school director, can see whose details are missing, and every pickup and sensitive access leaves a record.

Goal: credible answers to the insurer's three questions by the first lesson on December 12: how a missing child is located and their information shared with responders, how staff on the hill know a child's medical conditions, and how each child goes home with the right adult. (Case section 1)

Demo success: one fictional child's information is entered by a parent, appears in the assigned instructor's limited view, is used to verify pickup, and reaches patrol in a missing-child incident, without exposing every child's medical information to every staff member. (Team section 1)

## Non-Goals

- Registration and payment, which stay in the resort's online store. No payment details are stored here. (Case; Corinne Walsh's rule)
- Instructor scheduling and pay. (Case)
- Progress reports and level assessments. (Case)
- Contacting police, rescuers or families automatically. People make those calls and the app records them. (Team MVP-4)
- Replacing ski patrol procedures or radios. (Team anti-patterns)
- Claiming legal compliance. The demo follows the case's summary of BC PIPA and is not a legal opinion. (Team section 11)
- Child photos of any kind. (Team section 5)
- A separate database, a second sign-in system, or outside email or text providers. (Team section 4)
- Stretch goals, until the four demo stories work on the live app: store export import, messaging a whole group, and working without signal. (Case; Team section 10)

## Users and Roles

| Role | Sees | Changes | Never |
|---|---|---|---|
| Parent or guardian | Their own linked children | Their own child's details and pickup list | Another family's child |
| Instructor (many are 17 to 24) | Today's assigned groups and need-to-know alerts | Missing-child reports | Unassigned children's alerts, full medical records, pickup lists |
| Desk staff and parent volunteers | Today's children, active pickup adults, check-in and pickup state, medication held at the desk | Check-in, release, denied attempts, missing-child reports | Medical records, changes to the pickup list |
| Ski patrol | The emergency packet for a child in an incident | Incident status and actions | Parent details, children with no incident |
| Admin (Hana) | Missing-details overview, groups, operational activity, and one child's full details when she gives a logged reason | Group assignments, added corrections | Skipping the audit trail, overwriting pickup records |

Every role check happens on the server against the signed-in person. There is no role switcher in the live app. Separate fictional demo accounts represent each role. (Team section 3)

## Core Journeys

1. Allergy: a parent adds Ava's tree-nut allergy and EpiPen location, then her assigned instructor sees an alert on the roster. An unrelated instructor cannot see it. (Team Story A; Case Exhibit 3)
2. Pickup: Lily's uncle is not on her list, so the desk refuses and logs the attempt. Her parent adds him from their phone, the desk refreshes and checks his ID, and the release is recorded once. (Team Story B; Case Exhibit 5B)
3. Missing child: Owen's instructor reports him missing, or radios it in. Patrol opens one screen with everything a search needs, logs actions, and watches the escalation time. (Team Story C; Case Exhibit 5A)
4. Missing details: Hana sees which children's required details are missing and which fields, without seeing the medical values. (Team Story D; Case must-have 1)

## Requirements

### Parent

- R-001: [Stated] A signed-in parent sees only their linked children, and changing the address to another child's ID shows "not found". (Team MVP-1, section 9)
- R-002: [Stated] From a phone, a parent can enter and update two emergency contacts, allergies, medical conditions, medications and where they are kept, and the adults allowed to pick up. (Case must-have 1; Team MVP-1)
- R-003: [Stated] A phone number with too few or too many digits is rejected with a clear message before saving. (Case Exhibit 5A, the 9-digit number; Team section 9)
- R-004: [Stated] Allergies, conditions and medications each need an answer or an explicit "none". A blank does not count as "none". (Team build split, Anthony item 3)
- R-005: [Assumed] A child shows "Complete" only with two emergency contacts with valid phones, all medical categories answered, one active pickup adult, a signed consent and a mailing address. Otherwise the child shows "Needs information" and the parent sees what is missing. (Team section 5, extended by R-006 and R-007)
- R-006: [Assumed] A parent gives consent on the phone by ticking the consent statement and typing their name, which replaces the printed PDF. The app records who consented and when, along with a separate yes or no for photos. (Case section 3, consent form; 41 children had no form on the first day)
- R-007: [Assumed] A parent gives a mailing address, shown only to Hana, so the notice the law requires after an emergency disclosure can be sent. The store export does not collect one. (Case section 6)
- R-008: [Stated] A saved parent change reaches the right staff views with no retyping, and shows who changed it and when. (Case: 23 of 96 emailed updates never reached the binder; Team MVP-1)
- R-009: [Stated] A parent can optionally add today's jacket and helmet colours, and patrol sees them with the instructor's description. (Team feature list; Case: the instructor remembered the wrong jacket)

### Instructor

- R-010: [Stated] A signed-in instructor sees only the groups assigned to them for the selected lesson day, with each child's name, age and level. (Team MVP-2; Case must-have 2)
- R-011: [Stated] Each child with a safety need has a conspicuous roster alert giving only the allergy or condition, medication location and what to do. (Team MVP-2; Case Exhibit 4D)
- R-012: [Stated] An instructor cannot open an unassigned child's alerts, even by changing the address, and cannot edit medical or pickup details. (Team sections 3 and 9)
- R-013: [Assumed] The instructor screens work on a phone in gloves: at a 375-pixel-wide screen nothing scrolls sideways, tap targets are at least 48 pixels, and the missing-child report is one tap from the roster. (Case section 7; Launch: "an instructor on a chairlift, in gloves")

### Desk

- R-014: [Stated] Desk staff see today's expected, checked-in and released children and can search by group or by any of the child's names, so "Parr" and "Okafor-Parr" both find Owen. (Team MVP-3; Case Exhibit 4: the binder was filed under O)
- R-015: [Stated] Check-in records the time, the staff member and the bib number, and flags a child marked "Needs information" without showing medical details. (Team section 5; Case section 3)
- R-016: [Stated] The pickup screen shows only the child's active authorized adults and pickup state, with no medical information. (Team MVP-3)
- R-017: [Stated] To release a child, staff choose an authorized adult and confirm they checked ID. The app records the child, lesson date, adult ID and name at that moment, staff member, ID confirmation and time. (Case must-have 3; Team MVP-3)
- R-018: [Stated] An unlisted adult cannot be typed in. The screen says release is blocked and to contact an authorized parent or Hana, and logs the denied attempt with no release record. (Team MVP-3, section 9; Case: the uncle)
- R-019: [Stated] Once a parent adds an adult from their phone, the desk sees that adult on refresh and can release to them, with no inbox involved. (Team Story B; Case Exhibit 5B)
- R-020: [Stated] A released child shows who took them and when, and a second release is blocked. (Team MVP-3)
- R-021: [Assumed] When a parent says medication is kept at the desk, desk staff see only "holds [medication] for this child", so they can find it. No other medical detail appears. (Case Exhibit 4D: "EpiPen at Kestrel Kids Ski School Desk")
- R-022: [Stated] Desk staff cannot read medical records or change authorized adults, even by calling the server directly. (Team section 9)
- R-023: [Assumed] While a child has an open incident, the desk sees "Call patrol" with no details and release is blocked. After the child is located, the desk sees that an incident happened today and to refer family questions to Hana. (Case Exhibit 5A: the desk knew nothing when Owen's mother called back; his father collected him unaware)

### Patrol and incidents

- R-024: [Stated] An assigned instructor or desk staff can report a child missing with last-seen time, last-seen place, clothing, helmet and equipment, and notes. (Team MVP-4; desk reporting covers a dead phone, Case section 2)
- R-025: [Assumed] Patrol can open an incident themselves by finding a child by name, because the report often arrives by radio. The search shows only name, age and group until the incident exists, and opening one is logged. (Case: patrollers work from radios and a hut tablet)
- R-026: [Stated] One screen shows the child's names, age, group, instructor, level, last-seen details, reported and parent-given clothing, safety alerts, both emergency contacts, lift pass number and bib number, and the incident timeline. (Case must-have 4; Rob Fournier: "one screen"; Exhibit 5A: pass number unknown)
- R-027: [Stated] Only a signed-in patrol account can open the packet, only for a child with an incident, and each opening records who, when and which incident. (Team MVP-4)
- R-028: [Stated] Patrol can set an incident to Open, Located or Closed, and add timed actions including "family contacted" and "shared with police or rescuers". (Team MVP-4; Case Exhibit 5A)
- R-029: [Stated] The packet shows the escalation time as the earlier of 60 minutes after last seen or 4:00 p.m., and the app never contacts police or family itself. (Case section 6; Team MVP-4)
- R-030: [Assumed] Recording "shared with police or rescuers" creates a task for Hana to mail the required notice to the family's address. (Case section 6)

### Admin

- R-031: [Stated] Hana sees every child with missing required details and which fields are missing. (Case must-have 1; Team MVP-1)
- R-032: [Stated] Hana can assign children and instructors to groups, and a group cannot exceed six children. (Team section 3; Case section 2)
- R-033: [Stated] Hana sees today's expected, checked-in and released counts, open incidents and denied pickup attempts. (Team section 7)
- R-034: [Stated] Pickup records and audit events cannot be edited or deleted by anyone in the app. A correction is added as a new entry naming who made it and why. (Team section 3)
- R-038: [Stated] Hana's overview never shows medical values. She can open one child's full details only by giving a reason, and each opening is logged with who, when, which child and why. (Team decision on Hana's access, resolving the feature list against the shared spec)

### Across the app

- R-035: [Stated] Viewing a packet, changing medical details or pickup adults, releasing a child, denying a pickup and changing an incident each leave an audit entry with who, what and when. Medical values are not copied into the entry. (Team data model; Case: audit log)
- R-036: [Stated] A role, parent, child or instructor ID sent by the browser is never trusted. Access comes from the signed-in person's server-checked role and assignments. (Team section 3)
- R-037: [Stated] The live demo uses only fictional children, adults, numbers and documents, and has no photos. (Case data rules)

### Team extras

- R-039: [Stated] A parent can create a private pickup link for one named adult for one lesson date, which adds that adult to the child's pickup list for that date only, and can share it themselves. (Team feature list)
- R-040: [Assumed] The link page opens without an account and shows only the child's first name, the pickup place and time, the adult's name and "bring photo ID". It shows no medical details, contacts or surname. (Team feature list; Case section 6)
- R-041: [Assumed] A link never releases a child by itself. Desk staff still choose the named adult and confirm that their ID matches, and the pickup record notes that the adult came from a link. (Case must-have 3; Team: "name alone does not establish identity")
- R-042: [Assumed] A link stops working at the end of its lesson date or as soon as the parent cancels it, and then that adult can no longer be chosen at the desk. Creating, opening and cancelling a link are logged. (Case section 6)
- R-043: [Stated] Each linked parent gets one email when their child is checked in and one when released, giving the child's first name, the time and, at release, the adult's name. Neither includes medical details. (Team feature list)
- R-044: [Assumed] A failed email never holds up check-in or release. Hana can see which alerts failed. (Case: 220 children checked in within 45 minutes)
- R-045: [Assumed] The app never emails a parent that their child is missing. A person makes that contact under the patrol procedure. (Case section 6; Team MVP-4)
- R-046: [Stated] During lesson time, an instructor's roster prompts for a headcount every 30 minutes, skipping lunch. They can confirm "all here" with one tap or report who is missing. (Team feature list; Case Exhibit 2 for lesson times; the interval is assumed)
- R-047: [Assumed] Desk staff and Hana see a group flagged when its headcount is more than 10 minutes overdue. The flag shows no details about any child. (Team feature list)
- R-048: [Stated] Desk staff and Hana see "Instructor not responding: try the radio" when an instructor's roster has had no contact for 20 minutes during lesson time. The wording does not claim the battery is dead, because the app cannot tell a dead phone from a locked one or no signal. (Team feature list: dead battery alert; Case section 2; the 20 minutes is assumed)

## Data

- Pickup link: child, parent, authorized adult, lesson date, hidden link code, cancelled at, last opened at
- Alert message: child, parent, type (check-in, release), sent or failed, time
- Headcount: group, lesson date, instructor, due at, confirmed at, count
- Instructor contact: instructor, lesson date, last contact at
- Staff profile: sign-in user ID, role (instructor, desk, patrol, admin), display name
- Child: names and other names, birth date, ski level, lesson day, group, parent user IDs, lift pass number, store order number, mailing address, profile status
- Medical profile: child, allergies, conditions, medications, medication location, what to do, last changed by and when
- Emergency contact: child, name, relationship, phone, priority
- Authorized adult: child, name, relationship, phone, active, valid-only date, from a link, last changed by
- Consent: child, parent, typed name, photo consent, consented at
- Lesson group: day, level, instructor, group number
- Attendance: child, lesson date, status (expected, checked in, released), bib number, jacket and helmet today, checked in by, checked in at
- Pickup record: child, lesson date, authorized adult ID, adult name at the time, verifying staff, ID checked, released at
- Denied pickup: child, lesson date, stated adult name, reason, staff, time
- Incident: child, reported by, last seen at, last seen place, clothing, equipment, notes, status, escalation time, located at
- Incident action: incident, type, note, staff, time

All records use stable IDs, never names, as keys. (Team section 5)

## Main Screens

One app, built phone-first. (Team section 7)

- `/` sends each signed-in person to their role's home.
- `/parent` shows my children and their completion status.
- `/parent/children/[id]` edits contacts, medical details, pickup adults and consent.
- `/instructor` shows assigned groups and alerts.
- `/instructor/report-missing/[childId]` is the missing-child report.
- `/patrol` lists open incidents and finds a child.
- `/patrol/incidents/[id]` is the one-screen packet and timeline.
- `/desk` shows today's check-in and pickup list.
- `/desk/children/[id]` confirms an adult, releases a child or logs a denial.
- `/admin` shows missing details, groups, today's activity, failed alerts, overdue headcounts and instructors not responding.
- `/pickup/[code]` is the private pickup page, the only screen that opens without signing in.

## Piezas Service Mapping

- Users: email and password sign-in and sessions for every account. Roles and assignments live in app records that only the server reads.
- Entity Records: all the records under Data.
- Tasks: Hana's mail-the-notice task from R-030.
- Admin and access: audit events for R-035.
- Notifications: one-to-one emails for check-in and release alerts.
- Workflow: background jobs, so sending alerts never slows the desk.
- Hosting: one app at the Piezas address, with `PIEZAS_API_KEY` on the server only.
- Not used in the first version: Calendar, Documents, Forms.

The app owns the screens, session handling, and every per-person and per-role check, because Piezas does not enforce per-member access (contract Rule 1).

## Assumptions

- The app sits alongside the store and takes children and groups from demo seed data. (Case allows this)
- Lesson day is chosen on screen for the demo, so the stories work on any date.
- For the demo, parent accounts already exist and are linked to child IDs. For launch, Kestrel would create accounts from the store's export and email parents a link to set a password. Parents would still have a second password, which is the objection Hana raised about the camp software.
- Google sign-in could remove that second password, but it needs a Google client set up by the owner, so it is a launch item.
- Internet is required. Without signal or battery, staff use radios and the desk, and the app does not claim otherwise. (Team section 12)
- Parent email changes are unnecessary once parents can update details themselves.
- The case conflicts on who tells the family: patrol calling the family alongside police, and police handling all family communication. The app only records what people did, so either procedure works. Hana must confirm the rule before launch.

## Launch Needs (for the pitch)

Privacy and legal review, consent wording, a retention and deletion policy, security and penetration testing, staff training, patrol sign-off on the incident flow, a fallback for lost signal and dead phones, and a real import from the nightly store export. (Team section 11)

## Gaps and Questions for Piezas

- Append-only records: Piezas records can be updated with the server key, so R-034 is enforced by the app's server, not by the platform.
- Group messaging: Piezas sends one message to one person and does not offer bulk email, so the stretch goal would have to send individual messages or be dropped.
- Magic links: not available, which affects how light parent sign-in can be at launch.
- Medical field encryption: not confirmed in the Piezas rules. Ask Softmax before making any claim in the pitch.
- Hosting size: the free plan allows 50 MB per app, so confirm the build fits with an early deploy.
- Phone notifications: the Piezas capability list has none, so headcount prompts appear only while the roster is open. A real launch would need a way to alert instructors when the app is closed, and text messages are not available either.
- Battery level: the app cannot read it reliably from a phone browser, so R-048 reports lost contact instead. A locked phone can trigger it falsely, so the radio stays the backup.

## Acceptance Scenarios

### S-001: A parent cannot open another family's child

covers: R-001, R-036
Given Ava's parent is signed in and Lily belongs to another family
When Ava's parent opens the address of Lily's profile, or sends Lily's ID to the server
Then they see "not found" and none of Lily's details

### S-002: A parent completes a profile from a phone

covers: R-002, R-004, R-005, R-006, R-007
Given Ava's profile shows "Needs information" on a phone-sized screen
When her parent enters two contacts, the tree-nut allergy, "none" for conditions, the EpiPen and its location, one pickup adult, an address and their consent, then reloads
Then the saved values remain and the status reads "Complete"

### S-003: Blank medical answers stay incomplete

covers: R-004, R-005
Given a child with every detail filled in except conditions, which is blank
When the parent saves the profile
Then the status reads "Needs information" and names conditions as missing

### S-004: A bad phone number is rejected

covers: R-003
Given a parent editing an emergency contact
When they enter the 9-digit number 604555-187 and save
Then the app refuses it with a clear message and the old value stays

### S-005: A new allergy reaches the assigned instructor

covers: R-008, R-010, R-011
Given Ava is in a group assigned to an instructor
When her parent saves the tree-nut allergy and EpiPen location and the instructor refreshes the roster
Then Ava has a prominent alert with the allergy, EpiPen location and what to do, and the profile shows who changed it and when

### S-006: An unrelated instructor is denied

covers: R-012, R-036
Given an instructor who is not assigned Ava's group
When they request Ava's alerts or try to change her medical details by address or direct server call
Then they are refused and no details are returned

### S-007: The instructor screens work in gloves

covers: R-013
Given an instructor on a 375-pixel-wide phone screen
When they open their roster
Then nothing scrolls sideways, tap targets are at least 48 pixels, and each child's missing-report button is one tap away

### S-008: Parent-given clothing reaches patrol

covers: R-009, R-026
Given Owen's parent added "red jacket, blue helmet" for today and his instructor reported "blue jacket, white helmet"
When patrol opens Owen's packet
Then both descriptions appear, each labelled with who gave it

### S-009: Desk finds a child by any name and checks them in

covers: R-014, R-015
Given Owen is expected today, listed as Owen Parr and also known as Owen Okafor-Parr, and his profile needs information
When desk staff search "Okafor" and check him in with bib 14
Then the time, staff member and bib are saved, he shows as checked in, and a "Needs information" flag appears with no medical details

### S-010: Desk sees the pickup list and no medical details

covers: R-016, R-022
Given Ava is checked in and has a recorded allergy
When desk staff open her pickup screen and also request her medical record directly from the server
Then they see only her active adults and state, and the medical request is refused

### S-011: Desk cannot change the pickup list

covers: R-022, R-036
Given desk staff are signed in
When they try to add an authorized adult to Lily's list by a direct server call
Then the request is refused and the list stays the same

### S-012: An unlisted adult is blocked

covers: R-018, R-035
Given Mark Whitfield is not on Lily's list
When he asks to collect her and desk staff record the denial
Then the screen says release is blocked and whom to contact, the denial is logged, and no pickup record exists

### S-013: A parent authorizes an adult and the release is recorded once

covers: R-017, R-019, R-020, R-034, R-035
Given Lily's parent adds Mark Whitfield from their phone after the denial
When desk staff refresh, choose him, confirm the ID check and release her, then try to release her again
Then exactly one pickup record exists with the required details, the second attempt is blocked and shows who took her, and the record offers no edit or delete

### S-014: Medication held at the desk shows without the rest

covers: R-021
Given a child's medication location is the desk and they also have a recorded condition
When desk staff open that child
Then they see "holds [medication] for this child" and not the condition

### S-015: An instructor reports a child missing

covers: R-024
Given Owen is in the signed-in instructor's group
When the instructor reports him missing at 2:40 p.m., last seen at 2:30 p.m. at the top of the Pigeon chair, with clothing and notes
Then an open incident appears on the patrol list with those details

### S-016: Desk reports for an instructor with a dead phone

covers: R-024, R-023
Given an instructor radios the desk that Owen is missing
When desk staff file the report and then open Owen's pickup screen
Then an open incident exists, the screen says "Call patrol" with no details, and release is blocked

### S-017: After a child is found the desk knows what to say

covers: R-023
Given Owen's incident has been marked Located
When desk staff open Owen's screen
Then release is available and a note says an incident happened today and to refer family questions to Hana

### S-018: Patrol opens an incident from a radio call

covers: R-025, R-035
Given patrol hears by radio that a child is missing and no incident exists
When a patroller searches the child's name and opens an incident
Then the search showed only name, age and group, the incident now exists, and the action is logged

### S-019: Patrol gets everything on one screen

covers: R-026, R-027, R-035
Given Owen has an open incident
When a patroller opens the packet on a tablet
Then the required details all appear on one screen and the audit trail shows who opened it, when and for which incident

### S-020: Others cannot open the packet

covers: R-027, R-036
Given Owen has an open incident
When an instructor, desk staff or a parent requests the packet, or patrol requests one for a child with no incident
Then the request is refused and no details are returned

### S-021: Patrol logs actions and closes an incident

covers: R-028, R-035
Given Owen has an open incident
When a patroller adds "family contacted", marks him Located and later Closed
Then the timeline shows each step with the patroller and time, and each is in the audit trail

### S-022: The escalation time uses the earlier limit

covers: R-029
Given one child last seen at 2:30 p.m. and another last seen at 3:30 p.m.
When patrol opens each packet
Then the first shows 3:30 p.m., the second shows 4:00 p.m., and no message is sent to police or family

### S-023: Sharing with police creates Hana's notice task

covers: R-030
Given a patroller records "shared with police or rescuers" on an incident
When Hana opens her task list
Then a task to mail the notice names the child and shows the family's mailing address

### S-024: Hana sees what is missing

covers: R-031
Given one child with a complete profile and one missing a second contact and consent
When Hana opens the admin overview
Then only the second child is listed, with those two fields named

### S-025: Group limits hold

covers: R-032
Given a group already has six children
When Hana tries to add a seventh
Then the app refuses and the group stays at six

### S-026: Hana sees today's activity

covers: R-033
Given a lesson day with check-ins, a release, a denied pickup and an open incident
When Hana opens the admin overview
Then the counts and lists match those events

### S-027: Corrections add instead of overwrite

covers: R-034
Given a recorded pickup with a wrong detail
When Hana adds a correction with a reason
Then the original stays unchanged and the correction appears beside it, naming Hana

### S-028: The demo uses only fictional data

covers: R-037
Given the live app's demo data
When a reviewer browses each role's screens
Then every person, number and address comes from the case's fake data or was invented, and no photos appear

### S-029: Hana opens medical details only with a logged reason

covers: R-038, R-035
Given Hana is on the admin overview and Ava has a recorded allergy
When Hana views the overview, then tries to open Ava's full details with no reason, then opens them with a reason
Then the overview shows no medical values, the attempt with no reason is refused, and the opening with a reason shows the details and logs who, when, which child and why

### S-030: A parent creates a private pickup link

covers: R-039, R-042
Given Lily's parent is signed in
When they create a link for Grace Okafor for this Saturday
Then Grace appears at the desk for that date only, a link is ready to share, and its creation is logged

### S-031: The link page shows the minimum

covers: R-040, R-042
Given a valid pickup link for Lily, who has a recorded medical condition
When someone opens the link without signing in
Then they see only her first name, the pickup place and time, the adult's name and "bring photo ID", and the opening is logged

### S-032: A link alone does not release a child

covers: R-041
Given Grace Okafor holds a valid link for Lily
When desk staff choose Grace and confirm her ID matches
Then one pickup record exists noting the link, and there is no way to release Lily from the link page

### S-033: Cancelled and expired links stop working

covers: R-042
Given one link the parent has cancelled and another from a past lesson date
When someone opens either link and desk staff look for those adults on the pickup list
Then the page says the link is no longer valid, shows no child details, and those adults cannot be chosen

### S-034: Parents get check-in and release emails

covers: R-043
needs: a real email inbox for a test parent
Given a child has two linked parents
When desk staff check the child in and later release them
Then each parent gets one email for each event, with the first name, time and, at release, the adult's name, and no medical details

### S-035: A failed email does not stop the desk

covers: R-044
Given a parent's email address cannot receive mail
When desk staff check in and release that child
Then both actions finish as normal and Hana sees the failed alerts listed

### S-036: Missing reports do not email parents

covers: R-045
Given a child has linked parents
When the child is reported missing
Then no email goes to the parents, and patrol's packet shows the contacts for a person to call

### S-037: An instructor confirms a headcount

covers: R-046
Given an instructor's group of five with a headcount due at 10:00 a.m. in lesson time
When the instructor opens the roster and taps "all here"
Then the headcount is saved with the count and time, and the next prompt is at 10:30 a.m.

### S-038: A short headcount leads to a report

covers: R-046, R-024
Given a headcount is due for an instructor's group
When the instructor says someone is missing and picks Owen
Then the missing-child report opens for Owen

### S-039: No headcount prompts during lunch

covers: R-046
Given the lunch hour from 11:45 a.m. to 12:45 p.m.
When an instructor opens the roster
Then no headcount prompt appears, and none shows as overdue

### S-040: An overdue headcount is flagged

covers: R-047
Given a group's 10:00 a.m. headcount has not been confirmed by 10:11 a.m.
When desk staff or Hana view today's list
Then the group is flagged as overdue with no child's details, and the flag clears when the headcount is confirmed

### S-041: Lost contact prompts a radio call

covers: R-048
Given an instructor's roster last made contact 21 minutes ago in lesson time
When desk staff or Hana view today's list
Then they see "Instructor not responding: try the radio", with no claim about the battery, and it clears when the roster makes contact again

## Open Conflicts

none

## Piezas rules

- Hard No: no secret key (PIEZAS_API_KEY or any provider secret) in browser code or behind NEXT_PUBLIC_/VITE_/PUBLIC_; no local database for business records (no SQLite, Prisma, Postgres client, JSON files as a database); no homemade copy of the Piezas SDK.
- Data isolation: every list, record read and change is limited to what the signed-in person may see. One user, customer, tenant or role must never see or change another's data.
- Sign-in: every page and server route with business data needs a signed-in person (and the right role); nothing private is reachable signed out.
- Provider tokens never live in the app: it stores connection and grant ids only.

### Core Rules

- **You advise; the owner decides.** Explain risks simply, recommend;
  never refuse the owner's choice or leave them at a dead end. Only the
  owner's own reply ("deploy anyway", "allow outside changes"; for the
  quality scan, "accept N", "go live without the scan" or "quality scan
  off") overrides a Piezas pause, never yours.
- **Plain words for the owner.** Brief and actionable: what happened, then
  the choice with the exact reply. No jargon, no long lists. (`testing`)
- **The AI fixes first; the owner is asked once**, for what only they can
  answer: one pause, remembered per item. (`testing`)
- **Ownership boundary.** The app owns UI, routes, session glue and workflow.
  Piezas owns records, pipelines, tasks, calendars, notifications, documents,
  integrations and end-user accounts. (`entities`)
- **Secrets stay server-side.** `PIEZAS_API_KEY` never behind
  `NEXT_PUBLIC_`/`VITE_`/`PUBLIC_`; `.env` in `.gitignore`; other settings
  in `deploy.requiredEnv`/`optionalEnv`. (`deploy`)
- **No provider tokens in the app.** Store connection and grant IDs only.
  Integrations never sign people in: Google/Microsoft sign-in is
  `@piezas/sdk/sso`. (`users`)
- **Credentials live in the users service**, never in records. (`users`)
- **Per-member isolation is YOUR job.** Derive `owner_id` from the verified
  session; filter every read by it. (`users`)
- **Spec first, mock first.** `SPEC.md` with an `S-xxx` scenario per
  requirement; then UI plus seed data, before any backend wiring. (`testing`)
- **Tested before shared.** Every `S-xxx` is a Playwright test
  (`tests/scenarios/S-xxx-<name>.spec.ts`, by `data-testid`). Run `piezas
  test`, fix, re-run (3 rounds) without asking; never weaken a check without
  the owner's OK. (`testing`)
- **Fetch the slice before using a service** (and before deploying):
  `piezas_contract` with its `topic`.
- **Rule 11 — If Piezas doesn't offer it, say so.** Check
  `piezas_capabilities` (.piezas/rules/capabilities.json) before promising.
  If it's missing, say so with the workable options, recommend one, then
  follow the owner's choice. Don't change Piezas's code (backend, SDK, CLI,
  MCP) or invent endpoints unless the owner explicitly asks, knowing the risk.
- **Change only the app's folder.** Use the published `@piezas/sdk`; no
  homemade copy, and no Piezas address outside this contract. Once they know
  the risk, only the owner may type "allow outside changes".

### Hard No List

Never do these on your own. If the owner asks, explain the risk and recommend
the Piezas way; a deploy that breaks one pauses until the owner fixes it or
says "deploy anyway".

- No local database tables for Piezas-backed business objects.
- No OAuth token storage, token refresh jobs, or integration OAuth callbacks in the app.
- No scraping or undocumented provider API calls when a Piezas connector exists.
- No exposing `PIEZAS_API_KEY` to browser code.
- No public MCP route without app auth, tenant checks, and server runtime.
- No hand-written OAuth/OIDC sign-in (use `@piezas/sdk/sso`).

## The last test run

No test run is recorded yet (`piezas test` has not run).

## Problems from the previous scan: check each one again

1. [high] After signing in, parents, instructors, desk staff, patrol and Hana land on a summary card whose "Open my workspace" button leads to a page that does not exist, so none of the four approved safety journeys can be carried out yet. (app/page.tsx)
2. [high] Private pickup links for a named adult, the check-in and release emails to parents, the 30-minute headcount prompts with overdue flags, and the "Instructor not responding" warning are all missing entirely, even though the owner approved them. (lib/services/contract.ts)
3. [high] When patrol records that a child's information was shared with police or rescuers, no task is created for Hana to mail the legally required notice to the family. (lib/services/mock.ts)
4. [medium] All 41 approved safety checks are still empty placeholders that fail on purpose, and no full test run has been recorded, so nothing the owner approved has been shown to work. (tests/scenarios/README.md)
5. [medium] Every demo account shares one password, so anyone given it to try the parent screens could also sign in as Hana or ski patrol and see children's medical and emergency details. (lib/session.ts)
6. [medium] The check that each role signs in and sees only its own information is quietly skipped whenever the demo password is not set, so a broken sign-in could pass unnoticed. (tests/frontend.spec.ts)
7. [medium] Everything parents and staff enter is held only in the running server's memory, so a restart or redeploy wipes allergies, pickup adults, release records and the audit trail. (lib/services/index.ts)
8. [low] A parent's jacket and helmet colours are saved onto the child's most recent lesson day rather than today, so patrol could be shown an old day's clothing or none at all. (lib/services/mock.ts)

## The change

Changed since the last scan (2026-11-07T23:27:24.127Z): 6 file(s) added or changed, 0 removed.

### changed: lib/domain/types.ts

````
// Shared domain types for Kestrel Kids. Owned by Platform (Dev 1).
// Change only by team agreement — every screen and service depends on these.

export type Id = string;
/** ISO 8601 timestamp, e.g. "2026-12-12T14:30:00-08:00". */
export type Timestamp = string;
/** Calendar date, "YYYY-MM-DD". */
export type LessonDate = string;

export type Role = 'parent' | 'instructor' | 'desk' | 'patrol' | 'admin';

export interface User {
  id: Id;
  role: Role;
  displayName: string;
  email: string;
}

/**
 * A user whose identity and role the server has verified from the session.
 * Only lib/session.ts produces these; never build one from browser input.
 */
export type VerifiedUser = User & { readonly __verified: true };

export type SkiLevel = 'Beginner' | 'Novice' | 'Intermediate' | 'Advanced';

export type ProfileStatus = 'Complete' | 'NeedsInformation';

export interface Child {
  id: Id;
  firstName: string;
  lastName: string;
  /** Other names the child is known by, e.g. a hyphenated surname. */
  otherNames: string[];
  birthDate: LessonDate;
  skiLevel: SkiLevel;
  groupId: Id | null;
  parentUserIds: Id[];
  liftPassNumber: string | null;
  mailingAddress: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * A medical category answer. `null` = not answered yet; `'none'` = parent
 * explicitly said none. A blank list never counts as "none".
 */
export type MedicalAnswer<T> = T[] | 'none' | null;

export interface Medication {
  name: string;
  /** Where it is kept, e.g. "Jacket left pocket" or "Ski school desk". */
  location: string;
  heldAtDesk: boolean;
}

export interface MedicalProfile {
  childId: Id;
  allergies: MedicalAnswer<string>;
  conditions: MedicalAnswer<string>;
  medications: MedicalAnswer<Medication>;
  /** What staff should do, e.g. "Give EpiPen, call patrol". */
  safetyInstructions: string;
  updatedBy: Id | null;
  updatedAt: Timestamp | null;
}

export interface EmergencyContact {
  id: Id;
  childId: Id;
  name: string;
  relationship: string;
  phone: string;
  priority: 1 | 2;
}

export interface AuthorizedAdult {
  id: Id;
  childId: Id;
  name: string;
  relationship: string;
  phone: string | null;
  isActive: boolean;
  updatedBy: Id;
  updatedAt: Timestamp;
}

export interface Consent {
  childId: Id;
  parentUserId: Id;
  typedName: string;
  photoConsent: boolean;
  consentedAt: Timestamp;
}

export interface LessonGroup {
  id: Id;
  groupNumber: number;
  day: LessonDate;
  skiLevel: SkiLevel;
  instructorUserId: Id;
}

export type AttendanceStatus = 'Expected' | 'CheckedIn' | 'Released';

export interface Attendance {
  id: Id;
  childId: Id;
  lessonDate: LessonDate;
  status: AttendanceStatus;
  bibNumber: string | null;
  /** Parent-given description of today's jacket/helmet. */
  clothingToday: string | null;
  checkedInAt: Timestamp | null;
  checkedInBy: Id | null;
}

/** Append-only. Never updated or deleted; corrections are separate entries. */
export interface PickupLog {
  id: Id;
  childId: Id;
  lessonDate: LessonDate;
  authorizedAdultId: Id;
  adultNameSnapshot: string;
  verifiedByUserId: Id;
  idChecked: true;
  releasedAt: Timestamp;
}

export interface PickupCorrection {
  id: Id;
  pickupLogId: Id;
  correctedBy: Id;
  reason: string;
  note: string;
  createdAt: Timestamp;
}

/** Append-only. */
export interface DeniedPickup {
  id: Id;
  childId: Id;
  lessonDate: LessonDate;
  statedAdultName: string;
  reason: string;
  staffUserId: Id;
  occurredAt: Timestamp;
}

export type IncidentStatus = 'Open' | 'Located' | 'Closed';

export type IncidentActionType =
  | 'search'
  | 'note'
  | 'family_contacted'
  | 'shared_with_police_or_rescuers'
  | 'status_change';

export interface IncidentAction {
  id: Id;
  type: IncidentActionType;
  note: string;
  staffUserId: Id;
  occurredAt: Timestamp;
}

export interface Incident {
  id: Id;
  childId: Id;
  lessonDate: LessonDate;
  reportedBy: Id;
  reportedAt: Timestamp;
  lastSeenAt: Timestamp;
  lastSeenLocation: string;
  clothingDescription: string;
  equipmentDescription: string;
  notes: string;
  status: IncidentStatus;
  actions: IncidentAction[];
  locatedAt: Timestamp | null;
  resolvedAt: Timestamp | null;
}

/** Hana's follow-up to mail the notice required after an emergency disclosure (R-030). */
export interface NoticeTask {
  id: Id;
  childId: Id;
  childName: string;
  incidentId: Id;
  mailingAddress: string | null;
  createdBy: Id;
  createdAt: Timestamp;
  status: 'Open' | 'Done';
}

export type AuditAction =
  | 'sign_in'
  | 'medical_updated'
  | 'contacts_updated'
  | 'pickup_adults_updated'
  | 'consent_given'
  | 'child_checked_in'
  | 'child_released'
  | 'pickup_denied'
  | 'pickup_corrected'
  | 'incident_reported'
  | 'incident_packet_viewed'
  | 'incident_updated'
  | 'admin_viewed_child_details'
  | 'group_assignment_changed'
  | 'notice_task_created'
  | 'access_denied';

/** Append-only. `detailsSummary` never contains medical values. */
export interface AuditEvent {
  id: Id;
  actorUserId: Id;
  action: AuditAction;
  entityType: string;
  entityId: Id;
  occurredAt: Timestamp;
  detailsSummary: string;
}

// ---------------------------------------------------------------------------
// Role-specific views returned by services (need-to-know projections)
// ---------------------------------------------------------------------------

export type MissingField =
  | 'parent'
  | 'emergencyContacts'
  | 'allergies'
  | 'conditions'
  | 'medications'
  | 'pickupAdult'
  | 'consent'
  | 'mailingAddress';

export interface Completion {
  status: ProfileStatus;
  missing: MissingField[];
}

/** Parent: summary card on /parent. */
export interface MyChildSummary {
  id: Id;
  firstName: string;
  lastName: string;
  groupNumber: number | null;
  completion: Completion;
  updatedAt: Timestamp;
}

/** Parent (own child) or admin (with logged reason): the full editable profile. */
export interface ChildProfile {
  child: Child;
  medical: MedicalProfile;
  emergencyContacts: EmergencyContact[];
  authorizedAdults: AuthorizedAdult[];
  consent: Consent | null;
  /** Parent-given jacket/helmet description per lesson day the child attends. */
  clothing: { lessonDate: LessonDate; description: string | null }[];
  completion: Completion;
}

/** The only medical information an instructor or patroller sees. */
export interface SafetyAlert {
  kind: 'allergy' | 'condition' | 'medication';
  summary: string;
  medicationLocation: string | null;
  instructions: string;
}

export interface InstructorRosterEntry {
  childId: Id;
  firstName: string;
  lastName: string;
  age: number;
  skiLevel: SkiLevel;
  alerts: SafetyAlert[];
  hasOpenIncident: boolean;
}

export interface InstructorRosterGroup {
  groupId: Id;
  groupNumber: number;
  skiLevel: SkiLevel;
  children: InstructorRosterEntry[];
}

export type DeskPickupState =
  | { kind: 'Expected' }
  | { kind: 'CheckedIn' }
  /** incidentToday: a resolved incident happened today — refer family questions to the admin. */
  | { kind: 'Released'; adultName: string; releasedAt: Timestamp; incidentToday: boolean }
  | { kind: 'OpenIncident' }
  | { kind: 'IncidentToday' };

export interface DeskRosterEntry {
  childId: Id;
  firstName: string;
  lastName: string;
  otherNames: string[];
  groupNumber: number | null;
  status: AttendanceStatus;
  bibNumber: string | null;
  checkedInAt: Timestamp | null;
  needsInformation: boolean;
  pickup: DeskPickupState;
}

/** Desk pickup screen: active adults and state, no medical data. */
export interface DeskPickupView {
  entry: DeskRosterEntry;
  authorizedAdults: Pick<AuthorizedAdult, 'id' | 'name' | 'relationship'>[];
  /** e.g. "Holds EpiPen for this child" — only for meds kept at the desk. */
  deskHeldMedications: string[];
}

export interface LastSeenDetails {
  lastSeenAt: Timestamp;
  lastSeenLocation: string;
  clothingDescription: string;
  equipmentDescription: string;
  notes: string;
}

export interface IncidentListItem {
  id: Id;
  childId: Id;
  childName: string;
  groupNumber: number | null;
  status: IncidentStatus;
  lastSeenAt: Timestamp;
  lastSeenLocation: string;
  escalateAt: Timestamp;
}

/** Patrol's one-screen emergency packet. */
export interface IncidentPacket {
  incident: Incident;
  child: {
    id: Id;
    firstName: string;
    lastName: string;
    otherNames: string[];
    age: number;
    skiLevel: SkiLevel;
    liftPassNumber: string | null;
    bibNumber: string | null;
  };
  group: { groupNumber: number; instructorName: string } | null;
  parentClothingToday: string | null;
  alerts: SafetyAlert[];
  emergencyContacts: Pick<EmergencyContact, 'name' | 'relationship' | 'phone' | 'priority'>[];
  /** The earlier of lastSeenAt + 60 minutes or 4:00 p.m. that day. */
  escalateAt: Timestamp;
}

/** Patrol search before an incident exists: identity only. */
export interface ChildSearchResult {
  childId: Id;
  firstName: string;
  lastName: string;
  age: number;
  groupNumber: number | null;
}

export interface CompletionSummaryRow {
  childId: Id;
  firstName: string;
  lastName: string;
  groupNumber: number | null;
  missing: MissingField[];
}

export interface OperationsSnapshot {
  lessonDate: LessonDate;
  expected: number;
  checkedIn: number;
  released: number;
  openIncidents: IncidentListItem[];
  deniedPickups: Pick<DeniedPickup, 'id' | 'childId' | 'statedAdultName' | 'occurredAt'>[];
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export interface ChildProfileChanges {
  allergies?: MedicalAnswer<string>;
  conditions?: MedicalAnswer<string>;
  medications?: MedicalAnswer<Medication>;
  safetyInstructions?: string;
  /** Replaces the full list. Exactly two requested. */
  emergencyContacts?: Omit<EmergencyContact, 'id' | 'childId'>[];
  /** Upsert by id; omit id to add. Deactivate with isActive:false. */
  authorizedAdults?: (Pick<AuthorizedAdult, 'name' | 'relationship' | 'phone' | 'isActive'> & { id?: Id })[];
  mailingAddress?: string;
  consent?: { typedName: string; photoConsent: boolean };
  /** Jacket/helmet for one lesson day; the child must be attending that day. */
  clothingToday?: { lessonDate: LessonDate; description: string };
}

export type IncidentUpdate =
  | { kind: 'action'; type: Exclude<IncidentActionType, 'status_change'>; note: string }
  | { kind: 'status'; status: IncidentStatus; note?: string };
````

### changed: lib/fixtures.ts

````
// Synthetic demo dataset — the ONE shared dataset for all four workstreams.
// Every person, phone number and address here is invented. Phones use the
// fictional 555-01xx range; emails use the reserved .test domain.
// IDs are stable: reference children/users by these constants, never by name.
import type {
  Attendance,
  AuthorizedAdult,
  Child,
  Consent,
  DeniedPickup,
  EmergencyContact,
  Incident,
  LessonDate,
  LessonGroup,
  MedicalProfile,
  PickupCorrection,
  PickupLog,
  AuditEvent,
  NoticeTask,
  User,
} from './domain/types';

export const DEMO_LESSON_DATE: LessonDate = '2026-12-12';
const SEEDED_AT = '2026-11-07T09:00:00-07:00';

export const USER_IDS = {
  parentAva: 'usr_parent_shah',
  parentLily: 'usr_parent_whitfield',
  parentOwen: 'usr_parent_okafor',
  parentOther: 'usr_parent_haddad',
  instructorGroup14: 'usr_instructor_lee',
  instructorGroup9: 'usr_instructor_rivera',
  desk: 'usr_desk_morgan',
  patrol: 'usr_patrol_fournier',
  admin: 'usr_admin_sato',
} as const;

export const CHILD_IDS = {
  ava: 'chd_ava',
  lily: 'chd_lily',
  owen: 'chd_owen',
  noor: 'chd_noor',
  mateo: 'chd_mateo',
  ella: 'chd_ella',
} as const;

export const GROUP_IDS = { group14: 'grp_14', group9: 'grp_09' } as const;

export const ADULT_IDS = {
  lilyFather: 'adl_lily_tom',
  /** Lily's uncle — seeded INACTIVE so Story B starts with a denial. */
  lilyUncle: 'adl_lily_mark',
  avaMother: 'adl_ava_priya',
  owenFather: 'adl_owen_daniel',
  noorMother: 'adl_noor_leila',
  mateoGuardian: 'adl_mateo_leila',
  ellaMother: 'adl_ella_leila',
} as const;

export const users: User[] = [
  { id: USER_IDS.parentAva, role: 'parent', displayName: 'Priya Shah', email: 'priya.shah@example.test' },
  { id: USER_IDS.parentLily, role: 'parent', displayName: 'Dana Whitfield', email: 'dana.whitfield@example.test' },
  { id: USER_IDS.parentOwen, role: 'parent', displayName: 'Ngozi Okafor', email: 'ngozi.okafor@example.test' },
  { id: USER_IDS.parentOther, role: 'parent', displayName: 'Leila Haddad', email: 'leila.haddad@example.test' },
  { id: USER_IDS.instructorGroup14, role: 'instructor', displayName: 'Jordan Lee', email: 'jordan.lee@example.test' },
  { id: USER_IDS.instructorGroup9, role: 'instructor', displayName: 'Sam Rivera', email: 'sam.rivera@example.test' },
  { id: USER_IDS.desk, role: 'desk', displayName: 'Casey Morgan', email: 'casey.morgan@example.test' },
  { id: USER_IDS.patrol, role: 'patrol', displayName: 'Rob Fournier', email: 'rob.fournier@example.test' },
  { id: USER_IDS.admin, role: 'admin', displayName: 'Hana Sato', email: 'hana.sato@example.test' },
];

const child = (c: Omit<Child, 'createdAt' | 'updatedAt'>): Child => ({ ...c, createdAt: SEEDED_AT, updatedAt: SEEDED_AT });

const medical = (m: Omit<MedicalProfile, 'updatedBy' | 'updatedAt'>, updatedBy: string | null = null): MedicalProfile => ({
  ...m,
  updatedBy,
  updatedAt: updatedBy ? SEEDED_AT : null,
});

export interface DemoState {
  users: User[];
  children: Child[];
  medical: MedicalProfile[];
  contacts: EmergencyContact[];
  adults: AuthorizedAdult[];
  consents: Consent[];
  groups: LessonGroup[];
  attendance: Attendance[];
  pickups: PickupLog[];
  corrections: PickupCorrection[];
  denials: DeniedPickup[];
  incidents: Incident[];
  audit: AuditEvent[];
  noticeTasks: NoticeTask[];
}

/** A fresh deep copy of the seed, so mocks and tests never share mutations. */
export function createDemoState(): DemoState {
  return structuredClone({
    users,
    groups: [
      { id: GROUP_IDS.group14, groupNumber: 14, day: DEMO_LESSON_DATE, skiLevel: 'Intermediate', instructorUserId: USER_IDS.instructorGroup14 },
      { id: GROUP_IDS.group9, groupNumber: 9, day: DEMO_LESSON_DATE, skiLevel: 'Novice', instructorUserId: USER_IDS.instructorGroup9 },
    ],
    children: [
      // Story A: starts with medical categories unanswered; parent adds tree-nut allergy.
      child({ id: CHILD_IDS.ava, firstName: 'Ava', lastName: 'Shah', otherNames: [], birthDate: '2018-03-14', skiLevel: 'Intermediate', groupId: GROUP_IDS.group14, parentUserIds: [USER_IDS.parentAva], liftPassNumber: 'KK-24-1001', mailingAddress: '12 Alder Lane, Squamish, BC V0N 0A1' }),
      // Story B: complete profile; uncle is not active.
      child({ id: CHILD_IDS.lily, firstName: 'Lily', lastName: 'Whitfield', otherNames: [], birthDate: '2017-07-02', skiLevel: 'Novice', groupId: GROUP_IDS.group9, parentUserIds: [USER_IDS.parentLily], liftPassNumber: 'KK-24-1002', mailingAddress: '48 Cedar Road, Whistler, BC V0N 0A2' }),
      // Story C: asthma + inhaler; missing consent so desk sees "Needs information".
      child({ id: CHILD_IDS.owen, firstName: 'Owen', lastName: 'Parr', otherNames: ['Owen Okafor-Parr', 'Okafor-Parr'], birthDate: '2016-11-20', skiLevel: 'Intermediate', groupId: GROUP_IDS.group14, parentUserIds: [USER_IDS.parentOwen], liftPassNumber: 'KK-24-1003', mailingAddress: '7 Spruce Court, Pemberton, BC V0N 0A3' }),
      // Complete; glucose gel held at the desk (S-014).
      child({ id: CHILD_IDS.noor, firstName: 'Noor', lastName: 'Haddad', otherNames: [], birthDate: '2015-05-09', skiLevel: 'Novice', groupId: GROUP_IDS.group9, parentUserIds: [USER_IDS.parentOther], liftPassNumber: 'KK-24-1004', mailingAddress: '3 Birch Way, Whistler, BC V0N 0A4' }),
      // Story D: missing second contact and consent.
      child({ id: CHILD_IDS.mateo, firstName: 'Mateo', lastName: 'Silva', otherNames: [], birthDate: '2019-01-25', skiLevel: 'Novice', groupId: GROUP_IDS.group9, parentUserIds: [USER_IDS.parentOther], liftPassNumber: 'KK-24-1005', mailingAddress: '3 Birch Way, Whistler, BC V0N 0A4' }),
      // Conditions left blank (S-003).
      child({ id: CHILD_IDS.ella, firstName: 'Ella', lastName: 'Haddad', otherNames: [], birthDate: '2017-09-30', skiLevel: 'Intermediate', groupId: GROUP_IDS.group14, parentUserIds: [USER_IDS.parentOther], liftPassNumber: 'KK-24-1006', mailingAddress: '3 Birch Way, Whistler, BC V0N 0A4' }),
    ],
    medical: [
      medical({ childId: CHILD_IDS.ava, allergies: null, conditions: null, medications: null, safetyInstructions: '' }),
      medical({ childId: CHILD_IDS.lily, allergies: 'none', conditions: 'none', medications: 'none', safetyInstructions: '' }, USER_IDS.parentLily),
      medical({ childId: CHILD_IDS.owen, allergies: 'none', conditions: ['Asthma'], medications: [{ name: 'Blue reliever inhaler', location: 'Jacket left chest pocket', heldAtDesk: false }], safetyInstructions: 'If wheezing, help him use the inhaler (2 puffs). Call patrol if no improvement in 5 minutes.' }, USER_IDS.parentOwen),
      medical({ childId: CHILD_IDS.noor, allergies: 'none', conditions: ['Type 1 diabetes'], medications: [{ name: 'Glucose gel', location: 'Ski school desk', heldAtDesk: true }], safetyInstructions: 'If shaky or pale, bring her to the desk for glucose gel.' }, USER_IDS.parentOther),
      medical({ childId: CHILD_IDS.mateo, allergies: 'none', conditions: 'none', medications: 'none', safetyInstructions: '' }, USER_IDS.parentOther),
      medical({ childId: CHILD_IDS.ella, allergies: 'none', conditions: null, medications: 'none', safetyInstructions: '' }, USER_IDS.parentOther),
    ],
    contacts: [
      { id: 'ec_ava_1', childId: CHILD_IDS.ava, name: 'Priya Shah', relationship: 'Mother', phone: '604-555-0101', priority: 1 },
      { id: 'ec_lily_1', childId: CHILD_IDS.lily, name: 'Dana Whitfield', relationship: 'Mother', phone: '604-555-0111', priority: 1 },
      { id: 'ec_lily_2', childId: CHILD_IDS.lily, name: 'Tom Whitfield', relationship: 'Father', phone: '604-555-0112', priority: 2 },
      { id: 'ec_owen_1', childId: CHILD_IDS.owen, name: 'Ngozi Okafor', relationship: 'Mother', phone: '604-555-0121', priority: 1 },
      { id: 'ec_owen_2', childId: CHILD_IDS.owen, name: 'Daniel Parr', relationship: 'Father', phone: '604-555-0122', priority: 2 },
      { id: 'ec_noor_1', childId: CHILD_IDS.noor, name: 'Leila Haddad', relationship: 'Mother', phone: '604-555-0131', priority: 1 },
      { id: 'ec_noor_2', childId: CHILD_IDS.noor, name: 'Karim Haddad', relationship: 'Father', phone: '604-555-0132', priority: 2 },
      { id: 'ec_mateo_1', childId: CHILD_IDS.mateo, name: 'Leila Haddad', relationship: 'Guardian', phone: '604-555-0131', priority: 1 },
      { id: 'ec_ella_1', childId: CHILD_IDS.ella, name: 'Leila Haddad', relationship: 'Mother', phone: '604-555-0131', priority: 1 },
      { id: 'ec_ella_2', childId: CHILD_IDS.ella, name: 'Karim Haddad', relationship: 'Father', phone: '604-555-0132', priority: 2 },
    ],
    adults: [
      { id: ADULT_IDS.avaMother, childId: CHILD_IDS.ava, name: 'Priya Shah', relationship: 'Mother', phone: '604-555-0101', isActive: true, updatedBy: USER_IDS.parentAva, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.lilyFather, childId: CHILD_IDS.lily, name: 'Tom Whitfield', relationship: 'Father', phone: '604-555-0112', isActive: true, updatedBy: USER_IDS.parentLily, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.lilyUncle, childId: CHILD_IDS.lily, name: 'Mark Whitfield', relationship: 'Uncle', phone: '604-555-0113', isActive: false, updatedBy: USER_IDS.parentLily, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.owenFather, childId: CHILD_IDS.owen, name: 'Daniel Parr', relationship: 'Father', phone: '604-555-0122', isActive: true, updatedBy: USER_IDS.parentOwen, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.noorMother, childId: CHILD_IDS.noor, name: 'Leila Haddad', relationship: 'Mother', phone: '604-555-0131', isActive: true, updatedBy: USER_IDS.parentOther, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.mateoGuardian, childId: CHILD_IDS.mateo, name: 'Leila Haddad', relationship: 'Guardian', phone: '604-555-0131', isActive: true, updatedBy: USER_IDS.parentOther, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.ellaMother, childId: CHILD_IDS.ella, name: 'Leila Haddad', relationship: 'Mother', phone: '604-555-0131', isActive: true, updatedBy: USER_IDS.parentOther, updatedAt: SEEDED_AT },
    ],
    consents: [
      { childId: CHILD_IDS.lily, parentUserId: USER_IDS.parentLily, typedName: 'Dana Whitfield', photoConsent: false, consentedAt: SEEDED_AT },
      { childId: CHILD_IDS.noor, parentUserId: USER_IDS.parentOther, typedName: 'Leila Haddad', photoConsent: true, consentedAt: SEEDED_AT },
      { childId: CHILD_IDS.ella, parentUserId: USER_IDS.parentOther, typedName: 'Leila Haddad', photoConsent: true, consentedAt: SEEDED_AT },
    ],
    attendance: [
      { id: 'att_ava', childId: CHILD_IDS.ava, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: null, checkedInAt: null, checkedInBy: null },
      { id: 'att_lily', childId: CHILD_IDS.lily, lessonDate: DEMO_LESSON_DATE, status: 'CheckedIn', bibNumber: '9', clothingToday: 'Purple jacket, white helmet', checkedInAt: '2026-12-12T09:05:00-07:00', checkedInBy: USER_IDS.desk },
      { id: 'att_owen', childId: CHILD_IDS.owen, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: 'Red jacket, blue helmet', checkedInAt: null, checkedInBy: null },
      { id: 'att_noor', childId: CHILD_IDS.noor, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: null, checkedInAt: null, checkedInBy: null },
      { id: 'att_mateo', childId: CHILD_IDS.mateo, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: null, checkedInAt: null, checkedInBy: null },
      { id: 'att_ella', childId: CHILD_IDS.ella, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: null, checkedInAt: null, checkedInBy: null },
    ],
    pickups: [],
    corrections: [],
    denials: [],
    incidents: [],
    audit: [],
    noticeTasks: [],
  } satisfies DemoState);
}
````

### changed: lib/services/contract.ts

````
// The shared service contract (SPEC §6). UI code calls ONLY these functions,
// via `services` from '@/lib/services' and the user from `requireUser()`.
// The mock and Piezas implementations both satisfy this interface, so swapping
// them changes no UI logic.
import type {
  AuditEvent,
  AuthorizedAdult,
  ChildProfile,
  ChildProfileChanges,
  ChildSearchResult,
  CompletionSummaryRow,
  DeniedPickup,
  DeskPickupView,
  DeskRosterEntry,
  Id,
  Incident,
  IncidentListItem,
  IncidentPacket,
  IncidentUpdate,
  InstructorRosterGroup,
  LastSeenDetails,
  LessonDate,
  MyChildSummary,
  NoticeTask,
  OperationsSnapshot,
  PickupCorrection,
  PickupLog,
  VerifiedUser,
} from '../domain/types';

export type ServiceErrorCode =
  /** Missing, or exists but the actor may not know it exists. */
  | 'not_found'
  /** Actor's role may never do this. */
  | 'forbidden'
  /** Input failed validation; see `fields`. */
  | 'invalid'
  /** Business rule blocks it (already released, unlisted adult, open incident, group full). */
  | 'blocked';

export interface ServiceError {
  code: ServiceErrorCode;
  /** Safe to show the user. Never contains another child's data. */
  message: string;
  /** Field path → message, for form validation. */
  fields?: Record<string, string>;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

export interface KestrelServices {
  // Parent ------------------------------------------------------------------
  getMyChildren(user: VerifiedUser): Promise<Result<MyChildSummary[]>>;
  /** Parent: own child only (else not_found). Admin: use openChildDetailsWithReason. */
  getChildProfile(childId: Id, user: VerifiedUser): Promise<Result<ChildProfile>>;
  updateChildProfile(childId: Id, changes: ChildProfileChanges, user: VerifiedUser): Promise<Result<ChildProfile>>;

  // Instructor --------------------------------------------------------------
  getInstructorRoster(lessonDate: LessonDate, user: VerifiedUser): Promise<Result<InstructorRosterGroup[]>>;

  // Desk --------------------------------------------------------------------
  /** Optional query matches first, last or other names, or group number. */
  getDeskRoster(lessonDate: LessonDate, user: VerifiedUser, query?: string): Promise<Result<DeskRosterEntry[]>>;
  getDeskPickupView(childId: Id, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<DeskPickupView>>;
  checkInChild(childId: Id, lessonDate: LessonDate, bibNumber: string, user: VerifiedUser): Promise<Result<DeskRosterEntry>>;
  getAuthorizedAdults(childId: Id, user: VerifiedUser): Promise<Result<Pick<AuthorizedAdult, 'id' | 'name' | 'relationship'>[]>>;
  /** Blocked if not checked in, already released, adult not active, idChecked false, or open incident. */
  recordPickup(childId: Id, authorizedAdultId: Id, idChecked: boolean, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<PickupLog>>;
  recordDeniedPickup(childId: Id, statedAdultName: string, reason: string, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<DeniedPickup>>;

  // Incidents ---------------------------------------------------------------
  /** Assigned instructor, desk, or patrol. */
  reportMissingChild(childId: Id, lessonDate: LessonDate, details: LastSeenDetails, user: VerifiedUser): Promise<Result<Incident>>;
  /** Patrol only. Identity fields only — no medical data before an incident exists. */
  searchChildren(query: string, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<ChildSearchResult[]>>;
  /** Patrol (and admin, for the dashboard). */
  listOpenIncidents(user: VerifiedUser): Promise<Result<IncidentListItem[]>>;
  /** Patrol only. Every successful call is audit-logged. */
  getIncidentPacket(incidentId: Id, user: VerifiedUser): Promise<Result<IncidentPacket>>;
  updateIncident(incidentId: Id, update: IncidentUpdate, user: VerifiedUser): Promise<Result<Incident>>;

  // Admin -------------------------------------------------------------------
  /** Never includes medical values. */
  getProfileCompletionSummary(user: VerifiedUser): Promise<Result<CompletionSummaryRow[]>>;
  getOperationsSnapshot(lessonDate: LessonDate, user: VerifiedUser): Promise<Result<OperationsSnapshot>>;
  /** Requires a non-empty reason; logged with who, when, which child and why. */
  openChildDetailsWithReason(childId: Id, reason: string, user: VerifiedUser): Promise<Result<ChildProfile>>;
  /** Blocked if the group already has six children. */
  assignChildToGroup(childId: Id, groupId: Id, user: VerifiedUser): Promise<Result<{ childId: Id; groupId: Id }>>;
  /** Adds a correction beside the original; the original pickup log is never changed. */
  addPickupCorrection(pickupLogId: Id, reason: string, note: string, user: VerifiedUser): Promise<Result<PickupCorrection>>;
  /** Hana's open "mail the notice" tasks, created when patrol records sharing with police or rescuers. */
  getNoticeTasks(user: VerifiedUser): Promise<Result<NoticeTask[]>>;
  /** Newest first. Entries never contain medical values. */
  getAuditLog(user: VerifiedUser): Promise<Result<AuditEvent[]>>;
}
````

### changed: lib/services/mock.ts

````
// In-memory implementation of the service contract over the synthetic seed.
// Authorization here is the real policy: the Piezas implementation must keep
// identical behaviour, and tests/unit/services.spec.ts holds both to it.
import type { DemoState } from '../fixtures';
import {
  ageOn,
  computeCompletion,
  escalationTime,
  isValidPhone,
  matchesName,
  MAX_GROUP_SIZE,
  safetyAlerts,
} from '../domain/rules';
import type {
  AuditAction,
  Child,
  ChildProfile,
  ChildProfileChanges,
  DeskPickupState,
  DeskRosterEntry,
  Id,
  Incident,
  IncidentListItem,
  LessonDate,
  MedicalAnswer,
  Role,
  VerifiedUser,
} from '../domain/types';
import type { KestrelServices, Result, ServiceError } from './contract';

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = (code: ServiceError['code'], message: string, fields?: Record<string, string>): Result<never> => ({
  ok: false,
  error: fields ? { code, message, fields } : { code, message },
});
const NOT_FOUND = fail('not_found', 'Not found.');
const FORBIDDEN = fail('forbidden', 'You do not have access to this.');

export function createMockServices(
  state: DemoState,
  now: () => Date = () => new Date(),
): KestrelServices {
  const stamp = () => now().toISOString();
  const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

  const audit = (user: VerifiedUser, action: AuditAction, entityType: string, entityId: Id, detailsSummary: string) => {
    state.audit.push({ id: newId('aud'), actorUserId: user.id, action, entityType, entityId, occurredAt: stamp(), detailsSummary });
  };

  const deny = (user: VerifiedUser, entityType: string, entityId: Id, what: string, result: Result<never> = FORBIDDEN) => {
    audit(user, 'access_denied', entityType, entityId, `${user.role} denied: ${what}`);
    return result;
  };

  const is = (user: VerifiedUser, ...roles: Role[]) => roles.includes(user.role);
  const findChild = (id: Id) => state.children.find((c) => c.id === id);
  const groupOf = (child: Child) => state.groups.find((g) => g.id === child.groupId) ?? null;
  const ownsChild = (user: VerifiedUser, child: Child) => user.role === 'parent' && child.parentUserIds.includes(user.id);
  const instructorAssigned = (user: VerifiedUser, child: Child, date: LessonDate) => {
    const group = groupOf(child);
    return user.role === 'instructor' && group?.instructorUserId === user.id && group.day === date;
  };
  const attendanceFor = (childId: Id, date: LessonDate) =>
    state.attendance.find((a) => a.childId === childId && a.lessonDate === date);
  const medicalFor = (childId: Id) => state.medical.find((m) => m.childId === childId)!;
  const incidentsFor = (childId: Id, date: LessonDate) =>
    state.incidents.filter((i) => i.childId === childId && i.lessonDate === date);

  const profileOf = (child: Child): ChildProfile => {
    const parts = {
      child,
      medical: medicalFor(child.id),
      emergencyContacts: state.contacts.filter((c) => c.childId === child.id).sort((a, b) => a.priority - b.priority),
      authorizedAdults: state.adults.filter((a) => a.childId === child.id),
      consent: state.consents.find((c) => c.childId === child.id) ?? null,
    };
    const clothing = state.attendance
      .filter((a) => a.childId === child.id)
      .map((a) => ({ lessonDate: a.lessonDate, description: a.clothingToday }));
    return structuredClone({ ...parts, clothing, completion: computeCompletion(parts) });
  };

  const deskEntry = (child: Child, date: LessonDate): DeskRosterEntry | null => {
    const att = attendanceFor(child.id, date);
    if (!att) return null;
    const incidents = incidentsFor(child.id, date);
    const pickup = state.pickups.find((p) => p.childId === child.id && p.lessonDate === date);
    const state_: DeskPickupState = incidents.some((i) => i.status === 'Open')
      ? { kind: 'OpenIncident' }
      : pickup
        ? { kind: 'Released', adultName: pickup.adultNameSnapshot, releasedAt: pickup.releasedAt, incidentToday: incidents.length > 0 }
        : incidents.length
          ? { kind: 'IncidentToday' }
          : { kind: att.status === 'CheckedIn' ? 'CheckedIn' : 'Expected' };
    return {
      childId: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      otherNames: [...child.otherNames],
      groupNumber: groupOf(child)?.groupNumber ?? null,
      status: att.status,
      bibNumber: att.bibNumber,
      checkedInAt: att.checkedInAt,
      needsInformation: profileOf(child).completion.status === 'NeedsInformation',
      pickup: state_,
    };
  };

  const incidentItem = (incident: Incident): IncidentListItem => {
    const child = findChild(incident.childId)!;
    return {
      id: incident.id,
      childId: child.id,
      childName: `${child.firstName} ${child.lastName}`,
      groupNumber: groupOf(child)?.groupNumber ?? null,
      status: incident.status,
      lastSeenAt: incident.lastSeenAt,
      lastSeenLocation: incident.lastSeenLocation,
      escalateAt: escalationTime(incident.lastSeenAt, incident.lessonDate),
    };
  };

  const validateList = (answer: MedicalAnswer<string> | undefined, key: string, errors: Record<string, string>) => {
    if (answer === undefined || answer === null || answer === 'none') return;
    if (!Array.isArray(answer) || answer.some((v) => typeof v !== 'string' || !v.trim()))
      errors[key] = 'Enter each item, or choose "none".';
  };

  const validateChanges = (child: Child, changes: ChildProfileChanges): Record<string, string> => {
    const errors: Record<string, string> = {};
    validateList(changes.allergies, 'allergies', errors);
    validateList(changes.conditions, 'conditions', errors);
    const meds = changes.medications;
    if (Array.isArray(meds)) {
      meds.forEach((m, i) => {
        if (!m.name?.trim()) errors[`medications.${i}.name`] = 'Enter the medication name.';
        if (!m.location?.trim()) errors[`medications.${i}.location`] = 'Say where it is kept.';
      });
    } else if (meds !== undefined && meds !== null && meds !== 'none') errors.medications = 'Enter each medication, or choose "none".';
    if (changes.emergencyContacts) {
      if (changes.emergencyContacts.length > 2) errors.emergencyContacts = 'Enter up to two emergency contacts.';
      changes.emergencyContacts.forEach((c, i) => {
        if (!c.name?.trim()) errors[`emergencyContacts.${i}.name`] = 'Enter a name.';
        if (!c.relationship?.trim()) errors[`emergencyContacts.${i}.relationship`] = 'Enter the relationship.';
        if (!isValidPhone(c.phone ?? '')) errors[`emergencyContacts.${i}.phone`] = 'Enter a 10-digit phone number, e.g. 604-555-0101.';
      });
    }
    changes.authorizedAdults?.forEach((a, i) => {
      if (a.id && !state.adults.some((x) => x.id === a.id && x.childId === child.id)) errors[`authorizedAdults.${i}`] = 'Unknown adult.';
      if (!a.name?.trim()) errors[`authorizedAdults.${i}.name`] = 'Enter a name.';
      if (!a.relationship?.trim()) errors[`authorizedAdults.${i}.relationship`] = 'Enter the relationship.';
      if (a.phone && !isValidPhone(a.phone)) errors[`authorizedAdults.${i}.phone`] = 'Enter a 10-digit phone number, e.g. 604-555-0101.';
    });
    if (changes.consent && !changes.consent.typedName?.trim()) errors['consent.typedName'] = 'Type your full name to consent.';
    if (changes.mailingAddress !== undefined && !changes.mailingAddress.trim()) errors.mailingAddress = 'Enter a mailing address.';
    if (changes.clothingToday && !attendanceFor(child.id, changes.clothingToday.lessonDate))
      errors.clothingToday = 'This child has no lesson on that day.';
    return errors;
  };

  const trimList = <T>(answer: MedicalAnswer<T>, map: (v: T) => T): MedicalAnswer<T> =>
    Array.isArray(answer) ? answer.map(map) : answer;

  return {
    async getMyChildren(user) {
      if (!is(user, 'parent')) return FORBIDDEN;
      return ok(
        state.children
          .filter((c) => ownsChild(user, c))
          .map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            groupNumber: groupOf(c)?.groupNumber ?? null,
            completion: profileOf(c).completion,
            updatedAt: c.updatedAt,
          })),
      );
    },

    async getChildProfile(childId, user) {
      const child = findChild(childId);
      if (user.role === 'parent') return child && ownsChild(user, child) ? ok(profileOf(child)) : deny(user, 'Child', childId, 'profile', NOT_FOUND);
      return deny(user, 'Child', childId, 'full profile');
    },

    async updateChildProfile(childId, changes, user) {
      const child = findChild(childId);
      if (user.role !== 'parent') return deny(user, 'Child', childId, 'profile update');
      if (!child || !ownsChild(user, child)) return deny(user, 'Child', childId, 'profile update', NOT_FOUND);
      const errors = validateChanges(child, changes);
      if (Object.keys(errors).length) return fail('invalid', 'Please fix the highlighted fields.', errors);

      const at = stamp();
      const med = medicalFor(childId);
      const medicalChanged = (['allergies', 'conditions', 'medications', 'safetyInstructions'] as const).filter((k) => changes[k] !== undefined);
      if (changes.allergies !== undefined) med.allergies = trimList(changes.allergies, (v) => v.trim());
      if (changes.conditions !== undefined) med.conditions = trimList(changes.conditions, (v) => v.trim());
      if (changes.medications !== undefined)
        med.medications = trimList(changes.medications, (m) => ({ name: m.name.trim(), location: m.location.trim(), heldAtDesk: Boolean(m.heldAtDesk) }));
      if (changes.safetyInstructions !== undefined) med.safetyInstructions = changes.safetyInstructions.trim();
      if (medicalChanged.length) {
        med.updatedBy = user.id;
        med.updatedAt = at;
        audit(user, 'medical_updated', 'MedicalProfile', childId, `Updated ${medicalChanged.join(', ')}`);
      }

      if (changes.emergencyContacts) {
        state.contacts = state.contacts.filter((c) => c.childId !== childId);
        changes.emergencyContacts.forEach((c, i) =>
          state.contacts.push({ id: newId('ec'), childId, name: c.name.trim(), relationship: c.relationship.trim(), phone: c.phone.trim(), priority: (i + 1) as 1 | 2 }),
        );
        audit(user, 'contacts_updated', 'EmergencyContact', childId, `Set ${changes.emergencyContacts.length} emergency contact(s)`);
      }

      if (changes.authorizedAdults) {
        for (const a of changes.authorizedAdults) {
          const existing = a.id ? state.adults.find((x) => x.id === a.id) : undefined;
          const fields = { name: a.name.trim(), relationship: a.relationship.trim(), phone: a.phone?.trim() || null, isActive: a.isActive, updatedBy: user.id, updatedAt: at };
          if (existing) Object.assign(existing, fields);
          else state.adults.push({ id: newId('adl'), childId, ...fields });
        }
        audit(user, 'pickup_adults_updated', 'AuthorizedAdult', childId, `Updated ${changes.authorizedAdults.length} pickup adult(s)`);
      }

      if (changes.consent) {
        state.consents = state.consents.filter((c) => c.childId !== childId);
        state.consents.push({ childId, parentUserId: user.id, typedName: changes.consent.typedName.trim(), photoConsent: changes.consent.photoConsent, consentedAt: at });
        audit(user, 'consent_given', 'Consent', childId, `Consent given (photos: ${changes.consent.photoConsent ? 'yes' : 'no'})`);
      }
      if (changes.mailingAddress !== undefined) child.mailingAddress = changes.mailingAddress.trim();
      if (changes.clothingToday) {
        attendanceFor(childId, changes.clothingToday.lessonDate)!.clothingToday = changes.clothingToday.description.trim() || null;
      }
      child.updatedAt = at;
      return ok(profileOf(child));
    },

    async getInstructorRoster(lessonDate, user) {
      if (!is(user, 'instructor')) return FORBIDDEN;
      return ok(
        state.groups
          .filter((g) => g.instructorUserId === user.id && g.day === lessonDate)
          .map((g) => ({
            groupId: g.id,
            groupNumber: g.groupNumber,
            skiLevel: g.skiLevel,
            children: state.children
              .filter((c) => c.groupId === g.id)
              .map((c) => ({
                childId: c.id,
                firstName: c.firstName,
                lastName: c.lastName,
                age: ageOn(c.birthDate, lessonDate),
                skiLevel: c.skiLevel,
                alerts: safetyAlerts(medicalFor(c.id)),
                hasOpenIncident: incidentsFor(c.id, lessonDate).some((i) => i.status === 'Open'),
              })),
          })),
      );
    },

    async getDeskRoster(lessonDate, user, query = '') {
      if (!is(user, 'desk')) return FORBIDDEN;
      const q = query.trim();
      return ok(
        state.children
          .filter((c) => matchesName(c, q) || String(groupOf(c)?.groupNumber ?? '') === q)
          .map((c) => deskEntry(c, lessonDate))
          .filter((e): e is DeskRosterEntry => e !== null),
      );
    },

    async getDeskPickupView(childId, lessonDate, user) {
      if (!is(user, 'desk')) return deny(user, 'Child', childId, 'desk pickup view');
      const child = findChild(childId);
      const entry = child && deskEntry(child, lessonDate);
      if (!child || !entry) return NOT_FOUND;
      const meds = medicalFor(childId).medications;
      return ok({
        entry,
        authorizedAdults: state.adults.filter((a) => a.childId === childId && a.isActive).map(({ id, name, relationship }) => ({ id, name, relationship })),
        deskHeldMedications: Array.isArray(meds) ? meds.filter((m) => m.heldAtDesk).map((m) => `Holds ${m.name} for this child`) : [],
      });
    },

    async checkInChild(childId, lessonDate, bibNumber, user) {
      if (!is(user, 'desk')) return deny(user, 'Attendance', childId, 'check-in');
      const child = findChild(childId);
      const att = attendanceFor(childId, lessonDate);
      if (!child || !att) return NOT_FOUND;
      if (!bibNumber.trim()) return fail('invalid', 'Enter the bib number.', { bibNumber: 'Enter the bib number.' });
      if (att.status !== 'Expected') return fail('blocked', `Already ${att.status === 'CheckedIn' ? 'checked in' : 'released'}.`);
      Object.assign(att, { status: 'CheckedIn', bibNumber: bibNumber.trim(), checkedInAt: stamp(), checkedInBy: user.id });
      audit(user, 'child_checked_in', 'Attendance', att.id, `Checked in with bib ${att.bibNumber}`);
      return ok(deskEntry(child, lessonDate)!);
    },

    async getAuthorizedAdults(childId, user) {
      if (!is(user, 'desk')) return deny(user, 'AuthorizedAdult', childId, 'pickup list');
      if (!findChild(childId)) return NOT_FOUND;
      return ok(state.adults.filter((a) => a.childId === childId && a.isActive).map(({ id, name, relationship }) => ({ id, name, relationship })));
    },

    async recordPickup(childId, authorizedAdultId, idChecked, lessonDate, user) {
      if (!is(user, 'desk')) return deny(user, 'PickupLog', childId, 'release');
      const child = findChild(childId);
      const att = attendanceFor(childId, lessonDate);
      if (!child || !att) return NOT_FOUND;
      const prior = state.pickups.find((p) => p.childId === childId && p.lessonDate === lessonDate);
      if (prior) return fail('blocked', `Already released to ${prior.adultNameSnapshot} at ${prior.releasedAt}. Ask an admin to review.`);
      if (incidentsFor(childId, lessonDate).some((i) => i.status === 'Open')) return fail('blocked', 'Release blocked: call patrol.');
      if (att.status !== 'CheckedIn') return fail('blocked', 'Child is not checked in.');
      const adult = state.adults.find((a) => a.id === authorizedAdultId && a.childId === childId && a.isActive);
      if (!adult)
        return fail('blocked', 'Release blocked: this adult is not on the active pickup list. Contact an authorized parent or the ski school admin.');
      if (idChecked !== true) return fail('invalid', 'Confirm you checked photo ID.', { idChecked: 'Confirm you checked photo ID.' });
      const log = { id: newId('pkp'), childId, lessonDate, authorizedAdultId: adult.id, adultNameSnapshot: adult.name, verifiedByUserId: user.id, idChecked: true as const, releasedAt: stamp() };
      state.pickups.push(log);
      att.status = 'Released';
      audit(user, 'child_released', 'PickupLog', log.id, `Released to authorized adult ${adult.id} after ID check`);
      return ok({ ...log });
    },

    async recordDeniedPickup(childId, statedAdultName, reason, lessonDate, user) {
      if (!is(user, 'desk')) return deny(user, 'DeniedPickup', childId, 'record denial');
      if (!findChild(childId) || !attendanceFor(childId, lessonDate)) return NOT_FOUND;
      const errors: Record<string, string> = {};
      if (!statedAdultName.trim()) errors.statedAdultName = 'Enter the name the adult gave.';
      if (!reason.trim()) errors.reason = 'Enter the reason.';
      if (Object.keys(errors).length) return fail('invalid', 'Please fix the highlighted fields.', errors);
      const denial = { id: newId('dnp'), childId, lessonDate, statedAdultName: statedAdultName.trim(), reason: reason.trim(), staffUserId: user.id, occurredAt: stamp() };
      state.denials.push(denial);
      audit(user, 'pickup_denied', 'DeniedPickup', denial.id, 'Pickup refused: adult not on active list');
      return ok({ ...denial });
    },

    async reportMissingChild(childId, lessonDate, details, user) {
      const child = findChild(childId);
      if (!is(user, 'instructor', 'desk', 'patrol')) return deny(user, 'Incident', childId, 'report missing');
      if (!child || !attendanceFor(childId, lessonDate)) return NOT_FOUND;
      if (user.role === 'instructor' && !instructorAssigned(user, child, lessonDate)) return deny(user, 'Incident', childId, 'report missing (unassigned)', NOT_FOUND);
      const errors: Record<string, string> = {};
      if (Number.isNaN(Date.parse(details.lastSeenAt))) errors.lastSeenAt = 'Enter when the child was last seen.';
      if (!details.lastSeenLocation?.trim()) errors.lastSeenLocation = 'Enter where the child was last seen.';
      if (Object.keys(errors).length) return fail('invalid', 'Please fix the highlighted fields.', errors);
      if (incidentsFor(childId, lessonDate).some((i) => i.status === 'Open')) return fail('blocked', 'An open incident already exists for this child.');
      const incident: Incident = {
        id: newId('inc'),
        childId,
        lessonDate,
        reportedBy: user.id,
        reportedAt: stamp(),
        lastSeenAt: new Date(details.lastSeenAt).toISOString(),
        lastSeenLocation: details.lastSeenLocation.trim(),
        clothingDescription: details.clothingDescription?.trim() ?? '',
        equipmentDescription: details.equipmentDescription?.trim() ?? '',
        notes: details.notes?.trim() ?? '',
        status: 'Open',
        actions: [],
        locatedAt: null,
        resolvedAt: null,
      };
      state.incidents.push(incident);
      audit(user, 'incident_reported', 'Incident', incident.id, `Missing child reported by ${user.role}`);
      return ok(structuredClone(incident));
    },

    async searchChildren(query, lessonDate, user) {
      if (!is(user, 'patrol')) return FORBIDDEN;
      if (!query.trim()) return ok([]);
      return ok(
        state.children
          .filter((c) => attendanceFor(c.id, lessonDate) && matchesName(c, query))
          .map((c) => ({ childId: c.id, firstName: c.firstName, lastName: c.lastName, age: ageOn(c.birthDate, lessonDate), groupNumber: groupOf(c)?.groupNumber ?? null })),
      );
    },

    async listOpenIncidents(user) {
      if (!is(user, 'patrol', 'admin')) return FORBIDDEN;
      return ok(state.incidents.filter((i) => i.status !== 'Closed').map(incidentItem));
    },

    async getIncidentPacket(incidentId, user) {
      if (!is(user, 'patrol')) return deny(user, 'Incident', incidentId, 'emergency packet');
      const incident = state.incidents.find((i) => i.id === incidentId);
      if (!incident) return NOT_FOUND;
      if (incident.status === 'Closed') return fail('blocked', 'This incident is closed.');
      const child = findChild(incident.childId)!;
      const group = groupOf(child);
      const att = attendanceFor(child.id, incident.lessonDate);
      audit(user, 'incident_packet_viewed', 'Incident', incident.id, `Emergency packet opened for incident ${incident.id}`);
      return ok({
        incident: structuredClone(incident),
        child: {
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          otherNames: [...child.otherNames],
          age: ageOn(child.birthDate, incident.lessonDate),
          skiLevel: child.skiLevel,
          liftPassNumber: child.liftPassNumber,
          bibNumber: att?.bibNumber ?? null,
        },
        group: group ? { groupNumber: group.groupNumber, instructorName: state.users.find((u) => u.id === group.instructorUserId)?.displayName ?? 'Unknown' } : null,
        parentClothingToday: att?.clothingToday ?? null,
        alerts: safetyAlerts(medicalFor(child.id)),
        emergencyContacts: state.contacts
          .filter((c) => c.childId === child.id)
          .sort((a, b) => a.priority - b.priority)
          .map(({ name, relationship, phone, priority }) => ({ name, relationship, phone, priority })),
        escalateAt: escalationTime(incident.lastSeenAt, incident.lessonDate),
      });
    },

    async updateIncident(incidentId, update, user) {
      if (!is(user, 'patrol')) return deny(user, 'Incident', incidentId, 'incident update');
      const incident = state.incidents.find((i) => i.id === incidentId);
      if (!incident) return NOT_FOUND;
      if (incident.status === 'Closed') return fail('blocked', 'This incident is closed.');
      const at = stamp();
      if (update.kind === 'action') {
        if (!update.note?.trim()) return fail('invalid', 'Add a note for this action.', { note: 'Add a note for this action.' });
        incident.actions.push({ id: newId('act'), type: update.type, note: update.note.trim(), staffUserId: user.id, occurredAt: at });
        audit(user, 'incident_updated', 'Incident', incident.id, `Action: ${update.type}`);
        if (update.type === 'shared_with_police_or_rescuers') {
          const child = findChild(incident.childId)!;
          const task = { id: newId('tsk'), childId: child.id, childName: `${child.firstName} ${child.lastName}`, incidentId: incident.id, mailingAddress: child.mailingAddress, createdBy: user.id, createdAt: at, status: 'Open' as const };
          state.noticeTasks.push(task);
          audit(user, 'notice_task_created', 'NoticeTask', task.id, `Notice task created for incident ${incident.id}`);
        }
        return ok(structuredClone(incident));
      }
      if (!['Open', 'Located', 'Closed'].includes(update.status)) return fail('invalid', 'Unknown status.');
      if (update.status === incident.status) return fail('blocked', `Already ${incident.status}.`);
      incident.actions.push({ id: newId('act'), type: 'status_change', note: `${incident.status} → ${update.status}${update.note?.trim() ? `: ${update.note.trim()}` : ''}`, staffUserId: user.id, occurredAt: at });
      incident.status = update.status;
      if (update.status === 'Located') incident.locatedAt = at;
      if (update.status === 'Closed') incident.resolvedAt = at;
      audit(user, 'incident_updated', 'Incident', incident.id, `Status set to ${update.status}`);
      return ok(structuredClone(incident));
    },

    async getProfileCompletionSummary(user) {
      if (!is(user, 'admin')) return FORBIDDEN;
      return ok(
        state.children
          .map((c) => ({ c, completion: profileOf(c).completion }))
          .filter(({ completion }) => completion.status === 'NeedsInformation')
          .map(({ c, completion }) => ({ childId: c.id, firstName: c.firstName, lastName: c.lastName, groupNumber: groupOf(c)?.groupNumber ?? null, missing: completion.missing })),
      );
    },

    async getOperationsSnapshot(lessonDate, user) {
      if (!is(user, 'admin')) return FORBIDDEN;
      const day = state.attendance.filter((a) => a.lessonDate === lessonDate);
      return ok({
        lessonDate,
        expected: day.length,
        checkedIn: day.filter((a) => a.status !== 'Expected').length,
        released: day.filter((a) => a.status === 'Released').length,
        openIncidents: state.incidents.filter((i) => i.lessonDate === lessonDate && i.status !== 'Closed').map(incidentItem),
        deniedPickups: state.denials.filter((d) => d.lessonDate === lessonDate).map(({ id, childId, statedAdultName, occurredAt }) => ({ id, childId, statedAdultName, occurredAt })),
      });
    },

    async openChildDetailsWithReason(childId, reason, user) {
      if (!is(user, 'admin')) return deny(user, 'Child', childId, 'details with reason');
      const child = findChild(childId);
      if (!child) return NOT_FOUND;
      if (!reason.trim()) return deny(user, 'Child', childId, 'details without a reason', fail('invalid', 'Give a reason to open these details.', { reason: 'Give a reason to open these details.' }));
      audit(user, 'admin_viewed_child_details', 'Child', childId, `Reason: ${reason.trim()}`);
      return ok(profileOf(child));
    },

    async assignChildToGroup(childId, groupId, user) {
      if (!is(user, 'admin')) return deny(user, 'Child', childId, 'group assignment');
      const child = findChild(childId);
      const group = state.groups.find((g) => g.id === groupId);
      if (!child || !group) return NOT_FOUND;
      if (child.groupId === groupId) return ok({ childId, groupId });
      if (state.children.filter((c) => c.groupId === groupId).length >= MAX_GROUP_SIZE)
        return fail('blocked', `Group ${group.groupNumber} already has ${MAX_GROUP_SIZE} children.`);
      const from = child.groupId;
      child.groupId = groupId;
      child.updatedAt = stamp();
      audit(user, 'group_assignment_changed', 'Child', childId, `Moved from ${from ?? 'no group'} to ${groupId}`);
      return ok({ childId, groupId });
    },

    async addPickupCorrection(pickupLogId, reason, note, user) {
      if (!is(user, 'admin')) return deny(user, 'PickupLog', pickupLogId, 'pickup correction');
      if (!state.pickups.some((p) => p.id === pickupLogId)) return NOT_FOUND;
      const errors: Record<string, string> = {};
      if (!reason.trim()) errors.reason = 'Enter why this correction is needed.';
      if (!note.trim()) errors.note = 'Enter the correction.';
      if (Object.keys(errors).length) return fail('invalid', 'Please fix the highlighted fields.', errors);
      const correction = { id: newId('cor'), pickupLogId, correctedBy: user.id, reason: reason.trim(), note: note.trim(), createdAt: stamp() };
      state.corrections.push(correction);
      audit(user, 'pickup_corrected', 'PickupLog', pickupLogId, `Correction added: ${correction.reason}`);
      return ok({ ...correction });
    },

    async getNoticeTasks(user) {
      if (!is(user, 'admin')) return FORBIDDEN;
      return ok(structuredClone(state.noticeTasks.filter((t) => t.status === 'Open')));
    },

    async getAuditLog(user) {
      if (!is(user, 'admin')) return FORBIDDEN;
      return ok(structuredClone(state.audit).reverse());
    },
  };
}
````

### changed: tests/frontend.spec.ts

````
import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

if (!process.env.DEMO_PASSWORD && existsSync('.env')) process.loadEnvFile('.env');

test('signed-out visitors land on sign-in, which fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in');
  await expect(page.getByTestId('current-user')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const id of ['login-email', 'login-password', 'login-submit']) {
    const box = await page.getByTestId(id).boundingBox();
    expect(box!.height, id).toBeGreaterThanOrEqual(48);
  }
});

test('each role signs in and sees only its own authorized summary', async ({ page }) => {
  const password = process.env.DEMO_PASSWORD;
  expect(password, 'DEMO_PASSWORD must be set (in .env) for the sign-in check').toBeTruthy();
  const cases = [
    ['priya.shah@example.test', 'Priya Shah · Parent', '1 linked child(ren) · 1 need information'],
    ['jordan.lee@example.test', 'Jordan Lee · Instructor', 'Group 14 · 3 children · 1 with safety alerts'],
    ['casey.morgan@example.test', 'Casey Morgan · Desk', '6 expected · 1 checked in · 0 released'],
    ['rob.fournier@example.test', 'Rob Fournier · Patrol', '0 open incident(s)'],
    ['hana.sato@example.test', 'Hana Sato · Admin', '4 child profile(s) need information'],
  ];
  for (const [email, who, summary] of cases) {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password!);
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('current-user')).toHaveText(who);
    await expect(page.getByTestId('home-summary')).toHaveText(summary);
    await page.getByTestId('sign-out').click();
    await expect(page).toHaveURL(/\/login$/);
  }
});

test('a wrong password shows an error and no session', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('priya.shah@example.test');
  await page.getByTestId('login-password').fill('definitely-wrong');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('login-error')).toBeVisible();
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});
````

### changed: tests/unit/services.spec.ts

````
import { expect, test } from '@playwright/test';
import type { VerifiedUser } from '../../lib/domain/types';
import { ADULT_IDS, CHILD_IDS, createDemoState, DEMO_LESSON_DATE as DAY, GROUP_IDS, USER_IDS, type DemoState } from '../../lib/fixtures';
import type { KestrelServices, Result } from '../../lib/services/contract';
import { createMockServices } from '../../lib/services/mock';

let state: DemoState;
let svc: KestrelServices;
const as = (id: string): VerifiedUser => ({ ...state.users.find((u) => u.id === id)!, __verified: true });
const data = <T>(r: Result<T>): T => {
  if (!r.ok) throw new Error(`expected ok, got ${r.error.code}: ${r.error.message}`);
  return r.data;
};
const errCode = (r: Result<unknown>) => (r.ok ? 'ok' : r.error.code);

test.beforeEach(() => {
  state = createDemoState();
  svc = createMockServices(state, () => new Date('2026-12-12T15:00:00-07:00'));
});

test.describe('parent isolation (S-001)', () => {
  test('lists only linked children', async () => {
    expect(data(await svc.getMyChildren(as(USER_IDS.parentAva))).map((c) => c.id)).toEqual([CHILD_IDS.ava]);
  });

  test("Parent A gets not_found for Parent B's child, read and write", async () => {
    const r = await svc.getChildProfile(CHILD_IDS.lily, as(USER_IDS.parentAva));
    expect(r).toEqual({ ok: false, error: { code: 'not_found', message: 'Not found.' } });
    expect(errCode(await svc.updateChildProfile(CHILD_IDS.lily, { allergies: 'none' }, as(USER_IDS.parentAva)))).toBe('not_found');
    expect(state.medical.find((m) => m.childId === CHILD_IDS.lily)!.allergies).toBe('none');
    expect(state.audit.at(-1)).toMatchObject({ action: 'access_denied', actorUserId: USER_IDS.parentAva });
  });

  test('a non-existent id looks the same as a forbidden one', async () => {
    expect(await svc.getChildProfile('chd_nope', as(USER_IDS.parentAva))).toEqual(await svc.getChildProfile(CHILD_IDS.lily, as(USER_IDS.parentAva)));
  });

  test('staff roles cannot read the full profile', async () => {
    for (const id of [USER_IDS.instructorGroup14, USER_IDS.desk, USER_IDS.patrol, USER_IDS.admin])
      expect(errCode(await svc.getChildProfile(CHILD_IDS.ava, as(id))), id).toBe('forbidden');
  });
});

test.describe('parent updates (S-002 to S-005)', () => {
  test('a full update makes Ava Complete and records who and when', async () => {
    const parent = as(USER_IDS.parentAva);
    const r = data(
      await svc.updateChildProfile(
        CHILD_IDS.ava,
        {
          allergies: ['Tree nuts'],
          conditions: 'none',
          medications: [{ name: 'EpiPen', location: 'Jacket right pocket', heldAtDesk: false }],
          safetyInstructions: 'Give EpiPen in outer thigh, then call patrol.',
          emergencyContacts: [
            { name: 'Priya Shah', relationship: 'Mother', phone: '604-555-0101', priority: 1 },
            { name: 'Arun Shah', relationship: 'Father', phone: '(604) 555-0102', priority: 2 },
          ],
          consent: { typedName: 'Priya Shah', photoConsent: false },
        },
        parent,
      ),
    );
    expect(r.completion).toEqual({ status: 'Complete', missing: [] });
    expect(r.medical).toMatchObject({ updatedBy: USER_IDS.parentAva, updatedAt: new Date('2026-12-12T15:00:00-07:00').toISOString() });
    expect(data(await svc.getChildProfile(CHILD_IDS.ava, parent)).medical.allergies).toEqual(['Tree nuts']);
  });

  test('a 9-digit phone is rejected and nothing is saved', async () => {
    const before = structuredClone(state.contacts);
    const r = await svc.updateChildProfile(
      CHILD_IDS.lily,
      { emergencyContacts: [{ name: 'Dana Whitfield', relationship: 'Mother', phone: '604555-187', priority: 1 }] },
      as(USER_IDS.parentLily),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.fields).toEqual({ 'emergencyContacts.0.phone': 'Enter a 10-digit phone number, e.g. 604-555-0101.' });
    expect(state.contacts).toEqual(before);
  });

  test('validation rejects blank items, missing medication location, unknown adult ids and empty consent', async () => {
    const r = await svc.updateChildProfile(
      CHILD_IDS.ava,
      {
        allergies: ['  '],
        medications: [{ name: 'EpiPen', location: '', heldAtDesk: false }],
        authorizedAdults: [{ id: ADULT_IDS.lilyUncle, name: 'Mark', relationship: 'Uncle', phone: null, isActive: true }],
        consent: { typedName: ' ', photoConsent: true },
      },
      as(USER_IDS.parentAva),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.error.fields!).sort()).toEqual(['allergies', 'authorizedAdults.0', 'consent.typedName', 'medications.0.location']);
    expect(state.adults.find((a) => a.id === ADULT_IDS.lilyUncle)!.isActive).toBe(false);
  });

  test('a new allergy reaches only the assigned instructor (S-005, S-006)', async () => {
    await svc.updateChildProfile(CHILD_IDS.ava, { allergies: ['Tree nuts'], safetyInstructions: 'Give EpiPen.' }, as(USER_IDS.parentAva));
    const roster = data(await svc.getInstructorRoster(DAY, as(USER_IDS.instructorGroup14)));
    const ava = roster.flatMap((g) => g.children).find((c) => c.childId === CHILD_IDS.ava)!;
    expect(ava.alerts).toEqual([{ kind: 'allergy', summary: 'Allergy: Tree nuts', medicationLocation: null, instructions: 'Give EpiPen.' }]);

    const other = data(await svc.getInstructorRoster(DAY, as(USER_IDS.instructorGroup9)));
    expect(other.flatMap((g) => g.children).map((c) => c.childId)).not.toContain(CHILD_IDS.ava);
    expect(errCode(await svc.updateChildProfile(CHILD_IDS.ava, { allergies: 'none' }, as(USER_IDS.instructorGroup14)))).toBe('forbidden');
  });

  test('roster is empty on a day with no assignment', async () => {
    expect(data(await svc.getInstructorRoster('2026-12-13', as(USER_IDS.instructorGroup14)))).toEqual([]);
  });

  test('audit entries never carry medical values', async () => {
    await svc.updateChildProfile(CHILD_IDS.ava, { allergies: ['Tree nuts'], conditions: ['Eczema'] }, as(USER_IDS.parentAva));
    expect(JSON.stringify(state.audit)).not.toMatch(/Tree nuts|Eczema/);
  });
});

test.describe('desk and pickup (S-009 to S-014)', () => {
  test('search by other name, check in, flag needs-information without medical data', async () => {
    const desk = as(USER_IDS.desk);
    expect(data(await svc.getDeskRoster(DAY, desk, 'Okafor')).map((e) => e.childId)).toEqual([CHILD_IDS.owen]);
    const entry = data(await svc.checkInChild(CHILD_IDS.owen, DAY, '14', desk));
    expect(entry).toMatchObject({ status: 'CheckedIn', bibNumber: '14', needsInformation: true });
    expect(JSON.stringify(entry)).not.toMatch(/Asthma|inhaler/i);
    expect(errCode(await svc.checkInChild(CHILD_IDS.owen, DAY, '14', desk))).toBe('blocked');
  });

  test('search by group number', async () => {
    expect(data(await svc.getDeskRoster(DAY, as(USER_IDS.desk), '9')).map((e) => e.childId).sort()).toEqual([CHILD_IDS.lily, CHILD_IDS.mateo, CHILD_IDS.noor].sort());
  });

  test('desk pickup view lists only active adults and desk-held meds, nothing else medical', async () => {
    const view = data(await svc.getDeskPickupView(CHILD_IDS.noor, DAY, as(USER_IDS.desk)));
    expect(view.authorizedAdults).toEqual([{ id: ADULT_IDS.noorMother, name: 'Leila Haddad', relationship: 'Mother' }]);
    expect(view.deskHeldMedications).toEqual(['Holds Glucose gel for this child']);
    expect(JSON.stringify(view)).not.toMatch(/diabetes/i);
    expect(data(await svc.getAuthorizedAdults(CHILD_IDS.lily, as(USER_IDS.desk))).map((a) => a.id)).toEqual([ADULT_IDS.lilyFather]);
  });

  test('desk cannot read medical records or change the pickup list (S-010, S-011)', async () => {
    const desk = as(USER_IDS.desk);
    expect(errCode(await svc.getChildProfile(CHILD_IDS.ava, desk))).toBe('forbidden');
    expect(
      errCode(await svc.updateChildProfile(CHILD_IDS.lily, { authorizedAdults: [{ id: ADULT_IDS.lilyUncle, name: 'Mark Whitfield', relationship: 'Uncle', phone: null, isActive: true }] }, desk)),
    ).toBe('forbidden');
    expect(state.adults.find((a) => a.id === ADULT_IDS.lilyUncle)!.isActive).toBe(false);
  });

  test('Story B: unlisted uncle blocked, parent authorizes, released exactly once (S-012, S-013)', async () => {
    const desk = as(USER_IDS.desk);
    const blocked = await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyUncle, true, DAY, desk);
    expect(errCode(blocked)).toBe('blocked');
    data(await svc.recordDeniedPickup(CHILD_IDS.lily, 'Mark Whitfield', 'Not on active pickup list', DAY, desk));
    expect(state.pickups).toHaveLength(0);
    expect(state.denials).toHaveLength(1);

    data(await svc.updateChildProfile(CHILD_IDS.lily, { authorizedAdults: [{ id: ADULT_IDS.lilyUncle, name: 'Mark Whitfield', relationship: 'Uncle', phone: '604-555-0113', isActive: true }] }, as(USER_IDS.parentLily)));
    expect(data(await svc.getAuthorizedAdults(CHILD_IDS.lily, desk)).map((a) => a.id)).toContain(ADULT_IDS.lilyUncle);

    expect(errCode(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyUncle, false, DAY, desk))).toBe('invalid');
    const log = data(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyUncle, true, DAY, desk));
    expect(log).toMatchObject({ childId: CHILD_IDS.lily, lessonDate: DAY, authorizedAdultId: ADULT_IDS.lilyUncle, adultNameSnapshot: 'Mark Whitfield', verifiedByUserId: USER_IDS.desk, idChecked: true });

    const again = await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyFather, true, DAY, desk);
    expect(errCode(again)).toBe('blocked');
    if (!again.ok) expect(again.error.message).toContain('Mark Whitfield');
    expect(state.pickups).toHaveLength(1);
    expect(data(await svc.getDeskPickupView(CHILD_IDS.lily, DAY, desk)).entry.pickup).toMatchObject({ kind: 'Released', adultName: 'Mark Whitfield' });
  });

  test("an adult from another child's list cannot release this child", async () => {
    expect(errCode(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.avaMother, true, DAY, as(USER_IDS.desk)))).toBe('blocked');
  });

  test('a child not checked in cannot be released', async () => {
    expect(errCode(await svc.recordPickup(CHILD_IDS.ava, ADULT_IDS.avaMother, true, DAY, as(USER_IDS.desk)))).toBe('blocked');
  });

  test('only desk can release', async () => {
    for (const id of [USER_IDS.parentLily, USER_IDS.instructorGroup9, USER_IDS.patrol, USER_IDS.admin])
      expect(errCode(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyFather, true, DAY, as(id))), id).toBe('forbidden');
  });
});

test.describe('incidents (S-015 to S-022)', () => {
  const details = { lastSeenAt: '2026-12-12T14:30:00-07:00', lastSeenLocation: 'Top of Pigeon chair', clothingDescription: 'Blue jacket, white helmet', equipmentDescription: 'Green skis', notes: 'Was behind the group' };

  test('assigned instructor reports, desk blocks release, patrol packet is complete and logged', async () => {
    const incident = data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.instructorGroup14)));
    expect(incident.status).toBe('Open');

    const desk = as(USER_IDS.desk);
    data(await svc.checkInChild(CHILD_IDS.owen, DAY, '14', desk));
    const view = data(await svc.getDeskPickupView(CHILD_IDS.owen, DAY, desk));
    expect(view.entry.pickup).toEqual({ kind: 'OpenIncident' });
    expect(JSON.stringify(view)).not.toMatch(/Pigeon|Asthma/);
    expect(errCode(await svc.recordPickup(CHILD_IDS.owen, ADULT_IDS.owenFather, true, DAY, desk))).toBe('blocked');

    const packet = data(await svc.getIncidentPacket(incident.id, as(USER_IDS.patrol)));
    expect(packet.child).toMatchObject({ firstName: 'Owen', otherNames: ['Owen Okafor-Parr', 'Okafor-Parr'], liftPassNumber: 'KK-24-1003', bibNumber: '14', age: 10 });
    expect(packet.group).toEqual({ groupNumber: 14, instructorName: 'Jordan Lee' });
    expect(packet.parentClothingToday).toBe('Red jacket, blue helmet');
    expect(packet.incident.clothingDescription).toBe('Blue jacket, white helmet');
    expect(packet.alerts.map((a) => a.summary)).toEqual(['Condition: Asthma']);
    expect(packet.emergencyContacts.map((c) => c.phone)).toEqual(['604-555-0121', '604-555-0122']);
    expect(packet.escalateAt).toBe(new Date('2026-12-12T15:30:00-07:00').toISOString());
    expect(state.audit.at(-1)).toMatchObject({ action: 'incident_packet_viewed', actorUserId: USER_IDS.patrol, entityId: incident.id });
  });

  test('unassigned instructor cannot report; second open incident is blocked; bad input rejected', async () => {
    expect(errCode(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.instructorGroup9)))).toBe('not_found');
    expect(errCode(await svc.reportMissingChild(CHILD_IDS.owen, DAY, { ...details, lastSeenAt: 'soon', lastSeenLocation: '' }, as(USER_IDS.desk)))).toBe('invalid');
    data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.desk)));
    expect(errCode(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.patrol)))).toBe('blocked');
    expect(errCode(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.parentOwen)))).toBe('forbidden');
  });

  test('only patrol can open the packet (S-020)', async () => {
    const incident = data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.desk)));
    for (const id of [USER_IDS.instructorGroup14, USER_IDS.desk, USER_IDS.parentOwen, USER_IDS.admin])
      expect(await svc.getIncidentPacket(incident.id, as(id)), id).toEqual({ ok: false, error: { code: 'forbidden', message: 'You do not have access to this.' } });
    expect(errCode(await svc.getIncidentPacket('inc_nope', as(USER_IDS.patrol)))).toBe('not_found');
  });

  test('patrol search returns identity only', async () => {
    const results = data(await svc.searchChildren('owen', DAY, as(USER_IDS.patrol)));
    expect(results).toEqual([{ childId: CHILD_IDS.owen, firstName: 'Owen', lastName: 'Parr', age: 10, groupNumber: 14 }]);
    expect(errCode(await svc.searchChildren('owen', DAY, as(USER_IDS.desk)))).toBe('forbidden');
  });

  test('patrol logs actions, Located then Closed; closed is final (S-021, S-017)', async () => {
    const patrol = as(USER_IDS.patrol);
    const { id } = data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.instructorGroup14)));
    expect(errCode(await svc.updateIncident(id, { kind: 'action', type: 'note', note: ' ' }, patrol))).toBe('invalid');
    data(await svc.updateIncident(id, { kind: 'action', type: 'family_contacted', note: 'Called mother' }, patrol));
    data(await svc.updateIncident(id, { kind: 'status', status: 'Located' }, patrol));
    expect(data(await svc.getDeskPickupView(CHILD_IDS.owen, DAY, as(USER_IDS.desk))).entry.pickup).toEqual({ kind: 'IncidentToday' });
    const closed = data(await svc.updateIncident(id, { kind: 'status', status: 'Closed' }, patrol));
    expect(closed.actions.map((a) => a.type)).toEqual(['family_contacted', 'status_change', 'status_change']);
    expect(closed.actions.every((a) => a.staffUserId === USER_IDS.patrol)).toBe(true);
    expect(closed.locatedAt).not.toBeNull();
    expect(closed.resolvedAt).not.toBeNull();
    expect(errCode(await svc.updateIncident(id, { kind: 'status', status: 'Open' }, patrol))).toBe('blocked');
    expect(state.audit.filter((a) => a.action === 'incident_updated')).toHaveLength(3);
    expect(errCode(await svc.updateIncident(id, { kind: 'action', type: 'note', note: 'x' }, as(USER_IDS.desk)))).toBe('forbidden');
  });
});

test.describe('admin (S-024 to S-029)', () => {
  test('completion summary lists only incomplete children with missing fields and no medical values', async () => {
    const rows = data(await svc.getProfileCompletionSummary(as(USER_IDS.admin)));
    expect(rows.map((r) => [r.childId, r.missing])).toEqual([
      [CHILD_IDS.ava, ['emergencyContacts', 'allergies', 'conditions', 'medications', 'consent']],
      [CHILD_IDS.owen, ['consent']],
      [CHILD_IDS.mateo, ['emergencyContacts', 'consent']],
      [CHILD_IDS.ella, ['conditions']],
    ]);
    expect(JSON.stringify(rows)).not.toMatch(/Asthma|diabetes|inhaler/i);
    expect(errCode(await svc.getProfileCompletionSummary(as(USER_IDS.desk)))).toBe('forbidden');
  });

  test('group limit of six holds (S-025)', async () => {
    const admin = as(USER_IDS.admin);
    for (let i = 0; i < 3; i++)
      state.children.push({ ...state.children[0], id: `chd_extra_${i}`, groupId: GROUP_IDS.group9 });
    expect(state.children.filter((c) => c.groupId === GROUP_IDS.group9)).toHaveLength(6);
    expect(errCode(await svc.assignChildToGroup(CHILD_IDS.ava, GROUP_IDS.group9, admin))).toBe('blocked');
    expect(state.children.find((c) => c.id === CHILD_IDS.ava)!.groupId).toBe(GROUP_IDS.group14);
    data(await svc.assignChildToGroup(CHILD_IDS.lily, GROUP_IDS.group14, admin));
    expect(errCode(await svc.assignChildToGroup(CHILD_IDS.lily, GROUP_IDS.group9, as(USER_IDS.instructorGroup9)))).toBe('forbidden');
  });

  test('operations snapshot counts the day (S-026)', async () => {
    const desk = as(USER_IDS.desk);
    await svc.checkInChild(CHILD_IDS.ava, DAY, '3', desk);
    await svc.recordDeniedPickup(CHILD_IDS.lily, 'Mark Whitfield', 'Not listed', DAY, desk);
    await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyFather, true, DAY, desk);
    await svc.reportMissingChild(CHILD_IDS.owen, DAY, { lastSeenAt: '2026-12-12T14:30:00-07:00', lastSeenLocation: 'Pigeon chair', clothingDescription: '', equipmentDescription: '', notes: '' }, desk);
    const snap = data(await svc.getOperationsSnapshot(DAY, as(USER_IDS.admin)));
    expect({ expected: snap.expected, checkedIn: snap.checkedIn, released: snap.released, incidents: snap.openIncidents.length, denied: snap.deniedPickups.length }).toEqual({
      expected: 6,
      checkedIn: 2,
      released: 1,
      incidents: 1,
      denied: 1,
    });
  });

  test('corrections add beside the original pickup (S-027)', async () => {
    const log = data(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyFather, true, DAY, as(USER_IDS.desk)));
    const original = structuredClone(state.pickups[0]);
    const c = data(await svc.addPickupCorrection(log.id, 'Wrong adult tapped', 'Actually released to Dana Whitfield', as(USER_IDS.admin)));
    expect(c).toMatchObject({ pickupLogId: log.id, correctedBy: USER_IDS.admin });
    expect(state.pickups).toEqual([original]);
    expect(errCode(await svc.addPickupCorrection(log.id, '', 'x', as(USER_IDS.admin)))).toBe('invalid');
    expect(errCode(await svc.addPickupCorrection(log.id, 'r', 'x', as(USER_IDS.desk)))).toBe('forbidden');
  });

  test('full details need a logged reason (S-029)', async () => {
    const admin = as(USER_IDS.admin);
    expect(errCode(await svc.openChildDetailsWithReason(CHILD_IDS.ava, '  ', admin))).toBe('invalid');
    const profile = data(await svc.openChildDetailsWithReason(CHILD_IDS.ava, 'Parent called about allergy form', admin));
    expect(profile.child.id).toBe(CHILD_IDS.ava);
    expect(state.audit.at(-1)).toMatchObject({ action: 'admin_viewed_child_details', actorUserId: USER_IDS.admin, entityId: CHILD_IDS.ava, detailsSummary: 'Reason: Parent called about allergy form' });
    expect(errCode(await svc.openChildDetailsWithReason(CHILD_IDS.ava, 'curious', as(USER_IDS.patrol)))).toBe('forbidden');
  });

  test('audit log is admin-only and returns copies', async () => {
    await svc.getChildProfile(CHILD_IDS.lily, as(USER_IDS.parentAva));
    const log = data(await svc.getAuditLog(as(USER_IDS.admin)));
    expect(log).toHaveLength(1);
    log[0].detailsSummary = 'tampered';
    expect(state.audit[0].detailsSummary).not.toBe('tampered');
    expect(errCode(await svc.getAuditLog(as(USER_IDS.desk)))).toBe('forbidden');
  });
});

test.describe('regressions from quality scan', () => {
  test('sharing with police creates exactly one notice task for Hana with the mailing address (S-023)', async () => {
    const patrol = as(USER_IDS.patrol);
    const { id } = data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, { lastSeenAt: '2026-12-12T14:30:00-07:00', lastSeenLocation: 'Pigeon chair', clothingDescription: '', equipmentDescription: '', notes: '' }, as(USER_IDS.desk)));
    data(await svc.updateIncident(id, { kind: 'action', type: 'family_contacted', note: 'Called mother' }, patrol));
    expect(data(await svc.getNoticeTasks(as(USER_IDS.admin)))).toEqual([]);
    data(await svc.updateIncident(id, { kind: 'action', type: 'shared_with_police_or_rescuers', note: 'RCMP given description' }, patrol));
    const tasks = data(await svc.getNoticeTasks(as(USER_IDS.admin)));
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ childId: CHILD_IDS.owen, childName: 'Owen Parr', incidentId: id, mailingAddress: '7 Spruce Court, Pemberton, BC V0N 0A3', createdBy: USER_IDS.patrol, status: 'Open' });
    for (const u of [USER_IDS.patrol, USER_IDS.desk, USER_IDS.parentOwen]) expect(errCode(await svc.getNoticeTasks(as(u))), u).toBe('forbidden');
  });

  test('clothing is saved to the named lesson day, and a day with no lesson is rejected', async () => {
    state.attendance.push({ id: 'att_owen_next', childId: CHILD_IDS.owen, lessonDate: '2026-12-19', status: 'Expected', bibNumber: null, clothingToday: null, checkedInAt: null, checkedInBy: null });
    const parent = as(USER_IDS.parentOwen);
    data(await svc.updateChildProfile(CHILD_IDS.owen, { clothingToday: { lessonDate: DAY, description: 'Green jacket, black helmet' } }, parent));
    expect(state.attendance.find((a) => a.id === 'att_owen')!.clothingToday).toBe('Green jacket, black helmet');
    expect(state.attendance.find((a) => a.id === 'att_owen_next')!.clothingToday).toBeNull();
    expect(data(await svc.getChildProfile(CHILD_IDS.owen, parent)).clothing).toEqual([
      { lessonDate: DAY, description: 'Green jacket, black helmet' },
      { lessonDate: '2026-12-19', description: null },
    ]);
    expect(errCode(await svc.updateChildProfile(CHILD_IDS.owen, { clothingToday: { lessonDate: '2027-01-02', description: 'x' } }, parent))).toBe('invalid');
  });

  test('after a found child is released, the desk still sees that an incident happened today', async () => {
    const desk = as(USER_IDS.desk);
    data(await svc.checkInChild(CHILD_IDS.owen, DAY, '14', desk));
    const { id } = data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, { lastSeenAt: '2026-12-12T14:30:00-07:00', lastSeenLocation: 'Pigeon chair', clothingDescription: '', equipmentDescription: '', notes: '' }, desk));
    data(await svc.updateIncident(id, { kind: 'status', status: 'Located' }, as(USER_IDS.patrol)));
    data(await svc.recordPickup(CHILD_IDS.owen, ADULT_IDS.owenFather, true, DAY, desk));
    expect(data(await svc.getDeskPickupView(CHILD_IDS.owen, DAY, desk)).entry.pickup).toMatchObject({ kind: 'Released', adultName: 'Daniel Parr', incidentToday: true });
    data(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyFather, true, DAY, desk));
    expect(data(await svc.getDeskPickupView(CHILD_IDS.lily, DAY, desk)).entry.pickup).toMatchObject({ kind: 'Released', incidentToday: false });
  });
});
````
