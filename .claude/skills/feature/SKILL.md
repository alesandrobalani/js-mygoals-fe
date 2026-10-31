---
name: feature
description: Implementa uma feature do frontend MyGoals a partir de uma pasta em specifications/ (planeja, implementa no padrão Container/View, testa e atualiza o README).
argument-hint: <NN-nome-da-spec>
disable-model-invocation: true
---

Implemente a feature descrita em `specifications/$ARGUMENTS/`.

## 1. Entender
- Leia **todos** os arquivos de `specifications/$ARGUMENTS/` em ordem (`01-prompt*`, `02-prompt*`, …). Os posteriores refinam os anteriores.
- Se a feature depende de endpoint do backend, leia a spec correspondente em `../js-mygoals-be/specifications/`, o controller em `../js-mygoals-be/src/modules/` e os DTOs em `../js-mygoals-be/src/dto/`. Se o endpoint ainda não existir, pare e avise — não invente contrato.
- Leia os componentes/páginas/services existentes que serão tocados.

## 2. Planejar
- Apresente um plano curto: arquivos a criar/alterar (Container `X.tsx`, View `X.view.tsx`, service, types, rota/menu), testes a escrever e mudanças no README.
- Liste dúvidas reais de requisito (ambiguidades da spec). Aguarde aprovação antes de codar.
- Após aprovado, salve o plano em `specifications/$ARGUMENTS/plan.md`.

## 3. Implementar
Siga o `CLAUDE.md`: Container/View, services via `api`, tipos em `src/types/index.ts` alinhados ao backend, textos pt-BR, `formatCurrency`, Tailwind responsivo.

## 4. Testar
- Specs em `__tests__/` com happy e bad flows; handlers + fixtures MSW para endpoints novos.
- Rode `npm run test:run`, `npm run lint` e `npm run build`. Corrija até tudo passar. Não desabilite nem pule testes para passar.

## 5. Documentar e reportar
- Atualize `README.md` (Funcionalidades implementadas, estrutura de pastas, rotas) conforme o que mudou.
- Se a mudança for visual, ofereça validar no navegador (`/run`) em largura desktop e mobile.
- Resuma: o que foi feito, arquivos alterados, resultado dos comandos. Não faça commit sem pedido explícito.
