# Task Merge Playbook (003–046 and next)

Цель: чтобы «таск закрыт» означало **реально реализован + проверен + безопасно замержен**.

## 1) Правило №1: один таск = один PR (или строго ограниченный батч)

Не делать батчи на 10+ задач без изоляции. Иначе получаешь FAKE-DONE.

Рекомендуемый формат веток:
- `feat/task-047-public-api-keys`
- `fix/task-046-multifarm-hardening`
- `refactor/task-041-economics-unification`

## 2) Definition of Done (DoD) — обязательный

PR не мержится пока для таска нет:

### Frontend
- route существует
- sidebar/nav entry существует (если нужно)
- i18n ключи есть в `uk.ts` и `en.ts`
- API функция экспортирована и реально используется
- нет dead components/imports
- `npx tsc --noEmit` зеленый

### Backend
- endpoint существует
- handler wired и вызывается
- DTO/валидация есть
- нет заглушек вместо реальной реализации
- нет сломанных layer boundaries

### Integration
- frontend contract = backend contract
- пути совпадают
- типы совпадают
- нет «код есть, но не подключен»

### Quality
- unit/integration tests зелёные
- без игнорирования критических warning в измененном скоупе
- lockfile/CI стабильны

## 3) Merge gate (обязательный pipeline)

На каждый PR:
1. `frontend: npx tsc --noEmit`
2. `frontend: npm test -- --run`
3. `backend: dotnet build`
4. `backend: dotnet test`
5. контракты API: smoke tests по измененным endpoint

Если любой пункт красный — merge запрещен.

## 4) Структура PR

В каждом PR обязательно:
- `Task ID`
- Что сделано
- Что **не** сделано
- Риски
- Чеклист Frontend/Backend/Integration
- Скриншоты (если UI менялся)

## 5) Как закрыть «все таски» без хаоса

Порядок:
1. Reopen/hardening сломанных: 017, 041, 042, 043, 044, 046
2. Только после этого: 047 (public API)
3. Потом: 048 (1C)
4. Потом: 049 (landing)

## 6) Анти-паттерны (запрещено)

- «Есть файл => таск закрыт»
- «Есть endpoint => интеграция работает»
- «UI есть => backend не нужен»
- «Тесты с warning — норм»
- «Один PR на пачку несвязанных задач»

## 7) Операционный режим для coding agent

- feature PR → mandatory stabilization PR для high-risk задач
- auth/tenant/permissions/audit/offline только с ручным ревью
- каждый таск закрывается ссылкой на код + тесты + контракт

---

Если коротко: чтобы «все таски были установлены и замержены», нужен не автослияние любой фичи, а **жесткий merge gate + поэтапное закрытие reopen-задач + прозрачный DoD**.
