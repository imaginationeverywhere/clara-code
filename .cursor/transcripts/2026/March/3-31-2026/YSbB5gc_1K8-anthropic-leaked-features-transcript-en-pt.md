# Transcript — Anthropic Just Leaked the Features Nobody Was Supposed to See

- **URL:** https://youtu.be/YSbB5gc_1K8
- **Source:** YouTube automatic captions (`en`), downloaded 2026-03-31
- **Note:** Legendas em inglês; **tradução para português (Brasil)** abaixo. Ajustes leves no texto em inglês para nomes corretos (Anthropic, Claude Code, Codex, subagentes, etc.). O áudio/vídeo pode ter sido cortado no fim — a legenda termina abruptamente.

---

## Português (Brasil) — tradução

Certo: mais cedo hoje, funcionários da Anthropic basicamente “vibecodaram” além da conta e **acidentalmente publicaram o que é essencialmente o código-fonte do Claude Code**. Nas últimas horas, o Twitter explodiu porque as pessoas estão dissecando o código de vários jeitos. Neste vídeo, quero passar por **todos os recursos que parecem estar a caminho no Claude Code**, conforme dá para ver no próprio código-fonte. **Atenção:** eles podem ou não lançar isso; até lá os recursos podem mudar — mas isto reflete o estado **presente** no código.

**Modo proativo.** Até agora o Claude Code foi **reativo**: você dá uma tarefa, ele executa e espera o próximo comando. O que aparece no código é a ideia de o Claude Code rodar **o tempo todo**: há um intervalo, ele avalia se há tarefas a fazer, explora o codebase, executa e “dorme” até achar outra tarefa que valha a pena. Ou seja, sai do modo em que só espera seu input para um modo **proativo**, trabalhando continuamente. Exemplos: integração com **Slack** (vê mensagem e implementa na hora); pega **to-dos em comentários** e faz; vê **arquivo novo** e revisa; percebe **testes falhando** e corrige. Resumo: o Claude Code tende a ficar **bem mais ativo** em tarefas que precisam ser feitas. (Há outro vídeo do autor sobre a Anthropic caminhar para um “modelo de fábrica de software”.)

**Melhoria contínua de skills em segundo plano.** A cada cinco mensagens do usuário, o Claude Code faria **análise em background** das mensagens e perguntaria o que mudar na skill com base no que você disse. Ex.: você aciona uma skill, corrige — “não, use isso aqui” — e o Claude Code **atualiza a skill automaticamente** (talvez com um passo de revisão depois). Ideia: skills bem feitas no início costumam **ficar desatualizadas**; agentes em background que as mantêm ajudam no longo prazo.

**Resumo de ausência (“away summary”).** Se o terminal **não está em foco** e você fica mais de **5 minutos** em outro app, ao voltar o Claude Code mostra **o que fez enquanto você estava fora** — sem precisar rolar o histórico inteiro.

**Modo coordenador.** Hoje o padrão é um agente principal que lê mensagens, roda comandos, escreve arquivos e às vezes delega a subagentes. No modo coordenador, o Claude **não faria o trabalho pesado na janela principal**: delegaria para uma **equipe de subagentes** — o Claude Code **não tocaria o codebase diretamente**, só via “workers”. Fases possíveis: **pesquisa** (workers em paralelo lendo o código, estilo planejamento atual); **síntese** (coordenador junta relatórios, acha lacunas e contradições); **implementação** delegada a subagentes por tarefa; **validação** com testes. Dá para aproximar isso hoje com um bom **CLAUDE.md** e times de subagentes; o código sugere que a Anthropic também concluiu que o fluxo funciona.

**Agente de verificação (“verification / adversarial”).** Hoje o comportamento é de “dev otimista”: testes rasos, lê o próprio código e assume que funciona. Entra um agente **adversarial/pessimista**, assumindo que **tudo quebra** e tentando **quebrar de propósito**. O autor menciona que falou disso há meses (Codex + Claude Code) antes do plugin da OpenAI. **Ressalva:** pode ser o **mesmo modelo** com outro system prompt — às vezes um **modelo diferente** (ex.: outra família GPT) acha mais erros. A diferença útil aqui seriam **estratégias**: subir servidor de dev, automação de browser para UI, `curl` em endpoints, reproduzir bug antes de corrigir, checar se **migrations** são reversíveis.

**Orçamento de tokens (“token budgets”).** Hoje o Claude pode encerrar cedo com resposta curta (poucos mil tokens). Para tarefas que precisam de **mergulho profundo** (pesquisa pesada ou codebase grande), você poderia definir um **mínimo** de tokens — ex.: “use pelo menos 500 mil tokens”. Ele para ao atingir ~**90%** do orçamento ou quando o **progresso desacelera** (ex.: últimas continuações retornando pouco texto — detalhe interno que pode mudar). Meta: a Anthropic facilita **gastar mais tokens** de forma intencional, junto com o modo proativo.

**“Ultra plan mode” (remoto).** Se avançarem, o Claude conectaria a uma **sessão remota** no runtime do Claude Code na nuvem, **enviaria o repositório**, faria um **plano profundo** lá (talvez prompt/arquitetura interna, até ~**30 min**). A sessão local **consultaria a nuvem a cada ~3 segundos**; ao terminar, você veria o plano em **claude.ai**; aceitar ou rejeitar; executar o plano **local** ou **remoto**. O “miolo” do prompt/arquitetura pode ficar **oculto** por rodar na infra deles.

**Jobs / templates persistentes.** Conversas hoje são **efêmeras**; amanhã você repete o mesmo ritual. O sistema de **templates de job** faria o Claude **detectar quando algo vira um job** e criar um template reutilizável — no dia seguinte, algo como `claude new <nome-do-job>` (ex.: “deploy to production”), `claude list` para jobs em andamento, responder a jobs **sem abrir cada conversa**. Parece caminhar para um **mini sistema de tarefas** dentro do produto.

**Notificações push.** Provavelmente via **app Claude no celular** (ou desktop) quando uma tarefa termina na nuvem ou no modo proativo — útil para acompanhar o que está acontecendo.

**PRs em tempo real.** **Webhooks do GitHub**: novo PR, comentário de colega ou de agente de review → o Claude é **notificado** para olhar a atualização.

**Subagentes com contexto preservado.** Hoje o subagente só recebe o que o Claude Code coloca no prompt, sem o histórico completo — às vezes ajuda (perspectiva nova), às vezes atrapalha. A ideia é poder spawnar subagentes **com o histórico/cache da conversa**, inclusive **vários em paralelo** bifurcados da sessão principal, depois fundindo de volta.

**Memória de equipe (“team memory”).** Hoje há automemória **local** por pessoa — conhecimento **silado** e contexto compartilhado pode divergir. Aparece no código um diretório estilo **`memory/team`**; talvez sync em background via **claude.ai** em plano de equipe — **base viva** à qual todos contribuem e da qual todos se beneficiam.

**BYOC (“bring your own compute”).** Na versão web você define ambientes, secrets etc. em servidores Anthropic. A ideia é uma **imagem Docker** para rodar o runtime **na sua infra**: variáveis, MCPs, etc. no seu servidor; a tarefa roda **aí** em vez dos servidores deles — ainda chamando a **API Anthropic** (whitelist). Foco **enterprise**: isolamento, subagentes paralelos sem gargalo da infra deles.

**“Context collapse” reversível.** Hoje `/compact` ou autocompact manda o histórico para resumir e pode **perder detalhes importantes** ou manter ruído. A proposta é colapsar contexto com **escores de risco**: trechos longos repetitivos = baixo risco → resumir **no lugar** no histórico, mas **reversível**; decisões-chave = alto risco, preservadas. Ao encher a janela, substituir blocos de baixo risco por resumo, com opção de **reexpandir** quando necessário.

**Sincronizar com claude.ai em modo somente leitura.** Útil para **demo**: apresentação com URL para outros **verem** sua instância local sem poder mudar nada — também monitoramento, feedback de time, até **entrevistas** focadas em uso do Claude Code.

**Atalho terminal ↔ Claude Code.** Trocar entre terminal e interface do Claude Code com **um atalho** (alterna ida e volta).

**Sessões em background na CLI.** Ex.: `claude-bg` + comando, roda “headless”; comandos estilo **`claude` ps / logs / attach / kill** (analogia com Docker).

**Sincronização de configurações.** Config **criptografada** na Anthropic e **sincronizada entre dispositivos** — memórias, keybindings, permissões, etc.

**Easter egg / April Fools.** Aviso de spoiler: recurso mencionado para **1º de abril** — tipo **“AI Tamagotchi”**: hash do seu user ID, **companhia** (pato, ganso, gato, dragão, robô…) com **raridades** diferentes.

**Fechamento.** Nem tudo pode ser lançado; a versão final pode diferir. Quando houver releases reais, o autor promete vídeos específicos — inscrever-se no canal, etc. *(A legenda original corta no meio da frase final.)*

---

## English — cleaned from captions (original language)

Okay, so earlier today, Anthropic employees basically vibe coded a little too hard and accidentally released what is essentially the source code for Claude Code. Over the last few hours, Twitter has been blowing up because people have been dissecting the source code in all sorts of ways. In this video, I want to go through all the upcoming features in Claude Code as evident from the source code itself. Bear in mind they may or may not release these features and the features may be different by the time they're released, but this is the present state in the source code itself.

First, there is an upcoming **proactive mode** in Claude Code. Until now, Claude Code has been **reactive**: you give it a task, it does it, then waits for your next input. What they're doing here is having Claude Code run **around the clock**. There's an interval; it decides whether any tasks need to be done, explores a codebase, does the task, then goes back to sleep until another task seems worth doing. They're shifting from reactive mode—Claude Code only waits for your input—to **proactive** mode where it works around the clock. You might have Claude Code hooked up to Slack; it sees a Slack message and implements it. It notices to-dos in codebase comments and does them. It sees a new file and reviews it. It may notice tests failing and automatically fix them. Claude Code will soon be much more active on tasks that need doing. I have a previous video about Anthropic heading toward a software factory model you can watch.

Next, **background skill improvement**: every five user messages, Claude Code will analyze those messages behind the scenes and ask what should change in the skill based on what the user said. For example, if you triggered a skill, corrected it—“No, actually use this other thing instead”—Claude Code will automatically update the skill in the background. Maybe they'll add a review step: “I noticed the skill needs updating this way.” Many people write a skill well once, then it drifts out of date; background improvement should help long term.

**Away summary**: Claude Code detects when the terminal isn't focused. If you switch away for more than five minutes and come back, it summarizes what it did while you were gone so you don't have to scroll the whole session.

**Coordinator mode**: Today you have a single agent that reads messages, may spin up sub-agents, run commands, etc. In coordinator mode, Claude **won't do work in the main context**; it **delegates to a team of sub-agents**. Claude Code never touches your codebase directly—only via worker sub-agents. Phases may include **research** (parallel workers reading the codebase like planning mode), **synthesis** (coordinator reviews reports, finds gaps and contradictions), **implementation** delegated to task-specific sub-agents, and **validation** sub-agents running tests. You can approximate this today with a good CLAUDE.md and sub-agent teams; Anthropic seems to have converged on the same idea. (I talked about this in my Claude Code masterclass about a month ago.)

**Verification / adversarial agent**: Default Claude Code behaves like an optimistic developer—shallow tests, reads its own code and assumes it works. They're adding an adversarial agent with a **pessimistic** stance: assume things break and try to break them. I discussed using **Codex** to fix Claude Code months ago; later OpenAI shipped a Codex plugin for Claude Code. This in-product verifier might use the **same model** with a different system prompt; I still find a **different model** (e.g. another GPT-family model) can catch more issues. This agent may still add **strategies**: spin up a dev server, browser automation for UI, curl endpoints, reproduce bugs before fixing, check that DB migrations are reversible.

**Token budgets** to force deep work: Today Claude may finish with a short answer after only a few thousand tokens. For heavy research or huge codebases, you could set a **minimum** token budget—e.g. “use at least 500k tokens.” It stops at about **90%** of the assigned budget or when **progress slows** (e.g. last few continuations returning very little—internals may change). Anthropic is making it easier to **use more tokens on purpose**, alongside proactive mode.

**Ultra plan mode**: Claude connects to a **remote** Claude Code runtime, uploads your repo, runs a **deep plan** there (maybe internal prompt/architecture, ~30 minute cap). Your **local** session polls the cloud every few seconds; when done you view the plan on **claude.ai**; accept or reject; execute **locally** or **remotely**. The hidden system side may stay opaque because it runs on their cloud.

**Templating / job system**: Conversations are ephemeral today. The system would **detect when something should become a job**, create a **template**, then tomorrow you reuse it—commands like `claude new <job-name>`, `claude list`, reply to jobs without opening each thread. Feels like **task management** inside Claude Code.

**Push notifications**, probably via the **Claude mobile app** (or desktop), when cloud or proactive work completes—useful for proactive mode.

**Real-time PR watching** via **GitHub webhooks**: new PR, teammate reply, review bot reply → Claude gets notified.

**Context-preserving sub-agents**: Today sub-agents lack prior conversation context beyond what Claude Code injects—sometimes good (fresh eyes), sometimes bad. They may spawn sub-agents with **full conversation history** via shared prompt cache, even **five parallel** forks doing research, then merge back.

**Team memory**: Auto-memory today is **per-user local**—siloed knowledge. A **`memory/team`**-style directory may sync (e.g. via claude.ai on a team plan) as a **shared living** knowledge base.

**Bring your own compute**: Web Claude Code runs env/secrets on Anthropic servers. A **Docker image** could run the runtime **on your** servers—env, MCP, etc.—so tasks execute **there** while still calling the **Anthropic API** (must be allowed). Matters for **enterprise** isolation and fast parallel workers on your infra.

**Reversible context collapse**: `/compact` and autocompact can lose important details. New idea: assign **risk scores**—long repetitive loops = low risk, summarized **in place** but **reversible**; key decisions = high risk, kept. When context fills, replace low-risk chunks with summaries, with a path to **restore** full text when needed.

**Sync local Claude Code to claude.ai in read-only mode**: Great for **demos**, monitoring, team feedback, even **interviews** about Claude Code skills.

**Single shortcut** to flip between terminal and Claude Code UI.

**Background CLI sessions**: e.g. `claude-bg` + command runs headless; **`claude` ps / logs / attach / kill** style commands.

**Settings sync**: Encrypted settings on Anthropic servers, decrypted on other devices—memories, keybindings, permissions, etc.

**April Fools Easter egg** (spoiler): “AI Tamagotchi”—hash of user id assigns a companion (duck, goose, cat, dragon, robot…) with **rarities**.

They may not ship everything; final behavior may differ. I'll make real videos when features ship—subscribe for Claude Code content—and if you want to get better at Claude Code, there's my masterclass… *(caption cuts off mid-sentence: “the best cloud code videos here on”)*

---

## Arquivos auxiliares nesta pasta

- `YSbB5gc_1K8.raw.en-orig.vtt`, `YSbB5gc_1K8.raw.en.vtt`, `YSbB5gc_1K8.raw.en-en.vtt` — legendas WebVTT brutas.
- `YSbB5gc_1K8_plain_en.txt` — texto contínuo em inglês extraído do VTT.
