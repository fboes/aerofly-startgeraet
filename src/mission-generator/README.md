# Mission generator

To create a new mission generator:

1. For each Mission Generator a sub directory must be created in the `generators` directory.
2. Put a `XXXXMissionGenerator.ts` in it.
3. Start implementing with this scaffold:
   ```typescript
   export class XXXXMissionGenerator implements MissionGenerator {}
   ```
4. The Mission Generator class must be registered at `MISSION_GENERATOR_REGISTRY`

## Functionality to consider

- `Point` and `Vector` provide means to compute geographical positions.
- `getAirportCached` gets additional information (e.g. runways) for airports.
- `getVectorString` can be used in mission descriptions to describe relative positions.
- `degreeNormalize` and `degreeDifference` help in computing with degrees.

## Using ZoD

Mission generators will to define a user-facing form using Zod. Apart from the regular Zod types, you may want to consider using predefined types from `ZodExtra`.

Field defined via Zod may also hold additional meta attributes:

```typescript
.meta({ 
  title: "Holding Altitude for pattern", // User-facing label for input field
  unit: "ft MSL" // User-facing unit hint for input field
})
```

Do not use any Zod field types which require the input being an `object`, `array` or `null`.
