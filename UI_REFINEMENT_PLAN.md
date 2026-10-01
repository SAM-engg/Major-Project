# UI Refinement Plan  
AI-Powered Fitness Assistant

---

## 1. Purpose

The purpose of this document is to define and lock the **final UI/UX scope** for the AI-Powered Fitness Assistant project.

This phase focuses **only on frontend UI refinement** to make the application:
- Professional
- Industry-ready
- Stable for long-term use (1–2 years)

⚠️ Backend logic and AI microservices are **out of scope** in this phase.

---

## 2. Scope of Work (Frontend Only)

### Allowed
- UI/UX redesign
- Layout restructuring
- Component refactoring
- Navigation improvements
- Visual polish
- Responsive design

### Not Allowed
- Backend code changes
- AI microservice changes
- Database changes
- API renaming or creation
- Feature scope expansion

Frontend must work **independently** using mock data.

---

## 3. Global UI Guidelines

- Clean, minimal, modern fitness-style UI
- Calm color palette (fitness green / blue / neutral tones)
- Mobile-first responsive layout
- Consistent spacing and typography
- Clear user guidance (no confusing screens)
- No experimental animations or flashy effects

UI should feel like a **real-world fitness app**, not a demo.

---

## 4. Page Structure (FINAL & LOCKED)

### 4.1 Landing Page
Purpose: First impression & value clarity

Required elements:
- Headline: “AI-Powered Fitness Assistant”
- Short subtext explaining benefits
- Primary CTA: **Start Workout**
- Secondary CTA: **Login**
- Clean hero section
- No dashboard elements visible here

---

### 4.2 Authentication Pages

#### Login Page
- Email
- Password
- Password visibility toggle
- Remember Me checkbox
- “Forgot password?” link
- Text link: **“Don’t have an account? Register”**

#### Register Page
- Name
- Email
- Password
- Confirm password
- Text link: **“Already have an account? Login”**

Validation should be clean and user-friendly.

---

### 4.3 Dashboard (Visible ONLY after login)

Purpose: User home screen

Required elements:
- Welcome message (user name)
- Current fitness goal
- Height & weight display
- Button: **Edit Profile**
- Button: **Start Workout**
- Simple summary:
  - Last workout
  - Rep count or status

No clutter. Clear next action.

---

### 4.4 Profile Page

Purpose: User data management

Editable fields:
- Height
- Weight
- Fitness Goal (Fat Loss / Muscle Gain / Maintenance)

Buttons:
- Save
- Back to Dashboard

---

### 4.5 Workout Page (Core Feature)

Purpose: AI-powered workout experience

Required elements:
- Exercise name
- Camera preview placeholder
- Rep counter (prominent)
- AI feedback text
- Start / Stop workout buttons
- Clear user instructions (before starting)

UI must clearly guide user step-by-step.

---

### 4.6 Speech-to-Text UI

Purpose: Voice interaction clarity

Required elements:
- Microphone button
- Transcribed text display area
- Helper text:
  - “Say: Start workout”
  - “Say: Stop workout”

No backend dependency in this phase.

---

## 5. Data Handling Rules

- Use mock/static data only
- Do NOT call backend APIs
- Do NOT assume new API responses

Example mock user:
```json
{
  "name": "User",
  "goal": "Muscle Gain",
  "height": 175,
  "weight": 72
}
