# /pgcmc — Send to PGCMC session

**Team:** PGCMC Team
**Alias:** `pgcmc`
**Project:** `/Volumes/X10-Pro/Native-Projects/clients/new-pgcmc-website-and-app`
**Client:** Prince George's County Muslim Council (pgcmc.org)

When invoked with arguments:

1. **Show active sessions** so the caller knows who's online:
```bash
.claude/scripts/session-registry.sh list
```

2. **Wake the team** (this also logs the directive to the live feed for HQ visibility):
```bash
.claude/scripts/session-registry.sh wake "PGCMC" "<arguments>"
```

3. **Confirm** with status: "Sent to PGCMC. [Active on TTY X / NOT FOUND]"

Team mapping: hq=Headquarters, pkgs=Packages, wcr=WCR, qn=QuikNation, st=Seeking, s962=962, qcr=QCR, qcarry=Carry, fmo=FMO, devops=DevOps, pgcmc=PGCMC
