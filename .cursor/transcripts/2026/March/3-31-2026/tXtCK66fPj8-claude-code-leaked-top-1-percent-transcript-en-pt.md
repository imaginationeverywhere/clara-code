# Transcript — All of Claude Code Just Leaked… Here's How to Become a Top 1% User

- **URL:** https://youtu.be/tXtCK66fPj8
- **Source:** YouTube automatic captions (`en`), downloaded 2026-03-31
- **Note:** Nas legendas, “Cloud Code” aparece com frequência no lugar de **Claude Code**; o texto em inglês abaixo **normaliza para Claude Code** onde se refere ao produto. **Tradução em português (Brasil)** na primeira seção.

---

## Português (Brasil) — tradução

O código-fonte do **Claude Code** vazou para a internet: **~2.000 arquivos**, mais de **meio milhão de linhas** de código de produção — o repositório real por trás da ferramenta. **O que aconteceu:** a Anthropic publicou um pacote **npm** que incluía **source map** apontando para TypeScript legível nos servidores dela; um pesquisador de segurança achou, seguiu o rastro, e o código foi **espelhado no GitHub** em horas. Viralizou.

O autor passou pelo que a comunidade encontrou e pelo codebase e extraiu **insights práticos** para mudar como você usa o Claude Code: **comandos ocultos**, como **contexto e tokens** funcionam por baixo dos panos, e o que a arquitetura mostra sobre recursos que a maioria nunca mexe. **Oito insights**, cada um apoiando o próximo; os primeiros mudam a mentalidade, o último amarra tudo em **sistema** — onde está a alavancagem. Objetivo: usar Claude Code como **usuário top 1%**.

**Aviso legal:** o vídeo **não mostra** o código-fonte; quem baixar deve ter cuidado — a Anthropic detém **copyright** e já sinalizou **DMCA**. O conteúdo do vídeo resume **como usar melhor a ferramenta**, não o código em si.

**Aperitivo:** aquelas mensagens enquanto o Claude Code “pensa” vêm de um arquivo com **187 verbos de spinner** — de “computing” a piadas tipo “boondoggling”, “discombobulating”, etc.

### 1) Não é o que a maioria imagina

Muita gente acha que é “**Claude no terminal**”, um chatbot com arquivos locais. **Errado.** O código mostra um **runtime de agente completo**: app com **Bun, TypeScript, React**; sistema de **ferramentas**, **comandos**, **memória**, **permissões**, **tarefas**, **coordenador multi-agente**, cliente e servidor **MCP** num pipeline só. Fluxo: input → **CLI** → **query engine** → API do LLM → loop de ferramentas → resultado no terminal.

**Por que importa:** se você usa como **chatbot** (perguntas soltas), usa talvez **10%** do potencial. O resto está nos **sistemas em volta do modelo** — tema do resto do vídeo.

### 2) A camada de comandos que quase ninguém usa

Há cerca de **85 comandos com barra (`/`)**; muitos usuários conhecem uns **cinco** (`/help`, talvez `/context`). Quem extrai mais valor usa comandos como **atalhos**. Destaques:

- **`/init`** — contexto do projeto; gera **CLAUDE.md** como “manual de operação” do repositório.
- **`/plan`** (planejamento) — mapeia a abordagem **antes** de editar arquivos; economiza tokens e reduz edições caóticas.
- **`/compact`** — comprime histórico; mantém o importante, corta ruído; pode usar com **prompt** para preservar tema (ex.: integração com site).
- **`/review`** / **`/security-review`** — fluxos de **revisão estruturada**; revisão é **fluxo de primeira classe**, não detalhe.
- **`/context`** — o que está **no contexto** (cada arquivo = tokens).
- **`/cost`** — custo da sessão.
- **`/resume`** e **`/summary`** — retomar entre sessões sem reexplicar tudo.

**Resumo:** prompts melhores são uma alavanca; **comandos** são outra que a maioria ignora.

### 3) Memória — mais importante do que parece

Sistema de memória completo; centro: **CLAUDE.md**. Muita gente ignora ou joga nota solta — erro: **não é documentação**, é **contexto operacional**. Analogia: se Claude Code é “funcionário”, CLAUDE.md é o **onboarding**: como trabalhamos, o que importa, o que **nunca** fazer, estrutura do projeto. Os melhores mantêm o arquivo **curto, opinativo, operacional** (TypeScript strict, testes ao lado do fonte, migrations para schema, pnpm vs npm — **regras**, não romance).

Há camadas: memória de **usuário**, memórias extraídas, **sincronização de equipe** — persistência entre projeto, usuário e sessão. **CLAUDE.md** é um dos inputs de maior alavancagem; é injetado **toda sessão**. **Tarefa:** atualizar CLAUDE.md hoje (global ou projeto).

### 4) Permissões — por que parece “lento” ou chato

Fica pedindo “posso rodar isso?” o tempo todo. **Não é só prompt** — é **permissão**. Há modos (padrão pergunta tudo, plan, bypass/auto). **Permissões com curinga**: ex. todos comandos **git** ou todas edições em **`src/`**. Uma regra em vez de 15 prompts. Configurar em **`settings.json`** / **`settings.local.json`** (global, usuário, projeto). Passa de **babysitting** a deixar o agente trabalhar.

### 5) Feito para multi-agente

**Coordenador**, ferramentas de agente/equipe, **tarefas** em background e paralelo. Arquitetura pensada em **decomposição**: agentes em paralelo (explorar, implementar, validar), trabalho em **background**. Quanto já está exposto na UI vs roadmap — difícil cravar só pelo código, mas a **intenção** é clara: trabalho complexo **partido**, não um fio único gigante.

**Prática:** em vez de um prompt monolítico (“refatora módulo, testes, docs”), **quebrar** em passos sequenciais ou paralelos.

### 6) MCP, plugins e skills = camada de extensão

**MCP** não é só “suportado” — está **entranhado**. Claude Code é **cliente e servidor MCP**; conecta ferramentas externas e outros sistemas a ele. Além disso: **skills e plugins** — fluxos repetíveis, capacidades customizadas, domínio específico. Deixa de ser só “ferramenta de código” e vira **camada de integração** (DBs, APIs, docs, qualquer coisa com servidor MCP + skills por cima). Quanto mais conecta, mais útil.

### 7) Recursos ainda não públicos (feature flags)

Código checa **`user type`**; um valor é **`ant`** (interno Anthropic) — capacidades atrás de **flags**. Referências a **voice mode**, sistema tipo **“Chronos”**, **modo daemon**, **modo coordenador** — interno, experimental ou rollout gradual. Não dá para saber o que já é real internamente; confirma que o produto é **muito feature-flagged** — experiências diferentes por ambiente/build/grupo.

**Prática:** acompanhar **atualizações**; quem entende a arquitetura aproveita antes quando recursos “destravam”.

### 8) Economizar e melhorar resultado — hábitos do top 1%

Insight central: **top users não só escrevem melhores prompts** — desenham **melhor ambiente operacional** para o Claude Code.

1. **CLAUDE.md como multiplicador** — curto, opinativo, atualizado, pode rotear para outros arquivos.  
2. **Dominar comandos** — não precisa dos 85; `/plan`, `/compact`, `/context`, review, `/cost`, `/resume`/`/summary` mudam o dia a dia.  
3. **Permissões** para fluxos recorrentes — curingas, menos babysitting.  
4. **Decomposição** — busca → plano → execução → verificação; alinhar ao desenho do produto (não “bola de futebol americano na cesta de basquete”).  
5. **Contexto = dinheiro** — `/compact`, `/context`, `/summary`/`/resume`; arquivo desnecessário no contexto = tokens pagos; **disciplina**.  
6. **Conectar** — MCP, CLIs, plugins, skills.  
7. **Infraestrutura, não “app”** — superfície enorme de config: roteamento de modelo, overrides de subagente, shell, privacidade, backends (**Bedrock**, **Vertex**, etc.). Quem usa a sério ganha com **afinar o ambiente**.

**CTA:** guia/recurso gratuito na comunidade (link na descrição do vídeo); like, inscrição, etc.

---

## English — cleaned from captions (original language)

So, **Claude Code**'s source code just leaked to the internet—about **2,000 files**, over half a million lines of production code, the actual codebase behind Claude Code. Here's what happened. **Anthropic** published an **npm** package that included a **source map** pointing to readable TypeScript on their servers. A security researcher found it, followed the breadcrumbs, and the full source was mirrored on GitHub within hours. It went viral. I went through what people found and the codebase and pulled out practical insights that will change how you use Claude Code: **hidden slash commands**, how **context and tokens** work under the hood, and what the architecture shows about features most users never touch. **Eight insights**, each building on the last; the last ties everything into a **system**—that's the leverage. By the end, you'll know how to use Claude Code like a **top 1%** user.

**Disclaimer:** I won't show actual source in this video. If you download it yourself, be careful—Anthropic owns the copyright and has shown willingness to send **DMCA** notices. Everything here is about **using the tool better**.

**Appetizer:** those status messages while Claude Code is thinking come from a file with **187 spinner verbs**—normal ones like "computing," funny ones like "boondoggling," "discombobulating," etc.

**1 — It's not what you think.** Most people think Claude Code is "Claude in the terminal," a chatbot with local files. **Wrong.** The source shows a full **agent runtime**: a real app (Bun, TypeScript, React), tool system, command system, memory, **permission engine**, task manager, **multi-agent coordinator**, MCP client and server—one pipeline. Flow: your input → CLI → **query engine** → LLM API → tool loop → terminal output. If you use it like a chatbot, you use maybe **10%** of it; the rest is the **systems around the model**.

**2 — The command layer you're ignoring.** Roughly **85 slash commands**; many users know ~five (`/help`, maybe `/context`). Power users treat commands like **shortcuts**. Highlights: **`/init`** (project context, **CLAUDE.md** as the repo operating manual); **`/plan`** (planning mode—map the approach before touching files, saves tokens); **`/compact`** (compress history; optional prompt to preserve themes like a website integration); **`/review`** and **`/security-review`** (structured review—first-class workflow); **`/context`** (what's loaded—every file costs tokens); **`/cost`** (session spend); **`/resume`** and **`/summary`** (pick up across sessions). Better prompts are one lever; **commands** are another most people skip.

**3 — Memory matters more than you think.** Full memory system centered on **CLAUDE.md**. Don't treat it as docs—it's **operating context** (onboarding for the "employee": how we work, what matters, what we never do, structure). Keep it **short, opinionated, operational**—rules and conventions, not a novel. Layers include user memory, extracted memories, **team memory** sync—persistence across project, user, session. **CLAUDE.md** is injected **every session**. Update it today (global or project).

**4 — Permissions are why it feels slow.** Constant "allow this?" isn't fixed by prompting alone—it's **permissions**. Modes include default (ask everything), plan, bypass/auto. **Wildcard rules** (e.g. all `git` commands, all edits under `src/`)—set once in **`settings.json`** / **`settings.local.json`**. Stop babysitting; let it run like an agent.

**5 — Built for multi-agent work.** Coordinator subsystem, agent/team tools, tasks for **background and parallel** work—architecture supports **decomposition** (explore / implement / validate in parallel). How much is fully user-facing vs rolling out is hard to say from source alone, but intent is clear: **complex work split across agents**, not one giant thread. Practice: break "refactor module, tests, docs" into steps (or parallel steps), not one monolithic prompt—similar to **workflows vs agents** (e.g. in **n8n**).

**6 — MCP, plugins, skills = extension layer.** **MCP** is baked in; Claude Code is **both MCP client and server**. Plus **skills and plugins**—repeatable workflows and domain extensions. It becomes an **integration layer** (DBs, APIs, internal tools, docs—anything with an MCP server, plus skills on top). The power is what you connect and automate.

**7 — Features you may not have yet.** Code checks **`user type`**; one value is **`ant`** (Anthropic internal)—capabilities behind **internal feature flags**. References include **voice mode**, something like **Chronos**, **daemon mode**, **coordinator mode**—internal, experimental, or gradual rollout. We can't know exact internal experience; source confirms **heavy feature flagging**—different users may get different experiences by build or rollout. Watch updates; when features land, people who understand the architecture win first.

**8 — Save money and get better results—habits of top 1% users.** Top users **design a better operating environment**, not just prompts. (1) **CLAUDE.md** as force multiplier—short, opinionated, updated, link out. (2) **Learn commands**—`/plan`, `/compact`, `/context`, review, `/cost`, `/resume`/`/summary`. (3) **Wildcard permissions** for daily workflows. (4) **Decomposition**—search, plan, execute, verify; use the architecture as designed. (5) **Context = money**—`/compact`, `/context`, `/summary`/`/resume`; unnecessary files = paid tokens—build a **discipline**. (6) **Connect** MCP, CLIs, plugins, skills. (7) Treat it as **infrastructure**—routing, sub-agent model overrides, shell, privacy, backends (**AWS Bedrock**, **Google Vertex**), etc. Most people never touch these; serious users get leverage from tuning the environment.

Full **free resource guide** in the creator's community (link in video description). Thanks for watching.

---

## Arquivos auxiliares nesta pasta

- `tXtCK66fPj8.raw.en-orig.vtt`, `tXtCK66fPj8.raw.en.vtt` — legendas WebVTT brutas.
- `tXtCK66fPj8_plain_en.txt` — texto contínuo em inglês extraído do VTT.
