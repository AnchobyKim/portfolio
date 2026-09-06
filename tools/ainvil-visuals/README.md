# AInvil Portfolio Visual Generator

This tool generates AINVIL-01 through AINVIL-06 from retained repository evidence. It is deliberately outside the AInvil product runtime.

## Generate and verify

```powershell
Portfolio/tools/ainvil-visuals/generate.ps1
```

Outputs are written to `Portfolio/assets/ainvil/`. The generator uses current graph/traceability counts and retained Unity Play Mode screenshots.

## AINVIL-04 evidence chain

AINVIL-04 does not treat a composed image as self-authenticating evidence. Generation also creates:

- `evidence/ainvil-04-bridge-proof.manifest.json`: extracted recorded checks, a fresh health probe, source paths, sizes, timestamps, and SHA-256 hashes.
- `evidence/ainvil-04-verification.json`: SHA-256 receipt for the manifest and generated media.
- `evidence/ainvil-04-evidence-report.md`: human-readable summary.
- `verify-evidence.mjs`: independent receipt verifier.

Historical bridge evidence and the fresh probe are always labeled separately. If Unity Bridge is not running during generation, the fresh probe is recorded as `Unavailable`; it is never silently replaced with the historical result.

## Source integrity

The visual layouts are editorial composites. Product results, counts, IDs, flags, screenshots, and gate statuses are read from source JSON/PNG files. Do not manually edit generated files; update source evidence or this generator and regenerate.
