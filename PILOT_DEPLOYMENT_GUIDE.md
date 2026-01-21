# ELIMUCORE - Go-Live Checklist & Pilot Deployment Guide

**Status**: Post v1.2.0 | Preparing for Real-World Deployment  
**Target**: 5-10 pilot schools (by February 2026)  
**Approach**: Validate with real users, not design guesses

---

## 🎯 Pre-Go-Live Checklist (48-72 Hours Before Deployment)

### Database & Infrastructure
- [ ] Production database backed up (full snapshot)
- [ ] Read replicas configured (if 100+ concurrent users expected)
- [ ] Connection pooling tested under load (5 simultaneous requests)
- [ ] Backup restoration tested (can we recover in < 1 hour?)
- [ ] Indexes verified (all constraint indexes in place)
- [ ] Cascading deletes tested (deleting exam cleans up marks)
- [ ] Email/SMS service configured (if notifications enabled)

### Application
- [ ] All 117+ endpoints tested (at least smoke test)
- [ ] RBAC permission matrix verified (10 roles, all paths covered)
- [ ] Error pages working (500, 404, 401, 403)
- [ ] Rate limiting configured (prevent brute force)
- [ ] CORS configured correctly (frontend domain whitelisted)
- [ ] Environment variables all set (no hardcoded values)
- [ ] Logging enabled (errors captured for debugging)

### Frontend
- [ ] Login page working
- [ ] Dashboard loading (with real data)
- [ ] At least 3 critical workflows tested:
  - [ ] Enroll student in subjects
  - [ ] Enter marks for enrolled subjects
  - [ ] View student progression history
- [ ] Mobile responsiveness verified (iPad, phone)
- [ ] Browser compatibility (Chrome, Safari, Firefox)

### Security
- [ ] HTTPS enabled (valid certificate)
- [ ] JWT expiry configured (7 days recommended)
- [ ] Password requirements enforced (8+ chars, mixed case)
- [ ] SQL injection prevented (all queries parameterized)
- [ ] CSRF tokens present (if applicable)
- [ ] Sensitive logs hidden (no passwords in logs)
- [ ] Audit trail enabled (createdBy, updatedAt tracked)

### Data Quality
- [ ] Sample data loaded (10 students, 3 teachers, 2 classes minimum)
- [ ] Subject enrollment tested (each student has subjects)
- [ ] Progression records created (each student has year entry)
- [ ] Marks can be entered without errors
- [ ] Reports generate without crashes
- [ ] No orphaned records (every mark has student & subject)

### Documentation
- [ ] Admin manual created (how to enroll students, enter marks)
- [ ] Teacher guide created (how to view class, enter marks)
- [ ] Troubleshooting guide created (common errors & fixes)
- [ ] Emergency contacts documented (who to call if down)
- [ ] Data entry workflow documented (step-by-step)

### Runbooks
- [ ] Deployment runbook (how to deploy v1.2.1 after this)
- [ ] Rollback runbook (how to revert if critical bug)
- [ ] Incident response runbook (if database corrupts)
- [ ] Performance degradation runbook (what to check if slow)
- [ ] Backup/restore runbook (tested & verified)

---

## 👥 Pilot School Selection Criteria

### Schools You Want
✅ **Urban, tech-forward schools** (will adapt faster)
- Medium size (200-500 students)
- Decent internet connectivity
- Principal comfortable with tech
- Willing to give daily feedback
- Have admin/registrar who'll use system daily

### Schools You DON'T Want (Yet)
❌ Extremely remote areas (internet unreliable)
❌ Rural schools with 50 students (overkill)
❌ Schools with outdated tech requirements
❌ Schools demanding heavy customization
❌ Schools with 3,000+ students (scale testing later)

### Good Pilot Mix (5-10 Schools)
1. **Urban girls' school** (strict discipline, lots of data)
2. **Urban mixed day school** (typical scenario)
3. **Boarding school** (complex attendance/fees)
4. **National school** (large, complex structure)
5. **Religious school** (different fee structure)
6-10. **Similar urban/semi-urban schools** (for volume testing)

---

## 🚀 Pilot Deployment Workflow

### Week 1: Setup
**Day 1-2: Technical Setup**
- [ ] Server provisioned (AWS/DigitalOcean/Linode)
- [ ] Database restored from backup
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate installed
- [ ] Admin user created for pilot school

**Day 3-4: Data Migration**
- [ ] School admin provides student list (CSV)
- [ ] Parse & validate student data
- [ ] Import students (with null progression initially)
- [ ] Create progression records (all Form 1, 2, 3, 4)
- [ ] Set up subject list
- [ ] Create class streams

**Day 5: Training**
- [ ] Video call with school admin (1 hour)
- [ ] Show how to enroll students in subjects
- [ ] Show how to enter marks
- [ ] Show how to view reports
- [ ] Provide login credentials
- [ ] Set expectations (check daily for issues)

### Week 2-4: Active Monitoring
**Daily (First 2 weeks)**
- [ ] Check error logs every morning
- [ ] Respond to school's Slack/WhatsApp messages within 2 hours
- [ ] Document every complaint/issue
- [ ] Prioritize by impact (show-stoppers vs. cosmetic)

**Weekly (Weeks 2-4)**
- [ ] Video call with school admin
- [ ] Review what went wrong
- [ ] Deploy fixes (if critical)
- [ ] Adjust workflows based on feedback
- [ ] Document patterns (what do admins always struggle with?)

### Months 2-3: Scaling
- [ ] Add 3 more pilot schools (repeat week 1-4)
- [ ] Gather feedback from all schools
- [ ] Identify common feature requests
- [ ] Separate "must-have" from "nice-to-have"
- [ ] Plan v1.3.0 based on real feedback

---

## 🛑 Decision Framework: When to Say NO

Schools WILL ask for features. Here's how to decide:

### ✅ Say YES If:
- [ ] 3+ pilot schools independently request it
- [ ] It takes < 4 hours to implement
- [ ] It doesn't break existing data
- [ ] It aligns with Kenyan school standards (MoE)
- [ ] Teachers/admins will actually use it daily

### ❌ Say NO If:
- [ ] Only 1 school requests it (they're unique, not representative)
- [ ] It's "nice-to-have" (not blocking them from using system)
- [ ] It requires database migration (risky)
- [ ] It's specific to 1 school's workflow (make them adapt)
- [ ] It takes > 8 hours to implement (not worth the ROI yet)
- [ ] It's "like other school management systems" (do THEIR research)

### 🤔 Say "MAYBE, LATER" If:
- [ ] 2 schools request it independently
- [ ] It's core business logic (but not urgent)
- [ ] Pilot deployment can work without it
- [ ] It should be in v1.3.0 or v2.0

**Template Response to Feature Requests:**
> "Great suggestion! This is exactly the feedback we need. We're tracking this for v1.3.0. For now, here's the workaround: [provide manual process]. If this becomes blocking for you by end of February, let us know and we'll prioritize it."

---

## 📊 Pilot School Feedback Form (Use Weekly)

Send this to admin every Friday:

```
ELIMUCORE Weekly Feedback - Week [X]

1. WHAT WORKED WELL?
   - What did your team accomplish easily?
   - What saved you time?

2. WHAT WAS FRUSTRATING?
   - What took longer than expected?
   - What confused your staff?

3. WHAT'S BLOCKING YOU?
   - Can you continue without a fix?
   - Or is this stopping you from using the system?

4. MISSING FEATURE?
   - What would make your job easier?
   - Is this something other schools also need?

5. NPS (Net Promoter Score)
   - How likely are you to recommend this to other schools?
   - (0-10 scale)

6. ANYTHING ELSE?
   - Open comments
```

---

## 🎓 MoE/BOM Demo Flow

When presenting to Ministry of Education or Board of Management:

### Opening (3 minutes)
> "ELIMUCORE is a Kenyan school management system built for real schools. Today we'll show you how a principal, registrar, and teacher use it daily."

### Demo 1: Admin Setup (5 minutes)

**Screen: Dashboard**
- "This is what the admin sees on login"
- Show: Total students, pending tasks, alerts
- Highlight: Clean, simple interface

**Screen: Student Enrollment**
- "Watch as we enroll a Form 3 student in their subjects"
- Show: 8 mandatory subjects + 1 optional
- Click: Save
- Highlight: "System prevents the same student in same subject twice"

### Demo 2: Teacher Workflow (5 minutes)

**Screen: Teacher Login**
- "Teachers only see their own classes"
- Show: Limited to 1 view (their class)

**Screen: Class Mark Entry**
- "Teacher enters Form 3A marks for last exam"
- Fill in 5 marks: 85, 92, 78, 88, 95
- Click: Submit
- Highlight: "System verifies each student is enrolled before saving"

### Demo 3: Reports (5 minutes)

**Screen: Student Report Card**
- "This is the report card for John Doe"
- Show: Form 3 subjects, marks, percentages, grades
- Scroll down: Previous year comparison
- Highlight: "Automatically generated PDF"
- Click: Download
- Highlight: "Works offline once downloaded"

**Screen: Repeater Analytics**
- "School can see who's repeating and why"
- Show: 3 Form 2 repeaters from previous year
- Show: Pass rate improving from 85% to 92%
- Highlight: "Data-driven decisions"

### Demo 4: Compliance (3 minutes)

**Screen: Audit Trail**
- "Every action is logged"
- Show: "Who entered what mark, when"
- Highlight: "Ready for government audits"

**Screen: Data Integrity**
- "System prevents invalid data"
- Try to enter mark > 100
- Show: Error message
- Highlight: "Data always correct"

### Closing (2 minutes)
> "ELIMUCORE helps schools focus on teaching, not paperwork. Schools save 5-10 hours per week on mark entry and reporting. Ready for questions?"

---

## ⚠️ Red Flags During Pilot

If you see these, investigate immediately:

### Data Quality Red Flags
- [ ] Same student appears twice (duplicate enrollment)
- [ ] Student has mark but no enrollment record
- [ ] Report shows wrong subject list for student
- [ ] Marks changed but audit trail blank

### Performance Red Flags
- [ ] Marking takes > 10 seconds per student
- [ ] Report generation hangs > 5 seconds
- [ ] Dashboard takes > 3 seconds to load
- [ ] Login sometimes fails (intermittent)

### User Experience Red Flags
- [ ] Admin says "I don't understand how to enter marks"
- [ ] Teacher asks "Where do I click to see my class?"
- [ ] School calls you 3+ times with same question
- [ ] School wants feature other schools don't

### Business Red Flags
- [ ] School says "We need customization to use this"
- [ ] School asks for features from 2020s (biometrics, AI)
- [ ] School wants complete ownership of code
- [ ] School demands 24/7 support for free

---

## 📋 Pilot Success Metrics

After 4 weeks, you'll know if pilot succeeded if:

| Metric | Target | Status |
|--------|--------|--------|
| Uptime | > 99% | ✅/❌ |
| No critical bugs | Zero | ✅/❌ |
| Admin can enroll 50 students in < 30 min | Yes | ✅/❌ |
| Teacher can enter 100 marks in < 20 min | Yes | ✅/❌ |
| Report card generates in < 5 sec | Yes | ✅/❌ |
| Zero data corruption incidents | Zero | ✅/❌ |
| School says "Ready to go live" | Yes | ✅/❌ |
| NPS score | > 7/10 | ✅/❌ |

**Pass Criteria**: 7/8 metrics achieved = Ready for wider rollout

---

## 🚫 Pilot Failure Points (Know These)

### "Critical Bugs" = Stop Everything
- Database corruption
- Marks randomly disappearing
- Login broken for entire school
- Reports showing wrong data

**Action**: Rollback immediately. Investigate for 48 hours. Only re-deploy after root cause fixed.

### "Major Issues" = Fix in < 24 Hours
- Slow performance (takes > 20 seconds to enter 10 marks)
- Feature doesn't work (can't enroll student in subject)
- Data entry error (mark entered as 850 instead of 85)

**Action**: Fix + deploy patch same day.

### "Minor Issues" = Fix in v1.2.1
- Button alignment wrong on phone
- Help text missing
- Report formatting slightly off

**Action**: Document + plan for next release.

---

## 📞 Support During Pilot

**You need a "support person"** (could be you or someone trained):

### Response Times
- **Critical (system down)**: 1 hour response
- **Major (workflow broken)**: 4 hour response
- **Minor (cosmetic)**: Next business day

### Communication
- Slack channel or WhatsApp group (for quick messages)
- Weekly video call (30 minutes)
- Email for documentation

### Escalation
- Week 1: You handle everything
- Week 2-4: Train someone on your team to field routine questions
- Month 2-3: Move to standardized support (FAQ, help desk)

---

## ✅ When to Declare "Pilot Success"

You're done when:

1. ✅ All 5-10 schools have been running for 4+ weeks without critical issues
2. ✅ 7/8 success metrics achieved
3. ✅ NPS score ≥ 7/10
4. ✅ Schools asking for v1.3.0 features (not core fixes)
5. ✅ You've got a backlog of 20+ feedback items (for prioritization)
6. ✅ You're confident this scales to 50+ schools

---

## 🎯 Next Actions (In Order)

1. **Select pilot schools** (this week)
   - Contact 3-5 school principals
   - Confirm they'll give daily feedback
   - Schedule Week 1 setup

2. **Prepare materials** (this week)
   - Create admin manual (2-3 pages)
   - Create teacher guide (1-2 pages)
   - Prepare demo presentation

3. **Deploy v1.2.0 to staging** (this week)
   - Test entire workflow
   - Fix any issues before pilot

4. **Week 1: Setup first school** (next week)
   - Deploy, migrate data, train
   - Monitor closely

5. **Week 2-4: Support & iterate** (active period)
   - Daily issue tracking
   - Weekly feedback calls
   - Small fixes as needed

6. **Month 2-3: Expand to 5-10 schools** (scale up)
   - Each gets same Week 1-4 cycle
   - Patterns emerge
   - Plan v1.3.0

---

## 🎓 What You'll Learn from Pilots

After 4 weeks, you'll understand:

- ✅ **What real admins actually do** (vs. what you designed)
- ✅ **What's confusing** (fix UX in v1.3.0)
- ✅ **What features are worth building** (v1.3.0 roadmap)
- ✅ **What features aren't** (list of NOs)
- ✅ **How fast marks get entered** (performance reality check)
- ✅ **Where data quality breaks** (add validation)
- ✅ **How responsive you need to be** (support model)
- ✅ **Price point schools will pay** (business model)

---

**Remember**: The pilot is not about perfection. It's about learning from real users what matters.

Stop guessing. Start validating.

