# Contribution guides

## I Want To Contribute

> [!WARNING]
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project licence.

## Styleguide

### File naming

The file name matches its primary export exactly, followed by an optional suffix.

- **Files containing a class, interface or type** use the exact name of that
  class/interface/type, i.e. PascalCase: `RandomMissionGenerator.ts`
- **Files containing only functions** start with a lowercase letter and are
  named after their most important function, i.e. camelCase: `parseFlightPlan.ts`
- One primary export per file. The suffix states what it is:

| Suffix          | Content                                                               | Example                                                     |
| --------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| (none)          | Concrete classes, or functions                                        | `RandomMissionGenerator.ts`, `parseFlightPlan.ts`           |
| `.interface.ts` | Interfaces plus types that belong to their contract. No runtime code. | `MissionGenerator.interface.ts`                             |
| `.type.ts`      | Standalone types used independently                                   | `MissionGeneratorManifest.type.ts`                          |
| `.base.ts`      | Abstract base classes                                                 | `ControllerCommand.base.ts`                                 |
| `.test.ts`      | Tests, named after the file under test                                | `RandomMissionGenerator.test.ts`, `parseFlightPlan.test.ts` |

- Type names carry no `I` prefix or `Interface` suffix: `MissionGenerator`,
  not `MissionGeneratorInterface`.
- Abstract classes carry no `Base` or `Abstract` prefix; the `.base.ts` suffix
  marks them: `abstract class ControllerCommand` in `ControllerCommand.base.ts`.
- Import interfaces and types with `import type`. This will be enforced by ESLint.

### Testing

Tests use the built-in Node.js test runner. Do not add Jest, Vitest, Mocha or
any other test framework or assertion library.

```ts
import { describe, it } from "node:test/strict";
import assert from "node:assert";
```

- **Location and name:** The test file sits next to the file and
  carries its name plus `.test.ts`:
  `RandomMissionGenerator.ts` → `RandomMissionGenerator.test.ts`,
  `parseFlightPlan.ts` → `parseFlightPlan.test.ts`
- **Structure:** One `describe` block per class or function under test, one
  `it` per behaviour. Phrase `it` descriptions as sentences describing the
  expected behaviour.
- **Assertions:** Use the strict variants only: `assert.strictEqual`,
  `assert.deepStrictEqual`, `assert.notStrictEqual`. Use `assert.throws` for
  synchronous errors and `await assert.rejects` for rejected promises.
- **Async code:** Declare the test function `async` and `await` the code under
  test.
- **Mocking:** Use `mock` from `node:test` (e.g. `mock.fn()`,
  `mock.method()`) instead of external mocking libraries.
- **Running:** `npm test`
