# GetFit

An AI health and fitness coach for everyday people, athletes and busy professionals. It builds one daily plan that adapts to how ready the body is that day.

**Client:** Own product (Grinaker Technologies) · **Role:** Designer & builder · **Year:** 2026 · **Status:** In progress

## The problem

Training, food, sleep, recovery and mood usually live in separate apps, so people have to connect them on their own. A fixed plan doesn't change when the body needs an easier day. The coaching also has to stay safe through pregnancy and the post-natal period.

## What I did

- Designed one daily plan covering training, nutrition, sleep, recovery and mood. It adjusts to a daily readiness score and fully supports pregnancy and the post-natal period.
- Built a working web app prototype. It has an offline coaching engine and brings in Apple Health data from an export file or an iPhone Shortcut.
- Checked all 28 pregnancy and breastfeeding rules against published research and made 24 fixes in the app.
- Designed the backend: a 41-table PostgreSQL schema, written and tested, with row-level security so each user sees only their own data. Claude acts as the AI coach.

## Outcome

- The web app prototype works, and 172 automated tests cover the coaching engine.
- All 28 pregnancy and breastfeeding rules are now research-checked. A midwife or dietitian still needs to sign them off.
- Next: restyle the app in the new colour palette, then build the backend. None of the backend is built or deployed yet.

**Built with:** HTML, CSS, JavaScript, Node.js tests, Apple Health import · planned backend: TypeScript, NestJS, PostgreSQL 16, Claude
