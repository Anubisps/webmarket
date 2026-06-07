@echo off
cd /d c:\Users\l\webmarket.worktrees\agents-web-project-review
git add components/ui/ProfileDropdown.tsx
git commit -m "fix: logout infinite redirect loop" -m "Replace window.location.href with NextAuth signOut function to properly handle session termination"
git push origin agents/web-project-review
