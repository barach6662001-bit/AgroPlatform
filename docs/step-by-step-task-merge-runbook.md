# Пошаговый runbook: как довести таски до реального merge

Ниже не теория, а конкретная последовательность действий.

## Шаг 0. Зафиксируй базовую правду

1. Открой аудит `docs/audit-2026-03-24-task003-046.md`.
2. Пометь как `REOPEN` задачи: **017, 041, 042, 043, 044, 046**.
3. Запрети старт 047/048/049 до закрытия REOPEN-пула.

## Шаг 1. Создай board и статусы

Сделай статусы в трекере:
- `TODO`
- `IN PROGRESS`
- `READY FOR REVIEW`
- `CHANGES REQUESTED`
- `READY TO MERGE`
- `MERGED`

На каждый таск добавь обязательные чекбоксы:
- Frontend wiring
- Backend wiring
- Integration contract
- Tests/CI green
- Risks documented

## Шаг 2. Работа только маленькими PR

Правило:
- 1 PR = 1 таск (или 1 четкий подэтап одного таска)

Примеры:
- `fix/task-046-multifarm-ui-wiring`
- `feat/task-043-push-delivery-pipeline`

## Шаг 3. Перед кодом зафиксируй контракт

Для каждого PR в описании напиши:
1. Endpoint(s) и методы
2. Request/Response JSON
3. FE route/sidebar/i18n ключи
4. Негативные кейсы (ошибки, 403/404/409)

Если этого нет — PR не начинать.

## Шаг 4. Реализация (жесткая дисциплина)

### Frontend минимум
- route существует
- nav/sidebar существует (если требуется)
- i18n ключи есть в `uk.ts` и `en.ts`
- API функция экспортирована и реально используется
- нет dead code

### Backend минимум
- endpoint существует
- handler wired
- DTO/валидация есть
- tenant/role checks есть
- нет заглушек вместо реализации

### Integration минимум
- пути совпадают FE↔BE
- поля и типы совпадают FE types ↔ BE DTO
- поведение ошибок совпадает

## Шаг 5. Локальная проверка перед push

Запускай строго в таком порядке:
1. `cd frontend && npx tsc --noEmit`
2. `cd frontend && npm test -- --run`
3. `dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --configuration Release`
4. `dotnet test`

Если хоть один шаг красный — не пушить PR на review.

## Шаг 6. PR шаблон (обязательный)

В каждый PR:
- Что сделано
- Что НЕ сделано
- Риски
- Скриншоты (если UI)
- Список команд проверок + результат
- Checklist DoD (все пункты)

## Шаг 7. Review-gate

Reviewer проверяет:
1. нет ли “код есть, но не подключен”
2. нет ли расхождения контрактов
3. нет ли hardcoded строк вместо i18n
4. нет ли silent catch на критических местах
5. все проверки зелёные

Если нет — статус `CHANGES REQUESTED`.

## Шаг 8. Merge только при 100% DoD

Merge разрешен только если:
- все чекбоксы DoD закрыты
- CI зеленый
- reviewer approval есть
- нет открытых блокеров

## Шаг 9. Порядок закрытия задач (рекомендован)

1. 046 (multi-farm wiring)
2. 044 (permissions source-of-truth)
3. 043 (реальная push delivery)
4. 042 (offline replay/conflicts)
5. 017 (единый skeleton/loading стандарт)
6. 041 (реальный economics unification, не “по названию”)
7. 047
8. 048
9. 049

## Шаг 10. После merge — stabilization pass

После каждого high-risk feature PR делай отдельный stabilization PR:
- cleanup warning-ов
- недостающие тесты
- устранение tech debt из review

---

Коротко: если хочешь «все таски установлены и замержены» — делай не “много всего в один PR”, а **конвейер из маленьких PR + жесткий DoD + обязательные проверки + правильный порядок задач**.
