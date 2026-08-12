# AAVISHKAR Launchpad — ATL • APS Dhaula Kuan

Production-ready school innovation platform with **Supabase** backend, separate **student** and **coordinator** portals, and Microsoft auth (coming soon).

## Stack

- React 19 + TanStack Router/Start + Vite + Tailwind
- Supabase PostgreSQL (data), Storage (project files), Realtime (live updates)
- Nitro SSR for deploy

## Setup

See **`supabase/SETUP.md`** — run `schema.sql`, `002_live_data.sql`, and `003_features.sql`, then configure `.env`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ENABLE_DEMO_SEED=true   # optional: seed 10 demo students locally only
```

```powershell
npm install
npm run dev
```

## Portals

- **Student sign-in** → `/app` (people, ideas, projects, recruitment apply, opportunities register)
- **Coordinator sign-in** → `/admin` (dashboard, moderation, CRUD for events/opportunities/recruitment)

Route guards enforce portal separation (real auth replaces this later).

## Not yet implemented

- Microsoft OAuth / per-user identity
- Tight Supabase RLS (requires auth)

---

## Original product spec (reference)

Build a polished frontend for a school innovation and talent platform called AAVISHKAR.

AAVISHKAR is an ATL • APS Dhaula Kuan initiative designed exclusively for students of Army Public School Dhaula Kuan.

Brand

AAVISHKAR
ATL • APSDK
An Army Public School Dhaula Kuan Initiative

Meaning: Aavishkar represents invention, discovery and innovation.

Tagline:
Discover. Collaborate. Create.

Create an original, modern logo/wordmark for AAVISHKAR. Do not copy or imitate official APS/ATL logos.

IMPORTANT — FRONTEND ONLY

This is a visual/product prototype.

Do NOT implement:

Supabase

Database

Backend

Real authentication

Real Microsoft OAuth

Real AI API

Real messaging

Real file uploads

External APIs

Use realistic mock data and local frontend state.

Every major page should be functional enough to demonstrate the user experience: navigation should work, buttons should produce appropriate UI changes, modals should open, filters should work, and mock actions should update the interface.

The architecture should remain clean and component-based so a real backend can be connected later.

DESIGN

Make AAVISHKAR feel like a premium modern school innovation platform, not a traditional school portal.

Style:

Clean

Minimal

Professional

Technology-focused

Student-oriented

Premium

Spacious

Excellent typography

Subtle animations

Smooth transitions

Modern cards

Soft borders

Refined shadows

Light theme

Use a cohesive visual system throughout the entire app.

LOGIN

Create a beautiful landing/login screen.

Logo:

AAVISHKAR

ATL • APSDK

Headline:

Where APSDK builds what's next.

Description:

A school-wide platform for students to discover talent, exchange ideas, build teams and create meaningful projects.

Primary button:

Continue with Microsoft

Small text:

Exclusively for APS Dhaula Kuan

Since this is a prototype, clicking the Microsoft button should enter the demo student experience.

STUDENT APP

Create a persistent sidebar/navigation:

Home

People

Ideas

Projects

Communities

Opportunities

Messages

Notifications

Bottom:

Profile

Settings

Include AAVISHKAR branding in the sidebar.

HOME

Create a personalized dashboard.

Example student:

Sanatvir Singh

Greeting:

Good afternoon, Sanatvir.

Stats:

18 Connections

2 Active Projects

4 Ideas

3 Communities

Sections:

Recommended People

Students whose skills/interests match the user's profile.

Continue Building

Active projects with progress.

Example:

AI Waste Sorter — 67%

Trending Ideas

Popular student ideas.

Upcoming Opportunities

Competitions, workshops and ATL events.

Your Communities

Recently active communities.

The dashboard should feel dynamic and useful.

PEOPLE

Page title:

Discover People

Search:

Search students, skills or interests...

Filters:

Skills

Interests

Class

Availability

Create realistic student cards.

Example:

Shaurya Sharma
Class X-B

Skills:
Robotics · Arduino · Electronics · CAD

Bio:
“Building things that solve real problems.”

Buttons:

View Profile
Connect

Make search/filter interactions work using mock data.

PROFILE

Create a polished student profile.

Example:

Sanatvir Singh

Class X

Bio:
Interested in AI, technology and building products.

Sections:

Skills

Python

AI

Web Development

UI/UX

Interests

Entrepreneurship

Robotics

Technology

Projects

AI Waste Sorter

Student Innovation Portal

Achievements

ATL Project

School Competition

Buttons:

Connect
Message

IDEA HUB

Title:

Idea Hub

Subtitle:

Every great project starts with an idea.

Button:

+ Share an Idea

Categories:

AI
Robotics
Sustainability
Healthcare
Education
Technology
Entrepreneurship

Create realistic idea cards.

Example:

Smart Waste Sorter

Problem:
Mixed waste makes recycling difficult at school.

Solution:
An AI-assisted system that identifies and sorts waste.

Looking for:
Python · Electronics · Robotics

Creator:
Sanatvir Singh

Actions:

View Idea
Join

Include likes/support, comments and collaborator counts.

IDEA DETAILS

Create a detailed idea page containing:

Title

Creator

Problem

Proposed solution

Why it matters

Required skills

Technologies

Interested students

Comments

Buttons:

Join Idea
Message Creator
Turn Into Project

Use mock interactions.

PROJECTS

Create:

My Projects

Project cards:

AI Waste Sorter

4 members
67% complete
Active

Student Productivity Assistant

3 members
34% complete
Active

Button:

+ Create Project

PROJECT WORKSPACE

Create a full collaboration workspace.

Header:

AI Waste Sorter

Status: Active

Team avatars

Tabs:

Overview | Tasks | Files | Updates | Team | Chat

Overview:

Description

Progress

Milestones

Deadline

Tasks:

✓ Research
✓ Problem Definition
→ Hardware Prototype
→ AI Model
○ Testing
○ Presentation

Allow mock task completion using frontend state.

COMMUNITIES

Create communities:

AI & Machine Learning
142 members

Robotics
98 members

Coding
121 members

Design
76 members

Entrepreneurship
64 members

Research
53 members

Each community should have:

Description

Members

Recent activity

Join button

OPPORTUNITIES

Create an opportunity board.

Examples:

ATL Robotics Challenge

Deadline: 28 August

School Innovation Exhibition

Deadline: 4 September

AI Hackathon

Deadline: 12 September

Each card:

Description

Eligibility

Skills

Deadline

Organizer

Button:

View Opportunity

MESSAGES

Create a modern messaging interface.

Left:
Conversation list.

Right:
Chat.

Use realistic mock conversations.

Example:

Sanatvir:
“Want to join the waste sorter project?”

Shaurya:
“Yeah, I can handle the electronics side.”

Include:

Message input

Send button

Unread indicators

Student profiles

Frontend simulation only.

NOTIFICATIONS

Create:

Connection requests

Project invitations

Recruitment updates

Opportunity reminders

Community announcements

Example:

Shaurya accepted your connection request.

You were invited to AI Waste Sorter.

ATL Robotics Challenge closes in 3 days.

ADMIN EXPERIENCE

Create a separate ATL Admin Dashboard.

Admin sidebar:

Dashboard

Students

Talent

Recruitment

Projects

Communities

Opportunities

Events

Reports

AI Assistant

Settings

Make the admin UI more data-focused than the student UI.

ADMIN DASHBOARD

Statistics:

482 Students

21 Active Projects

4 Open Recruitments

38 Pending Applications

14 Communities

7 Opportunities

Add polished charts using mock data.

Include:

Recent Activity

Active Projects

Pending Applications

Upcoming Events

TALENT DISCOVERY

Page:

Find Talent

Search:

Python + Robotics

Show matching students.

Example:

Shaurya Sharma
Robotics · Electronics · Arduino

Sanatvir Singh
AI · Python · Web Development

Aarav Mehta
CAD · 3D Design

Actions:

View Profile
Shortlist

RECRUITMENT

Create:

ATL Robotics Competition Team

Status:
Applications Open

Skills:
Robotics · Python · Electronics · CAD

Applications:
27

Buttons:

View Applications
Shortlist
Close Recruitment

Application cards should allow mock:

Review → Shortlist → Accept / Reject

AI TALENT ASSISTANT

Create a premium AI interface inside the admin dashboard.

Title:

AAVISHKAR Talent Assistant

Prompt box:

Describe the team you need...

Example input:

“Find students for an AI + robotics project.”

Mock AI response:

Recommended Team

Shaurya Sharma
Robotics · Electronics · Arduino

Sanatvir Singh
AI · Python · Web Development

Aarav Mehta
CAD · 3D Design

Ananya Kapoor
Research · Presentation

For each recommendation, show a short reason explaining the match.

Button:

Shortlist Recommended Students

This is a simulated AI interface for now. Do not connect a real AI API.

ADMIN STUDENT DIRECTORY

Create a searchable directory with:

Name
Class
Skills
Projects
Availability
Status

Allow opening a student profile in a modal/drawer.

MODERATION

Create a basic reports interface.

Show:

Reported user/content
Reason
Date
Status

Actions:

Review
Dismiss
Restrict

Use mock data.

SETTINGS

Student:

Profile

Privacy

Notifications

Account

Admin:

Platform settings

Permissions

Moderation

Notifications

RESPONSIVENESS

Make the student experience fully responsive across:

Desktop
Laptop
Tablet
Mobile

Admin dashboard should prioritize desktop/tablet.

INTERACTION REQUIREMENTS

Do not make the prototype a collection of static screenshots.

Implement frontend interactions:

Navigation

Search

Filters

Connect button

Join community

Like/support idea

Create idea modal

Create project modal

Join project

Task completion

Send mock messages

Notifications

Recruitment status

Shortlisting

Accept/reject applications

Modal/drawer profiles

Toast notifications

Use local/mock state only.

FINAL PRODUCT EXPERIENCE

The prototype should communicate this clearly:

For Students

Discover → Connect → Share → Collaborate → Build → Showcase

For ATL

Discover Talent → Recruit → Manage Teams → Manage Projects → Create Opportunities

AAVISHKAR should feel like a real product that APS Dhaula Kuan's ATL could eventually deploy, not merely a school assignment.

Prioritize visual quality, usability, consistency and the student/admin experience over backend implementation.

## Development

Requires Node.js 20+ and npm.

```sh
git clone <repository-url>
cd aavishkar-launchpad
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

### Stack

- React 19 + TypeScript
- TanStack Router & TanStack Start (SSR)
- Tailwind CSS v4 + shadcn/ui
- Vite + Nitro
