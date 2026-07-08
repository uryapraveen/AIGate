AIGate — Agentic GATE Prep Assistant

A full-stack study-tracking tool built to log GATE 2027 practice performance by subject and topic, with a planned AI layer (Google Gemini API) that will analyze weak areas and generate targeted practice questions based on real performance data.

Built as a genuine full-stack project — not a frontend wrapper around a third-party API — with a custom Express backend and a Postgres (Supabase) database.

Project Status


✅ Phase 1 — Data Logging & Retrieval (Complete): A form-based system to log practice sessions by roll number, subject, topic, score, and total questions, backed by a real Express + Supabase pipeline with roll-number-based retrieval.
⬜ Phase 2 — AI Diagnosis: Send logged performance data to the Gemini API to identify weak topics and score trends over time.
⬜ Phase 3 — AI Question Generation: Use the diagnosis to generate targeted practice questions for identified weak areas, forming a personalized mini-exam.
⬜ Phase 4 — Progress Dashboard: Visualize score trends over time across subjects and topics.


Features (Phase 1)


Form to log practice sessions: roll number, subject, topic, score, total questions, and date
Data persisted to a Postgres database via Supabase — not browser-only storage
Roll-number-scoped retrieval, allowing multiple students to use the same tool without data collisions (each student sees only their own logged entries)
Server-rendered views using EJS
Secure environment-variable-based configuration for Supabase credentials (no hardcoded keys)


Tech Stack

Backend: Node.js, Express, EJS
Database: Supabase (PostgreSQL)
Frontend: HTML5, CSS3, EJS templating
Planned: Google Gemini API for Phases 2–3

Getting Started

bashgit clone https://github.com/uryapraveen/AIGate.git
cd AIGate/AIGate-backend
npm install

Create a .env file in the project root with your own Supabase credentials:

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

Then run:

bashnode server.js

Visit http://localhost:3000 in your browser.

Database Schema

sqlcreate table details (
  id bigint generated always as identity primary key,
  roll_no text not null,
  subject text not null,
  topic text not null,
  score numeric not null,
  total_questions numeric not null,
  date date not null default current_date,
  created_at timestamp default now()
);

Why This Project

Built to solve a real, active problem — tracking and improving personal GATE 2027 preparation — rather than as a generic tutorial project. Unlike a simple frontend-consuming-an-API pattern, this project required designing and building an actual backend and database from scratch, closing a real skill gap between "Full Stack Developer" as a resume title and the underlying project evidence.

The eventual goal is a genuinely agentic tool: one that reasons over real data across multiple steps (diagnose → generate) instead of a single request-response AI call, once Phases 2 and 3 are built on top of this foundation.

Status

Phase 1 is complete and functional end-to-end: form submission, database persistence, and roll-number-scoped retrieval all work as intended. Next milestone: integrate the Gemini API to analyze logged performance data and identify weak subject areas (Phase 2).