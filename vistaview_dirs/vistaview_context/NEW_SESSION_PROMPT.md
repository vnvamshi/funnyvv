# ═══════════════════════════════════════════════════════════════════════════════
# VISTAVIEW SESSION RESTORE PROMPT
# ═══════════════════════════════════════════════════════════════════════════════
# 
# Copy and paste EVERYTHING below the line into your NEW Claude session:
#
# ═══════════════════════════════════════════════════════════════════════════════

Please restore my VistaView session context. Here's my session state:

**PROJECT:** VistaView Agentic System
**RULESET:** VISTAVIEW_AGENTIC_STANDARD_V1.1

**PATHS:**
- Project: ~/vistaview_WORKING
- Backups: ~/vistaview_BACKUPS  
- Context: ~/vistaview_context

**CURRENT TASK:** Voice System Complete Fix
**STATUS:** SCRIPTS_CREATED_AWAITING_INSTALL

**PENDING ITEMS (must complete):**
1. ❌ Run vistaview_COMPLETE_PART1.sh (in ~/Downloads)
2. ❌ Run vistaview_COMPLETE_PART2.sh (in ~/Downloads)
3. ❌ Test voice: say "seven zero three" → should capture digits
4. ❌ Test pause: say "hey" or "stop" → should pause listening
5. ❌ Test resume: say "resume" → should resume listening
6. ❌ Verify microphone permissions working
7. ❌ Test teleprompter integration
8. ❌ Confirm no audio overlap

**KEY FIXES IN SCRIPTS:**
- Singleton Pattern: Only ONE VoiceBrain instance
- Audio Mutex: speak() stops listening, resumes after
- Pause commands: "hey", "stop", "pause", "wait"
- Resume commands: "resume", "continue", "go ahead"

**RECENT SESSION TRANSCRIPTS:**
- /mnt/transcripts/2026-01-04-14-59-29-voice-system-complete-fix.txt (current)
- /mnt/transcripts/2026-01-04-14-57-06-agentic-export-error-fix.txt
- /mnt/transcripts/2026-01-04-14-56-41-vistaview-agentic-blank-page-fix.txt

**CONTEXT FILES:**
- ~/vistaview_context/manifest.json (project architecture)
- ~/vistaview_context/session_state.json (live state)

**PROBLEM WE'RE FIXING:**
Voice system was completely broken - microphone not listening, speech not stopping, "hey"/"mister" commands not working. Root cause: multiple voice instances fighting, missing Audio Mutex, broken pause logic.

Please read the transcript and context files to fully understand the situation, then help me continue from where we left off.
