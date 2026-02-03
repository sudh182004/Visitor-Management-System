# Visitor Management System (VMS)

A WhatsApp-based Visitor Management System for managing visitor entry at gates with real-time approvals, pre-approvals, and a simple guard-operated gate app.  
Hosts approve or reject visitors directly from WhatsApp without installing any application.

---

## System Overview

The Visitor Management System (VMS) manages visitor entry using a gate application and WhatsApp-based approvals.  
Security guards operate a simple gate app, while hosts respond directly through WhatsApp.  
All approval logic and validations are handled by the backend.

---

## Features

- WhatsApp-based visitor approval
- No app required for hosts (Employees / Admin)
- Real-time gate updates (no refresh)
- Pre-approved visitor entry
- Optional OTP verification
- Auto-login for guards
- Visitor photo capture
- Live dashboard view

---

## Guard Authentication

- Guard logs in once
- Session stored locally on the device
- Auto-login on next app open
- Login required only if:
  - Guard logs out
  - Session expires

---

## Gate / Security Application

### Gate App
- Used by security guards
- Simple and minimal UI
- Designed for mobile or tablet devices

### Visitor Check-In Flow
At the gate, the guard:
1. Enters visitor name
2. Selects host (fetched automatically from backend)
3. Optionally captures visitor photo
4. Submits visitor request

Host contact details are never entered manually.

---

## Visitor Photo Capture

- Photo captured at gate
- Used only for:
  - Visual verification
  - WhatsApp approval context
- Stored temporarily
- No face recognition or profiling

---

## WhatsApp Approval System

### Approval Request
- Approval message sent to host via WhatsApp
- Message includes:
  - Visitor name
  - Visitor photo
  - Approve / Reject actions

Host responds directly on WhatsApp.

---

### Approval Handling
- Host action received via webhook
- Backend maps host response to visitor request
- Decision processed instantly

---

### Real-Time Gate Update
- Gate app updates automatically
- Status displayed instantly:
  - ENTRY ALLOWED
  - ENTRY DENIED
- No refresh or reload required

---

### Approval Timeout
- If host does not respond within a defined time:
  - Request expires automatically
- Guard can retry or take manual decision

---

## Pre-Approval System

### Pre-Approval via WhatsApp
Host can pre-approve a visitor before arrival by sending:


### Pre-Approval Logic
- Backend stores:
  - Visitor name (optional phone)
  - Host identity
  - Date
  - Start time
  - End time
- Pre-approval is time-bound
- Automatically expires after the validity window

### Direct Entry
- If valid pre-approval exists:
  - No WhatsApp approval is sent
  - Entry allowed immediately

---

## OTP Verification (Optional)

- OTP sent only for first-time visitors (if phone number provided)
- No OTP required for repeat visits
- Used only when verification is needed

---

## Dashboard (Demo)

- Visitor summary:
  - Approved
  - Rejected
  - Currently Inside
- Recent visitor list
- Live updates without refresh
- Charts for visual monitoring

---

## Guard Management

- Guard enrollment:
  - Name
  - ID
  - Shift (Day / Night)
- Each visitor entry linked with:
  - Guard
  - Timestamp

(No attendance or payroll logic included)

---

## Architecture Overview

- Single official WhatsApp number
- Supports multiple hosts
- Backend-driven logic:
  - Approval mapping
  - Validation
  - Expiry handling
  - Entry decision

---

## End-to-End Flow

1. Visitor arrives at gate  
2. Guard opens gate app (auto-login)  
3. Visitor details entered  
4. Pre-approval check  
5. If valid → Entry allowed  
6. Else → WhatsApp approval sent  
7. Host approves or rejects  
8. Backend processes decision  
9. Gate updates in real time  
10. Dashboard updates automatically  

---

## Project Status

Prototype / Demo Ready

---

![1](./images/1.png)

![2](./images/2.png)

![3](./images/3.png)

![4](./images/4.png)

![5](./images/5.png)

![6](./images/6.png)

![7](./images/7.png)

![8](./images/8.png)

![9](./images/9.png)

![10](./images/10.png)

![11](./images/11.png)

![12](./images/12.png)

![13](./images/13.png)
