# Piezas quality scan packet

Scan code: qs-76346fe06145a91440
Round: 1 of 3
Project folder: C:\Users\raaki\OneDrive\Desktop\piezasathon\softmax-hackathon-team2

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

## The change

This is the first scan: the change is the whole app as it is now.

### file: .nvmrc

````
24
````

### file: README.md

````
# Kestrel Kids Safety — Team 2

Next.js App Router, React, TypeScript and Tailwind CSS. This checkout is a frontend starter; role cards are build placeholders, not working business features. No credentials or account are needed to develop the frontend.

## Quick start

Install Node.js 24 LTS (the version in `.nvmrc`), then from your cloned repository:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Edits reload automatically. Commit `package-lock.json` whenever dependencies change so everyone installs the same versions.

On Windows PowerShell, if script execution is blocked, use `npm.cmd ci` and `npm.cmd run dev` (and `npx.cmd` in place of `npx`). No execution-policy changes are necessary.

## Team layout

- `app/page.tsx`: starter home page. Add role pages in `app/parent`, `app/instructor`, `app/desk`, `app/patrol` and `app/admin` as the team builds them.
- `app/layout.tsx`: shared page shell and metadata.
- `app/globals.css`: Tailwind import and shared styles.
- `components/`: create shared UI components here as needed.
- `lib/`: create frontend helpers and fictional fixtures here as needed.
- `tests/frontend.spec.ts`: independent frontend startup and phone layout check.
- `SPEC.md`: agreed product scope; business features are still to be built.

Use short feature branches and agree on shared components before editing the same files. The `@/` alias points to the repository root.

## Checks

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm run test:frontend
```

The frontend test starts its own server on port 3100. The existing full-app smoke checks also expect backend features that are not implemented in this frontend starter; the focused frontend command does not claim those features work.

## Data and secrets

Use fictional data only. Do not add real child information, browser secrets, a local business database or provider credentials. Future backend work uses Piezas after the design is approved. Keep local secrets in ignored `.env.local`; no environment file is required for this starter. Never commit secrets or put the Piezas key in a public frontend setting.

## Updating your checkout

Pull your team's latest changes, run `npm ci` when the lockfile changes, then `npm run dev`. If port 3000 is busy, use `npm run dev -- --port 3001`.
````

### file: app/globals.css

````
@import "tailwindcss";

:root { color-scheme: light; background: #f4f6f2; color: #173d35; font-family: Arial, Helvetica, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; }
main { max-width: 1180px; margin: auto; padding: 32px 28px; }
header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.brand { font-size: 14px; font-weight: 800; letter-spacing: .12em; }
.badge, .status { border: 1px solid #cad7ce; border-radius: 999px; padding: 8px 12px; font-size: 12px; }
.intro { padding: 84px 0 48px; max-width: 760px; }
.eyebrow { font-size: 11px; letter-spacing: .18em; font-weight: 700; color: #607869; }
h1 { font-size: clamp(38px, 6vw, 70px); line-height: 1.07; letter-spacing: -.045em; margin: 22px 0; font-weight: 700; }
.description { max-width: 550px; font-size: 18px; line-height: 1.6; color: #5c6f67; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
article { padding: 26px; border: 1px solid #dce3dc; background: #fff; border-radius: 14px; }
.number { font-size: 12px; color: #7b8b80; }
h2 { margin: 24px 0 10px; font-size: 23px; font-weight: 700; }
article p { color: #607269; line-height: 1.6; min-height: 54px; font-size: 14px; }
.status { display: inline-block; margin-top: 12px; background: #f3f7ef; }
footer { padding: 36px 0; font-size: 12px; color: #67796d; line-height: 1.7; }
@media (max-width: 760px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 500px) { main { padding: 24px 18px; } .grid { grid-template-columns: 1fr; } .intro { padding-top: 56px; } .badge { font-size: 10px; } }
````

### file: app/layout.tsx

````
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kestrel Kids Safety',
  description: 'Kestrel Kids Safety hackathon workspace',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
````

### file: app/page.tsx

````
const workspaces = [
  ['Parent', 'Child details, emergency contacts and authorized pickup adults.'],
  ['Instructor', 'Assigned groups, safety alerts and missing-child reporting.'],
  ['Desk', 'Check-in, pickup verification and daily attendance.'],
  ['Patrol', 'Emergency information and incident timelines.'],
  ['Admin', 'Missing information, group assignments and daily overview.'],
];

export default function Home() {
  return (
    <main data-testid="frontend-home">
      <header><span className="brand">▲ KESTREL KIDS</span><span className="badge">Frontend starter</span></header>
      <section className="intro">
        <p className="eyebrow">SAFETY STARTS WITH SHARED INFORMATION</p>
        <h1>One team.<br />Every child accounted for.</h1>
        <p className="description">Your hackathon workspace is ready. Build each role’s experience here, starting with fictional demo data.</p>
      </section>
      <section aria-label="Team workspaces" className="grid">
        {workspaces.map(([name, description], index) => (
          <article key={name} data-testid={`workspace-${name.toLowerCase()}`}>
            <span className="number">0{index + 1}</span><h2>{name}</h2><p>{description}</p><span className="status">Ready to build</span>
          </article>
        ))}
      </section>
      <footer>Local design preview · Fictional data only · No sign-in required for frontend development</footer>
    </main>
  );
}
````

### file: package.json

````
{
  "name": "softmax-hackathon-team2",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22.0.0" },
  "type": "module",
  "devDependencies": {
    "@playwright/test": "^1.47.0",
    "@tailwindcss/postcss": "^4.3.5",
    "@types/node": "^26.6.6",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "piezas": "^0.7.7",
    "postcss": "^8.5.32",
    "tailwindcss": "^4.3.5",
    "typescript": "^7.0.2"
  },
  "dependencies": {
    "@piezas/sdk": "^0.5.2",
    "next": "^16.4.5",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test:frontend": "playwright test tests/frontend.spec.ts"
  }
}
````

### file: playwright.config.ts

````
import { defineConfig, devices } from '@playwright/test';

// The Piezas scenario harness. `npx piezas test` runs this suite against a
// SEPARATE test copy of the app (PIEZAS_TEST_API_KEY, from `piezas test --setup`),
// never the live one, and writes .piezas/test-attestation.json — the record
// `npx piezas deploy` requires. The app is started here on its own port with
// the test copy's key. PW_BASE_URL points the suite at an app that is already
// running (previews, clips); `piezas test` ignores it unless
// PIEZAS_TEST_ALLOW_EXTERNAL_SERVER=1, since that app may use the live key.
const port = Number(process.env.PIEZAS_TEST_PORT || 3100);

export default defineConfig({
  testDir: './tests',
  outputDir: './.piezas/test-results/raw',
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.PW_BASE_URL || `http://localhost:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.PW_BASE_URL
    ? undefined
    : {
        command: process.env.PIEZAS_TEST_SERVER_CMD || `npm run dev -- --port ${port}`,
        port,
        reuseExistingServer: false,
        timeout: 120_000,
        env: { PIEZAS_API_KEY: process.env.PIEZAS_TEST_API_KEY ?? '' },
      },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
````

### file: postcss.config.mjs

````
export default { plugins: { '@tailwindcss/postcss': {} } };
````

### file: scripts/seed.ts

````
// Made-up information for the app's checks. Piezas writes this file from the
// data your description lists; edit it freely. Deterministic (fixed names,
// dates and amounts) so a check gives the same result today and next year.
//
// It runs ONLY against the TEST copy of the app (PIEZAS_TEST_API_KEY, made by
// `piezas test --setup`), never the live app, and it is safe to run again:
// each record is created only if it is not there yet. Names and emails are
// invented (example.test addresses never receive mail).
//
// `piezas test` runs it before every check:  npx tsx scripts/seed.ts
import { Piezas } from '@piezas/sdk';

const apiKey = process.env.PIEZAS_TEST_API_KEY;
if (!apiKey) {
  console.error('No test copy of the app yet (PIEZAS_TEST_API_KEY is missing). Run: piezas test --setup');
  process.exit(1);
}
const piezas = new Piezas({ apiKey, apiBaseUrl: process.env.PIEZAS_API_URL });

// upsert creates a record by title only when it does not exist yet. The record
// kinds must be defined by the app (piezas.defineEntities) before this runs.
async function upsert(accessor: string, title: string, data: Record<string, unknown>) {
  const records = (piezas as unknown as Record<string, any>)[accessor];
  if (!records?.list || !records?.create) {
    console.warn(`${accessor}: not defined yet; run the app once (it defines its records), then seed again`);
    return;
  }
  const found = await records.list({ search: title, limit: 10 });
  const items: any[] = Array.isArray(found) ? found : found?.data ?? found?.items ?? found?.records ?? [];
  if (items.some((r) => r?.title === title)) return;
  await records.create({ title, data });
}

// The test sign-in person: created and switched on directly with the test
// copy's key, so sign-up and sign-in checks never wait for an email.
async function testSignInUser() {
  const email = process.env.PIEZAS_TEST_USER_EMAIL;
  const password = process.env.PIEZAS_TEST_USER_PASSWORD;
  if (!email || !password) return;
  let user: any;
  try {
    ({ user } = await piezas.users.signUp({ email, password }));
  } catch {
    const listed: any = await piezas.users.listUsers({ email });
    user = (listed?.users ?? listed?.data ?? [])[0];
  }
  if (user?.id && user.status !== 'active') await piezas.users.updateUser(user.id, { status: 'active' });
}

export async function seed() {
  await testSignInUser();

}

seed().then(
  () => console.log('test information ready'),
  (error) => {
    console.error(error?.message ?? error);
    process.exit(1);
  },
);
````

### file: tests/frontend.spec.ts

````
import { expect, test } from '@playwright/test';

test('the frontend starter renders each team workspace on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Every child accounted for.');
  for (const role of ['Parent', 'Instructor', 'Desk', 'Patrol', 'Admin']) {
    await expect(page.getByRole('heading', { name: role, exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
````

### file: tests/scenarios/README.md

````
# Acceptance scenarios

One file per acceptance scenario in `SPEC.md`, named for the scenario it
proves: `S-001-add-a-contact.spec.ts` (or `S-001.spec.ts`) tests `### S-001`,
and nothing else. `npx piezas test` creates a failing placeholder for every
scenario that has no file yet; replace its body, and keep its first line
(`// piezas-scenario: S-001 v=...`): it records which wording of the scenario the
test was written for, so a changed scenario reads as "out of date", not broken.

Write each test from the scenario's own Given/When/Then: the Given is the data
(`scripts/seed.ts` puts made-up records into the TEST copy of the app), the
When is the interaction (`page.goto`, then click / fill / ...), the Then is a
check on what is visible (`await expect(page.getByTestId('...')).toBeVisible()`).

`npx piezas test` rejects a test that never opens the app, never does what the
When line says, checks nothing visible, has a check that is always true, is
skipped (`test.skip` / `.only` / `.fixme`), swallows failures, or fakes Piezas
(intercepting its requests, mocking the SDK). Such a test counts as not written.

Once a test passes, its checks are recorded. Removing or loosening one later
needs the owner's OK (`npx piezas test` reports "changed checks").

**Select by `data-testid`.** Text and CSS selectors break on the next redesign;
a test id survives copy changes, restyling and layout moves. Add `data-testid`
to the elements a scenario drives, name it for the thing
(`data-testid="cancel-booking"`), and select it with
`page.getByTestId('cancel-booking')`. `npx piezas doctor` counts the interactive
elements that still have none (PZ026).
````

### file: tests/smoke.spec.ts

````
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// The one test every app has. A red smoke test means nothing below it is worth
// reading: the page either renders or it does not.
test('the home page renders with a clean console', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  const response = await page.goto('/');

  expect(response?.ok(), `GET / returned ${response?.status()}`).toBeTruthy();
  await expect(page.locator('body')).not.toBeEmpty();
  expect(errors, `console errors on /:\n${errors.join('\n')}`).toEqual([]);
});

// The Report a problem button is how the people trying the app tell the owner
// what went wrong, so it has to be there on the very first screen, before
// anyone signs in. Not checked when the owner turned it off or chose to go
// live without it (their decision), or for a static site (no server to save
// reports, so no button).
function readText(file: string): string | null {
  try {
    return readFileSync(file, 'utf-8');
  } catch {
    return null;
  }
}

function reportButtonSkip(): string | null {
  const ownerChoice = 'The owner chose to go live without the Report a problem button, so it is not checked.';
  if (process.env.PIEZAS_REPORT_BUTTON_CHECK === 'off') return ownerChoice;
  if (process.env.PIEZAS_REPORT_BUTTON === 'off') return 'The Report a problem button is turned off for this app, so it is not checked.';
  let manifest: { deploymentMode?: string; reportButton?: boolean } = {};
  try {
    manifest = JSON.parse(readText('piezas.manifest.json') ?? '{}');
  } catch {
    // no readable manifest: treat the app as a server app
  }
  if (manifest.reportButton === false) return ownerChoice;
  // The local setting, in the order the dev server reads it.
  for (const file of ['.env.development.local', '.env.local', '.env.development', '.env']) {
    const m = /^\s*(?:export\s+)?PIEZAS_REPORT_BUTTON\s*=\s*["']?(\w+)/m.exec(readText(file) ?? '');
    if (m) {
      if (m[1].toLowerCase() === 'off') return 'The Report a problem button is turned off for this app, so it is not checked.';
      break;
    }
  }
  let mode = manifest.deploymentMode;
  if (!mode) {
    // A Next.js app exported as plain pages (output: 'export') is a static site.
    const config = ['next.config.ts', 'next.config.mjs', 'next.config.js', 'next.config.cjs'].map(readText).find((t) => t !== null);
    if (config && /\boutput\s*:\s*['"]export['"]/.test(config)) mode = 'static';
  }
  if (mode === 'static') return 'Static sites have no server to save reports, so there is no button to check.';
  return null;
}

test('the Report a problem button is on the first screen, before sign-in', async ({ page }) => {
  const skip = reportButtonSkip();
  test.skip(skip !== null, skip ?? '');

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Report a problem' })).toBeVisible();
});
````

### file: tsconfig.json

````
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
````

## Also in the change, not shown above (open them yourself when they matter)

- package-lock.json (file)
