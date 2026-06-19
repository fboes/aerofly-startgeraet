# Changelog

## [Unreleased]

- Added Electron app
- Added Markdown export
- Added METAR export
- Fixed cloud bug which brakes the `main.mcf`
- Markdown now changes to minute output if flight plan is less than an hour

## [1.7.0] - 2026-06-01

- Updated icon
- Fixed CLI deployment

## [1.6.0] - 2026-05-24

- Adding stand-alone MCP server to deployment
- Adding import / export functionality to MCP server
- Adding wind correction for flight plan
- Added timeout to API calls
- Added elevation data API
- Changed general visibility from `protected` to `private`

## [1.5.1] - 2026-05-01

- Fixing CLI tool deployment

## [1.5.0] - 2026-05-01

- Removed community-developed airports from base airport set
- Improved creation of flight plans
- Added KML and GeoJSON export
- Added SkyVector URL generator
- Added compilation of CLI tool via `bun`

## [1.4.3] - 2026-04-15

- Improved message handling in MCP server

## [1.4.1] - 2026-04-14

- Updated MCPB release

## [1.4.0] - 2026-04-14

- Added METAR parser
- Added import for Aerofly FS 4 `aerofly.json` custom missions file
- Added support for flight plan files containing multiple flight plans
- Added basic MCP server for data retrieval

## [1.3.0] - 2026-04-03

- Added airport output
- Fixed cruise altitude for SimBrief flight plans
- Added import for Aerofly Custom Missions `tmc` file

## [1.2.1] - 2026-03-27

- Added GUI studies

## [1.2.0] - 2026-03-26

- Refactored aircraft / livery data access
- Added export functionality for `tmc` and `mcf` files

## [1.1.0] - 2026-03-22

- Added automatically synchronizing date / time on startup
- Added `mcf` import
- Added options to fetch weather for destination airport instead of departure airport

## [1.0.0] - 2026-03-14

- Initial commit
