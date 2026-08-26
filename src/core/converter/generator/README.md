# Mission generator

To create a new mission generator:

1. Create a sub directory in this directory.
2. Put a `Generator.ts` in it.
3. Start implementing with this scaffold:
   ```typescript
   export class Generator extends GeneratorInterface {}
   ```
4. You must _not_ use any export provided by the actual Startgerät project, but for type definitions. (CHECK)
