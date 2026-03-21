# Таск 045: Feature: audit log

## Опис
Entity AuditEntry: UserId, Action, EntityType, OldValues JSON, NewValues JSON. EF interceptor. Frontend журнал.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: audit log"
git push origin main
```
