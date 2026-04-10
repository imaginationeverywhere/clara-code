# /qn — Send to qn session

When invoked with arguments:

1. **Show active sessions** so the caller knows who's online:
```bash
.claude/scripts/session-registry.sh list
```

2. **Wake the team** (this also logs the directive to the live feed for HQ visibility):
```bash
.claude/scripts/session-registry.sh wake "QuikNation" "<arguments>"
```

3. **Confirm** with status: "Sent to QuikNation. [Active on TTY X / NOT FOUND]"

Team mapping: hq=Headquarters, pkgs=Packages, wcr=WCR, qn=QuikNation, st=Seeking, s962=962, qcr=QCR, qcarry=Carry, fmo=FMO, devops=DevOps
