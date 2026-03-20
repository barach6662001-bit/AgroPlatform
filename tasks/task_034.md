# Таск 034: Feature: budget plan vs fact

## Опис
Переробити BudgetPage — План, Факт, Різниця, Progress bar. BarChart порівняння.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: budget plan vs fact"
git push origin main
```
