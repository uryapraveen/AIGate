GATE Planner — Agentic GATE Prep Assistant

A personal study-tracking tool being built to log GATE 2027 practice performance by subject and topic, with a planned AI layer (Google Gemini API) that will analyze weak areas and generate targeted practice questions based on real performance data.

Project Status: Phase 1 (In Progress)

This project is being built in phases:


✅ Phase 1 — Data entry UI: A form to log Subject, Topic, Score, Total Questions, and Date for each practice session. (Current phase — frontend UI complete, backend integration in progress.)
⬜ Phase 2 — AI Diagnosis: Send logged performance data to the Gemini API to identify weak topics and score trends over time.
⬜ Phase 3 — AI Question Generation: Use the diagnosis to generate targeted practice questions for identified weak areas, forming a personalized mini-exam.
⬜ Phase 4 — Progress Dashboard: Visualize score trends over time across subjects and topics.


Features (Current)


Subject dropdown covering all core GATE CSE subjects (Engineering Mathematics, Digital Logic, COA, DS, Algorithms, TOC, Compiler Design, OS, Databases, Computer Networks)
Topic, score, total questions, and date logging per practice session
Dark-themed, glassmorphism-styled responsive form UI


Tech Stack

Current: HTML5, CSS3
Planned: Node.js, Express, a database (Supabase/SQLite), Google Gemini API

Getting Started

Clone the repo and open index.html directly in your browser:

bashgit clone https://github.com/uryapraveen/AIGate.git
cd AIGate

Then open index.html in any browser.

Why This Project

Built to solve a real, active problem — tracking and improving personal GATE 2027 preparation — rather than as a generic tutorial project. The goal is to move beyond simple API-wrapper apps and build a genuinely agentic tool: one that reasons over real data across multiple steps (diagnose → generate) instead of a single request-response AI call.

Status

Actively in development. Next milestone: connect the form to an Express backend and persist entries to a database.
