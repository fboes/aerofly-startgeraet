# Mission generator

To create a new mission generator:

1. For each Mission Generator a sub directory must be created in this directory.
2. Put a `XXXXMissionGenerator.ts` in it.
3. Start implementing with this scaffold:
   ```typescript
   export class XXXXMissionGenerator extends MissionGeneratorInterface {}
   ```
4. You must _not_ use any export provided by the actual Startgerät project, but for type definitions. (CHECK)
