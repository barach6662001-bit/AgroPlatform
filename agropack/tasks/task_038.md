# Таск 038: Feature: salary and fuel analytics

## Опис
Зарплата: га/людиногодину. Паливо: л/га, порівняння техніки. Графіки.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: salary and fuel analytics"
git push origin main
```
