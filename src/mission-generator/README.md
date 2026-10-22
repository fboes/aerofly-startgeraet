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
