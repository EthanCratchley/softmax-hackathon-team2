# Piezas quality scan packet

Scan code: qs-5f6e94332fad387b7d
Round: 2 of 3
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

## Problems from the previous scan: check each one again

1. [high] The app currently shows only starter cards, so parents and staff cannot perform any of the approved child safety journeys yet. (app/page.tsx)
2. [medium] None of the 41 approved child safety checks are implemented, and no full app test run has been recorded. (tests/scenarios/README.md)
3. [medium] People cannot report a problem from the first screen, so the existing check for that button will fail. (app/page.tsx)

## The change

Changed since the last scan (2026-11-07T22:33:04.659Z): 18 file(s) added or changed, 0 removed.

### added: app/instructor/page.tsx

````
'use client';
import Link from 'next/link';
import { useState } from 'react';
import Shell from '@/components/instructor-patrol/shell';
import s from '@/components/instructor-patrol/workspace.module.css';
import { age, children, confirmHeadcount, groups, instructorId, lessonActive, lessonDay, nextHeadcount, usePreview } from '@/lib/instructor-patrol/preview';

export default function Instructor() {
  const [day, setDay] = useState(lessonDay);
  const [time, setTime] = useState('10:00');
  const data = usePreview();
  const assigned = groups.filter(g => g.instructorId === instructorId && g.day === day);
  return <Shell title="Your group. Every child.">
    <p className={s.muted}>Alex Morgan · Instructor · Only your assigned groups and need-to-know safety information.</p>
    <div className={s.grid}><label>Lesson day<input data-testid="lesson-day" type="date" value={day} onChange={e => setDay(e.target.value)} /></label><label>Preview lesson time<input data-testid="lesson-time" type="time" value={time} onChange={e => setTime(e.target.value)} /></label></div>
    {!assigned.length && <p data-testid="empty-roster">No assigned groups for this lesson day.</p>}
    {assigned.map(group => {
      const roster = children.filter(c => c.groupId === group.id);
      const confirmed = data.headcounts[group.id];
      const due = confirmed ? nextHeadcount(confirmed) : '10:00';
      return <section key={group.id} aria-label={`Group ${group.number}`}>
        <h2>Group {group.number} · {group.level} · {roster.length} children</h2>
        {lessonActive(time) ? <div className={s.banner} data-testid="headcount-panel"><strong>{time >= due ? 'Headcount due' : `Next headcount at ${due}`}</strong><p>Check every child is with the group.</p><div className={s.row}><button data-testid="all-here" disabled={time < due} onClick={() => confirmHeadcount(group.id, time)}>All {roster.length} here</button><a href="#roster" data-testid="someone-missing">Someone is missing</a></div>{confirmed && <p role="status" data-testid="headcount-confirmed">All {roster.length} accounted for at {confirmed}. Next prompt at {due}.</p>}</div> : <p data-testid="headcount-paused">Headcounts paused outside lesson time, including lunch from 11:45 to 12:45.</p>}
        <div className={s.grid} id="roster">{roster.map(child => <article className={s.card} data-testid={`child-${child.id}`} key={child.id}><h3>{child.name}</h3><p>Age {age(child, day)} · {child.level} · Bib {child.bib}</p>{child.alert && <div className={s.alert} data-testid={`alert-${child.id}`}><strong>{child.alert}</strong><p>{child.medication}</p><p>{child.instructions}</p></div>}<Link data-testid={`report-${child.id}`} href={`/instructor/report-missing/${child.id}`}>Report missing</Link></article>)}</div>
      </section>;
    })}
  </Shell>;
}
````

### added: app/instructor/report-missing/[childId]/page.tsx

````
'use client';
import { use } from 'react';
import Shell from '@/components/instructor-patrol/shell';
import ReportForm from '@/components/instructor-patrol/report-form';
import { children, groups, instructorId } from '@/lib/instructor-patrol/preview';

export default function MissingPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = use(params);
  const child = children.find(c => c.id === childId && groups.some(g => g.id === c.groupId && g.instructorId === instructorId));
  return <Shell title={child ? `Report missing: ${child.name}` : 'Child not found'}>{child ? <ReportForm child={child} /> : <p data-testid="child-not-found">This child is not in your assigned preview group.</p>}</Shell>;
}
````

### added: app/patrol/incidents/[id]/page.tsx

````
'use client';
import { use, useState } from 'react';
import Shell from '@/components/instructor-patrol/shell';
import s from '@/components/instructor-patrol/workspace.module.css';
import { addAction, age, children, escalation, groups, lessonDay, usePreview, type Incident } from '@/lib/instructor-patrol/preview';

export default function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = usePreview();
  const incident = data.incidents.find(i => i.id === id);
  const child = children.find(c => c.id === incident?.childId);
  const [type, setType] = useState('Search update');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');
  if (!incident || !child) return <Shell title="Incident not found"><p data-testid="incident-not-found">No emergency packet is available for this incident.</p></Shell>;
  const group = groups.find(g => g.id === child.groupId)!;
  function changeStatus(status: Incident['status']) { addAction(id, `Status changed to ${status}`, '', status); setFeedback(`Incident marked ${status}.`); }
  return <Shell title={`${child.name} · Emergency packet`}>
    <p className={s.muted}>Fictional patrol view. Packet access logging will be connected with secure sign-in.</p>
    <div className={s.alert} data-testid="escalation"><span className={s.pill}>{incident.status}</span><h2>Escalate by {escalation(incident.lastSeenAt)} on {incident.lastSeenAt.slice(0, 10)}</h2><p>Earlier of 60 minutes after last seen or 16:00, resort local time. Follow patrol procedure; make calls yourself.</p></div>
    <div className={s.grid}>
      <section className={s.card}><h2>Child and group</h2><dl><dt>Name</dt><dd>{child.name}</dd><dt>Other names</dt><dd>{child.otherNames || 'None recorded'}</dd><dt>Age / level</dt><dd>{age(child, lessonDay)} · {child.level}</dd><dt>Group</dt><dd>Group {group.number}</dd><dt>Instructor</dt><dd>{group.instructor}</dd><dt>Lift pass</dt><dd>{child.pass || 'Not recorded'}</dd><dt>Bib</dt><dd>{child.bib || 'Not recorded'}</dd></dl></section>
      <section className={s.card}><h2>Last seen</h2><dl><dt>Date and time</dt><dd>{incident.lastSeenAt.replace('T', ' ')}</dd><dt>Place</dt><dd>{incident.place}</dd><dt>Reported by</dt><dd>{incident.reportedBy}</dd><dt>Equipment</dt><dd>{incident.equipment}</dd><dt>Notes</dt><dd>{incident.notes || 'None recorded'}</dd></dl></section>
      <section className={s.card} data-testid="clothing-comparison"><h2>Clothing descriptions</h2><h3>Reported by instructor / radio</h3><p>{incident.clothing} · {incident.helmet}</p><h3>Parent-given for today</h3><p>{child.jacket} · {child.helmet}</p><p className={s.muted}>Descriptions may differ. Confirm by radio; do not assume either is correct.</p></section>
      <section className={s.card}><h2>Safety information</h2>{child.alert ? <div className={s.alert}><strong>{child.alert}</strong><p>{child.medication}</p><p>{child.instructions}</p></div> : <p>No safety alert recorded. This does not confirm there are no medical needs.</p>}<h3>Emergency contacts</h3>{child.contacts.map(contact => <div key={contact.phone}><p><strong>{contact.name}</strong> · {contact.relationship}</p><a data-testid={`contact-${contact.phone}`} href={`tel:${contact.phone}`}>{contact.phone}</a></div>)}</section>
    </div>
    <section className={s.card}><h2>Incident status</h2><div className={s.row}>{(['Open', 'Located', 'Closed'] as const).map(status => <button key={status} data-testid={`status-${status.toLowerCase()}`} disabled={incident.status === status} onClick={() => changeStatus(status)}>Mark {status}</button>)}</div>{incident.locatedAt && <p>Located at {incident.locatedAt}</p>}</section>
    <div className={s.grid}><section className={s.card}><h2>Record an action</h2><form onSubmit={e => { e.preventDefault(); if (!note.trim()) return; addAction(id, type, note.trim()); setNote(''); setFeedback('Action added to the preview timeline.'); }}><label>Action<select data-testid="action-type" value={type} onChange={e => setType(e.target.value)}><option>Search update</option><option>Family contacted</option><option>Shared with police or rescuers</option></select></label><label>What happened<textarea data-testid="action-note" required maxLength={2000} value={note} onChange={e => setNote(e.target.value)} /></label><button data-testid="add-action">Add timed action</button></form>{feedback && <p role="status" data-testid="action-feedback">{feedback}</p>}{data.noticeTasks.includes(id) && <p className={s.banner} data-testid="notice-task">Preview follow-up: Hana must mail the family notice. The real task will be created when services are connected; the mailing address stays out of patrol views.</p>}</section>
    <section className={s.card}><h2>Incident timeline</h2><ol data-testid="incident-timeline">{incident.actions.map((action, index) => <li key={index}><strong>{action.type}</strong><p>{action.note}</p><small>{action.staff} · {action.at}</small></li>)}</ol></section></div>
  </Shell>;
}
````

### added: app/patrol/page.tsx

````
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/instructor-patrol/shell';
import ReportForm from '@/components/instructor-patrol/report-form';
import s from '@/components/instructor-patrol/workspace.module.css';
import { age, children, escalation, groups, lessonDay, usePreview } from '@/lib/instructor-patrol/preview';

export default function Patrol() {
  const data = usePreview();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const active = data.incidents.filter(i => i.status === 'Open');
  const child = children.find(c => c.id === selected);
  return <Shell title="Patrol command">
    <p className={s.muted}>Casey Brooks · Ski patrol · Work from the radio. Record each action.</p>
    <h2>Open incidents · {active.length}</h2>
    {!active.length && <p data-testid="no-open-incidents">No open incidents.</p>}
    <div className={s.grid}>{active.map(incident => { const c = children.find(c => c.id === incident.childId)!; return <article className={s.card} data-testid={`incident-${incident.id}`} key={incident.id}><span className={s.pill}>{incident.status}</span><h2>{c.name}</h2><p>Last seen {incident.lastSeenAt.slice(11, 16)} · {incident.place}</p><p><strong>Escalate by {escalation(incident.lastSeenAt)}</strong></p><Link data-testid={`open-${incident.id}`} href={`/patrol/incidents/${incident.id}`}>Open emergency packet</Link></article>; })}</div>
    <section className={s.card}><h2>Report received by radio?</h2><p>Find the child, then open an incident. Search results show only name, age and group.</p><label>Find a child by any name<input type="search" data-testid="child-search" value={search} onChange={e => { setSearch(e.target.value); setSelected(''); }} /></label>
    {search.trim() && <div data-testid="search-results">{children.filter(c => `${c.name} ${c.otherNames}`.toLowerCase().includes(search.trim().toLowerCase())).map(c => <div className={s.row} key={c.id}><p>{c.name}{c.otherNames ? ` (also ${c.otherNames})` : ''} · Age {age(c, lessonDay)} · Group {groups.find(g => g.id === c.groupId)?.number}</p><button data-testid={`select-${c.id}`} onClick={() => setSelected(c.id)}>Select {c.name}</button></div>)}{!children.some(c => `${c.name} ${c.otherNames}`.toLowerCase().includes(search.trim().toLowerCase())) && <p>No matching children.</p>}</div>}
    </section>
    {child && <section className={s.card}><h2>Radio report: {child.name}</h2><ReportForm child={child} patrol /></section>}
    {data.incidents.some(i => i.status !== 'Open') && <section className={s.card}><h2>Located and closed</h2>{data.incidents.filter(i => i.status !== 'Open').map(i => <p key={i.id}><Link data-testid={`history-${i.id}`} href={`/patrol/incidents/${i.id}`}>{children.find(c => c.id === i.childId)?.name} · {i.status}</Link></p>)}</section>}
  </Shell>;
}
````

### added: components/instructor-patrol/report-form.tsx

````
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Child, createIncident, lessonDay, usePreview } from '@/lib/instructor-patrol/preview';
import s from './workspace.module.css';

export default function ReportForm({ child, patrol = false }: { child: Child; patrol?: boolean }) {
  const router = useRouter();
  const data = usePreview();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const existing = data.incidents.find(i => i.childId === child.id && i.status !== 'Closed');
  if (sent) return <div className={s.banner} role="status" data-testid="report-success"><h2>Missing report recorded in this preview</h2><p>Radio patrol and follow resort procedure. No family or responder has been contacted automatically.</p><Link href="/instructor" data-testid="back-roster">Return to roster</Link></div>;
  if (existing) return <div className={s.banner} data-testid="existing-incident"><h2>An incident is already active for {child.name}</h2><p>Radio patrol with any new information. A second report will not be opened.</p>{patrol && <Link href={`/patrol/incidents/${existing.id}`}>Open incident</Link>}</div>;
  return <form data-testid="missing-form" className={s.card} onSubmit={e => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const read = (key: string) => String(form.get(key) ?? '').trim();
    if (!read('place') || !read('clothing') || !read('helmet') || !read('equipment')) { setError('Enter the last-seen place, clothing, helmet and equipment. Use “unknown” if needed.'); return; }
    const id = createIncident({ childId: child.id, reportedBy: patrol ? 'Casey Brooks · Patrol' : 'Alex Morgan', lastSeenAt: read('lastSeenAt'), place: read('place'), clothing: read('clothing'), helmet: read('helmet'), equipment: read('equipment'), notes: read('notes') });
    if (patrol) router.push(`/patrol/incidents/${id}`); else setSent(true);
  }}>
    <h2>Last seen details</h2><p>Report what was observed. Use “unknown” rather than guessing.</p>
    <label>Last seen date and time<input data-testid="last-seen" required name="lastSeenAt" type="datetime-local" defaultValue={`${lessonDay}T10:00`} /></label>
    <label>Last seen place<input data-testid="last-place" required name="place" maxLength={300} /></label>
    <label>Reported clothing<input data-testid="reported-clothing" required name="clothing" maxLength={300} /></label>
    <label>Reported helmet<input data-testid="reported-helmet" required name="helmet" maxLength={200} /></label>
    <label>Equipment<input data-testid="equipment" required name="equipment" maxLength={300} /></label>
    <label>Notes<textarea data-testid="report-notes" name="notes" maxLength={2000} /></label>
    {error && <p role="alert">{error}</p>}<button data-testid="submit-report" type="submit">Open missing-child incident</button>
  </form>;
}
````

### added: components/instructor-patrol/shell.tsx

````
import Link from 'next/link';
import styles from './workspace.module.css';

export default function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className={styles.workspace} data-testid="safety-workspace">
    <header><span className="brand">▲ KESTREL KIDS</span><span className={styles.pill}>Design preview</span></header>
    <div className={styles.banner}>Fictional data only. Changes last while you browse here and reset on reload. Sign-in and secure saving are not connected.</div>
    <nav aria-label="Design previews"><Link data-testid="instructor-nav" href="/instructor">Instructor preview</Link><Link data-testid="patrol-nav" href="/patrol">Patrol preview</Link></nav>
    <h1>{title}</h1>{children}
    <footer>Use radios and resort procedures if there is no signal. People contact families and responders; this preview sends no messages.</footer>
  </main>;
}
````

### added: components/instructor-patrol/workspace.module.css

````
.workspace { color: #173d35; font-size: 16px; }
.workspace h1 { font-size: clamp(30px, 5vw, 48px); margin: 28px 0 12px; }
.workspace h2 { font-size: 23px; margin: 0 0 16px; }
.workspace h3 { font-size: 18px; margin: 0 0 8px; }
.workspace p { line-height: 1.6; min-height: 0; margin: 8px 0; }
.workspace nav { display: flex; flex-wrap: wrap; gap: 12px; }
.workspace a, .workspace button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 12px 18px; border-radius: 10px; font-size: 16px; font-weight: 700; text-decoration: none; cursor: pointer; }
.workspace a { color: #173d35; background: #e6eee8; }
.workspace button { background: #173d35; color: white; border: 1px solid #173d35; }
.workspace button:disabled { opacity: .55; cursor: default; }
.workspace :focus-visible { outline: 3px solid #b56c10; outline-offset: 4px; }
.workspace label { display: grid; gap: 8px; font-weight: 700; margin: 16px 0; }
.workspace input, .workspace select, .workspace textarea { width: 100%; min-width: 0; min-height: 48px; border: 1px solid #8b9f95; background: white; border-radius: 8px; padding: 12px; color: #173d35; font: inherit; }
.workspace textarea { min-height: 100px; }
.banner { padding: 14px 18px; background: #fff1cc; border: 1px solid #e8d396; border-radius: 10px; margin: 18px 0; }
.muted { color: #53685f; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin: 24px 0; }
.card { background: white; padding: 24px; border: 1px solid #d6dfd8; border-radius: 14px; min-width: 0; overflow-wrap: anywhere; }
.alert { background: #fff0e9; border-left: 5px solid #ba3d23; border-radius: 8px; padding: 16px; margin: 16px 0; }
.row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-top: 16px; }
.pill { display: inline-block; padding: 6px 12px; background: #fce1d8; color: #8b281b; border-radius: 30px; font-weight: 700; font-size: 14px; }
.workspace dl { display: grid; grid-template-columns: minmax(100px, 1fr) 2fr; gap: 10px; margin: 0; }
.workspace dt { color: #53685f; }
.workspace dd { margin: 0; overflow-wrap: anywhere; }
.workspace ol { padding-left: 22px; }
.workspace li { padding: 8px 0; }
@media (max-width: 650px) { .grid { grid-template-columns: 1fr; } .card { padding: 18px; } .workspace nav a { flex: 1; } .workspace dl { grid-template-columns: 1fr; gap: 6px; } .workspace dd { margin-bottom: 10px; } }
````

### added: lib/instructor-patrol/preview.ts

````
'use client';

import { useSyncExternalStore } from 'react';

// Fictional, temporary design data. Not an authorization or persistence layer.
export const lessonDay = '2026-12-12';
export const instructorId = 'staff-instructor-1';
export const groups = [
  { id: 'group-1', day: lessonDay, level: 'Level 2', instructorId, instructor: 'Alex Morgan', number: 3 },
  { id: 'group-2', day: lessonDay, level: 'Level 1', instructorId: 'staff-instructor-2', instructor: 'Sam Lee', number: 5 },
];
export const children = [
  { id: 'child-ava', name: 'Ava Chen', otherNames: '', birthDate: '2018-03-20', groupId: 'group-1', level: 'Level 2', pass: 'KK-1042', bib: '12', jacket: 'Yellow jacket', helmet: 'Black helmet', alert: 'Tree-nut allergy', medication: 'EpiPen at Kestrel Kids Ski School Desk', instructions: 'Follow the emergency plan and radio patrol immediately if symptoms appear.', contacts: [{ name: 'Jamie Chen', relationship: 'Parent', phone: '604-555-0101' }, { name: 'Robin Chen', relationship: 'Parent', phone: '604-555-0102' }] },
  { id: 'child-owen', name: 'Owen Parr', otherNames: 'Owen Okafor-Parr', birthDate: '2017-07-14', groupId: 'group-1', level: 'Level 2', pass: 'KK-1088', bib: '14', jacket: 'Red jacket', helmet: 'Blue helmet', alert: '', medication: '', instructions: '', contacts: [{ name: 'Grace Okafor', relationship: 'Mother', phone: '604-555-0103' }, { name: 'Daniel Parr', relationship: 'Father', phone: '604-555-0104' }] },
  { id: 'child-lily', name: 'Lily Whitfield', otherNames: '', birthDate: '2019-04-06', groupId: 'group-2', level: 'Level 1', pass: 'KK-1102', bib: '21', jacket: 'Purple jacket', helmet: 'White helmet', alert: '', medication: '', instructions: '', contacts: [{ name: 'Taylor Whitfield', relationship: 'Parent', phone: '604-555-0105' }, { name: 'Jordan Whitfield', relationship: 'Parent', phone: '604-555-0106' }] },
];
export type Child = typeof children[number];
export type Incident = { id: string; childId: string; reportedBy: string; lastSeenAt: string; place: string; clothing: string; helmet: string; equipment: string; notes: string; status: 'Open' | 'Located' | 'Closed'; locatedAt?: string; actions: { type: string; note: string; staff: string; at: string }[] };
const initial: { incidents: Incident[]; headcounts: Record<string, string>; noticeTasks: string[] } = {
  incidents: [{ id: 'incident-owen', childId: 'child-owen', reportedBy: 'Alex Morgan', lastSeenAt: `${lessonDay}T14:30:00`, place: 'Top of the Pigeon chair', clothing: 'Blue jacket', helmet: 'White helmet', equipment: 'Skis and poles', notes: 'Separated while the group regrouped by the trail sign.', status: 'Open', actions: [{ type: 'Missing report opened', note: 'Radio patrol and follow resort procedure.', staff: 'Alex Morgan', at: '14:40' }] }], headcounts: {}, noticeTasks: [],
};
let state = initial;
const listeners = new Set<() => void>();
export function usePreview() { return useSyncExternalStore((fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => state, () => initial); }
function update(next: typeof state) { state = next; listeners.forEach(fn => fn()); }
export function age(child: Child, day: string) { const birth = child.birthDate; return Number(day.slice(0, 4)) - Number(birth.slice(0, 4)) - (day.slice(5) < birth.slice(5) ? 1 : 0); }
export function escalation(lastSeen: string) { const minutes = Number(lastSeen.slice(11, 13)) * 60 + Number(lastSeen.slice(14, 16)); const limit = Math.min(minutes + 60, 16 * 60); return `${String(Math.floor(limit / 60)).padStart(2, '0')}:${String(limit % 60).padStart(2, '0')}`; }
export function lessonActive(time: string) { return (time >= '09:30' && time < '11:45') || (time >= '12:45' && time < '15:30'); }
export function confirmHeadcount(groupId: string, time: string) { update({ ...state, headcounts: { ...state.headcounts, [groupId]: time } }); }
export function nextHeadcount(time: string) { const total = Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) + 30; const result = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`; return result >= '11:45' && result < '12:45' ? '12:45' : result; }
export function createIncident(input: Omit<Incident, 'id' | 'status' | 'actions'>) {
  const existing = state.incidents.find(i => i.childId === input.childId && i.status !== 'Closed');
  if (existing) return existing.id;
  const id = `incident-${crypto.randomUUID()}`;
  update({ ...state, incidents: [...state.incidents, { ...input, id, status: 'Open', actions: [{ type: 'Missing report opened', note: input.notes, staff: input.reportedBy, at: 'Preview time' }] }] });
  return id;
}
export function addAction(id: string, type: string, note: string, status?: Incident['status']) {
  const now = new Date();
  update({ ...state, noticeTasks: type === 'Shared with police or rescuers' && !state.noticeTasks.includes(id) ? [...state.noticeTasks, id] : state.noticeTasks, incidents: state.incidents.map(i => i.id === id ? { ...i, status: status ?? i.status, locatedAt: status === 'Located' ? now.toISOString() : i.locatedAt, actions: [...i.actions, { type, note, staff: 'Casey Brooks · Patrol', at: now.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) }] } : i) });
}
````

### added: playwright.preview.config.ts

````
import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Frontend-only checks; does not claim server authorization or Piezas coverage.
// PW_BROWSER_CHANNEL=chrome can use an installed browser on constrained machines.
export default defineConfig({
  ...base,
  testMatch: ['**/frontend.spec.ts', '**/instructor-patrol.preview.spec.ts'],
  projects: [{ name: 'preview-chromium', use: { browserName: 'chromium', channel: process.env.PW_BROWSER_CHANNEL } }],
});
````

### added: tests/instructor-patrol.preview.spec.ts

````
import { expect, test } from '@playwright/test';

test('instructor preview limits the roster and fits a gloved phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/instructor');
  await expect(page.getByTestId('child-child-ava')).toBeVisible();
  await expect(page.getByTestId('alert-child-ava')).toContainText('Tree-nut allergy');
  await expect(page.getByTestId('alert-child-ava')).toContainText('EpiPen at Kestrel Kids Ski School Desk');
  await expect(page.getByTestId('child-child-lily')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const control of await page.getByTestId('safety-workspace').locator('a, button, input').all()) {
    const bounds = await control.boundingBox();
    expect(bounds?.height).toBeGreaterThanOrEqual(48);
  }
  await page.getByTestId('report-child-ava').click();
  await expect(page.getByTestId('missing-form')).toBeVisible();
});

test('unassigned and unknown children have no report form', async ({ page }) => {
  for (const id of ['child-lily', 'unknown']) {
    await page.goto(`/instructor/report-missing/${id}`);
    await expect(page.getByTestId('child-not-found')).toBeVisible();
    await expect(page.getByTestId('missing-form')).toHaveCount(0);
  }
});

test('headcount confirmation schedules the next prompt and pauses at lunch', async ({ page }) => {
  await page.goto('/instructor');
  await page.getByTestId('all-here').click();
  await expect(page.getByTestId('headcount-confirmed')).toContainText('Next prompt at 10:30');
  await expect(page.getByTestId('all-here')).toBeDisabled();
  await page.getByTestId('lesson-time').fill('11:45');
  await expect(page.getByTestId('headcount-paused')).toBeVisible();
  await expect(page.getByTestId('headcount-panel')).toHaveCount(0);
  await page.getByTestId('lesson-time').fill('12:45');
  await page.getByTestId('someone-missing').click();
  await page.getByTestId('report-child-ava').click();
  await expect(page.getByTestId('missing-form')).toBeVisible();
});

test('a missing report appears in patrol while browsing and duplicates are blocked', async ({ page }) => {
  await page.goto('/instructor/report-missing/child-ava');
  await page.getByTestId('last-seen').fill('2026-12-12T15:30');
  await page.getByTestId('last-place').fill('Learning area');
  await page.getByTestId('reported-clothing').fill('Yellow jacket');
  await page.getByTestId('reported-helmet').fill('Black helmet');
  await page.getByTestId('equipment').fill('Skis');
  await page.getByTestId('report-notes').fill('Reported over the radio.');
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('report-success')).toBeVisible();
  await page.getByTestId('patrol-nav').click();
  const incident = page.locator('article').filter({ hasText: 'Ava Chen' });
  await expect(incident).toContainText('Escalate by 16:00');
  await incident.getByRole('link').click();
  await expect(page.getByTestId('escalation')).toContainText('16:00');
  await page.getByTestId('instructor-nav').click();
  await page.getByTestId('report-child-ava').click();
  await expect(page.getByTestId('existing-incident')).toBeVisible();
});

test('patrol sees both clothing descriptions, contacts and a timed action history', async ({ page }) => {
  await page.goto('/patrol/incidents/incident-owen');
  await expect(page.getByTestId('clothing-comparison')).toContainText('Blue jacket · White helmet');
  await expect(page.getByTestId('clothing-comparison')).toContainText('Red jacket · Blue helmet');
  await expect(page.getByTestId('escalation')).toContainText('15:30');
  await expect(page.getByTestId('contact-604-555-0103')).toHaveAttribute('href', 'tel:604-555-0103');
  await page.getByTestId('action-type').selectOption('Family contacted');
  await page.getByTestId('action-note').fill('Called both contacts by radio procedure.');
  await page.getByTestId('add-action').click();
  await expect(page.getByTestId('incident-timeline')).toContainText('Family contacted');
  await page.getByTestId('action-type').selectOption('Shared with police or rescuers');
  await page.getByTestId('action-note').fill('Information shared by the patroller.');
  await page.getByTestId('add-action').click();
  await expect(page.getByTestId('notice-task')).toBeVisible();
  await page.getByTestId('status-located').click();
  await expect(page.getByTestId('incident-timeline')).toContainText('Status changed to Located');
  await page.getByTestId('status-closed').click();
  await expect(page.getByTestId('incident-timeline')).toContainText('Status changed to Closed');
  await page.getByTestId('patrol-nav').click();
  await expect(page.getByTestId('no-open-incidents')).toBeVisible();
  await expect(page.getByTestId('history-incident-owen')).toContainText('Closed');
});

test('radio search exposes minimal details and can open an incident', async ({ page }) => {
  await page.goto('/patrol');
  await page.getByTestId('child-search').fill('Lily');
  const results = page.getByTestId('search-results');
  await expect(results).toContainText('Lily Whitfield');
  await expect(results).not.toContainText('604-');
  await expect(results).not.toContainText('Purple jacket');
  await page.getByTestId('select-child-lily').click();
  await page.getByTestId('last-place').fill('Base lodge');
  await page.getByTestId('reported-clothing').fill('Unknown');
  await page.getByTestId('reported-helmet').fill('Unknown');
  await page.getByTestId('equipment').fill('Unknown');
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('incident-timeline')).toContainText('Missing report opened');
  await expect(page.getByTestId('incident-timeline')).toContainText('Casey Brooks');
});

test('unknown incident and empty lesson day are clear', async ({ page }) => {
  await page.goto('/patrol/incidents/not-a-real-incident');
  await expect(page.getByTestId('incident-not-found')).toBeVisible();
  await page.getByTestId('instructor-nav').click();
  await page.getByTestId('lesson-day').fill('2026-12-13');
  await expect(page.getByTestId('empty-roster')).toBeVisible();
});
````

### changed: .nvmrc

````
24
````

### changed: README.md

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

### changed: app/globals.css

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

### changed: app/layout.tsx

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

### changed: app/page.tsx

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

### changed: postcss.config.mjs

````
export default { plugins: { '@tailwindcss/postcss': {} } };
````

### changed: tests/frontend.spec.ts

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

### changed: tsconfig.json

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
