# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-09

### Added

#### Frontend
- Frontend analytics pages with data visualization ([#52](https://github.com/barach6662001-bit/AgroPlatform/pull/52))
- Interactive field map using Leaflet ([#53](https://github.com/barach6662001-bit/AgroPlatform/pull/53))
- Role-based authorization on frontend routes ([#54](https://github.com/barach6662001-bit/AgroPlatform/pull/54))
- Global error handling — `ErrorBoundary`, 404/500/403 error pages ([#57](https://github.com/barach6662001-bit/AgroPlatform/pull/57))
- Axios interceptor for centralized HTTP error handling ([#74](https://github.com/barach6662001-bit/AgroPlatform/pull/74))
- Prometheus metrics endpoint for frontend observability ([#74](https://github.com/barach6662001-bit/AgroPlatform/pull/74))
- Frontend unit tests and ESLint configuration ([#74](https://github.com/barach6662001-bit/AgroPlatform/pull/74))

#### Infrastructure & DevOps
- Multi-stage Dockerfile and Nginx configuration for the frontend ([#58](https://github.com/barach6662001-bit/AgroPlatform/pull/58))
- Production configuration files ([#61](https://github.com/barach6662001-bit/AgroPlatform/pull/61))
- Continuous Deployment (CD) workflow — publishes Docker images to GitHub Container Registry (ghcr.io) ([#63](https://github.com/barach6662001-bit/AgroPlatform/pull/63))
- CI vulnerability scan — fail build on HIGH/CRITICAL findings ([#64](https://github.com/barach6662001-bit/AgroPlatform/pull/64))
- HTTPS/TLS termination via Nginx + Let's Encrypt ([#68](https://github.com/barach6662001-bit/AgroPlatform/pull/68))
- PostgreSQL backup and restore scripts ([#69](https://github.com/barach6662001-bit/AgroPlatform/pull/69))
- Auto-apply EF Core migrations on startup via `AUTO_MIGRATE` environment variable ([#70](https://github.com/barach6662001-bit/AgroPlatform/pull/70))
- Persistent file-based logging via `Serilog.Sinks.File` ([#71](https://github.com/barach6662001-bit/AgroPlatform/pull/71))
- Frontend CI pipeline with tests, ESLint, TypeScript type-check, and Docker build dry-run ([#74](https://github.com/barach6662001-bit/AgroPlatform/pull/74), [#77](https://github.com/barach6662001-bit/AgroPlatform/pull/77))
- Release workflow for frontend ([#74](https://github.com/barach6662001-bit/AgroPlatform/pull/74))
- Branch protection documentation and contributing guidelines ([#76](https://github.com/barach6662001-bit/AgroPlatform/pull/76))
- GitHub Actions workflow to set repository topics ([#78](https://github.com/barach6662001-bit/AgroPlatform/pull/78))
- GitHub Pages documentation site with Jekyll ([#79](https://github.com/barach6662001-bit/AgroPlatform/pull/79))
- Automated stale branch cleanup workflow ([#80](https://github.com/barach6662001-bit/AgroPlatform/pull/80))
- GitHub Actions workflow to set repository description ([#81](https://github.com/barach6662001-bit/AgroPlatform/pull/81))

### Fixed

- API port configuration — corrected hardcoded port mismatch ([#55](https://github.com/barach6662001-bit/AgroPlatform/pull/55), [#56](https://github.com/barach6662001-bit/AgroPlatform/pull/56))
- Dockerfile SDK/runtime version mismatch — downgraded from 9.0 to 8.0 to match target framework ([#59](https://github.com/barach6662001-bit/AgroPlatform/pull/59))
- `package-lock.json` sync issues causing frontend CI failures ([#67](https://github.com/barach6662001-bit/AgroPlatform/pull/67), [#72](https://github.com/barach6662001-bit/AgroPlatform/pull/72))
- 22 TypeScript errors that were blocking the frontend Docker build ([#73](https://github.com/barach6662001-bit/AgroPlatform/pull/73))
- CD Docker build — split `vite` and `vitest` configurations to resolve build conflict ([#75](https://github.com/barach6662001-bit/AgroPlatform/pull/75))

### Changed

- CI vulnerability scan scoped to production projects only (excluding test projects) ([#66](https://github.com/barach6662001-bit/AgroPlatform/pull/66))
- Docker image tags pinned to specific versions for reproducible builds ([#62](https://github.com/barach6662001-bit/AgroPlatform/pull/62))

### Security

- Replaced hardcoded secrets with environment variable substitution ([#60](https://github.com/barach6662001-bit/AgroPlatform/pull/60))
- Pinned vulnerable transitive packages in test projects ([#65](https://github.com/barach6662001-bit/AgroPlatform/pull/65))

[Unreleased]: https://github.com/barach6662001-bit/AgroPlatform/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/barach6662001-bit/AgroPlatform/releases/tag/v0.1.0
