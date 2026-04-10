# Transcript — Claude Code + Codex = AI GOD

- **URL:** https://youtu.be/L7NPhaUBpZE
- **Source:** YouTube automatic captions (`en`), downloaded 2026-03-31
- **Note:** A letra original já está em inglês; abaixo segue **tradução para português (Brasil)**. Pequenos erros de transcrição automática do YouTube (ex.: “Codeex” → Codex, “Clawed” → Claude) foram normalizados na tradução.

---

## Português (Brasil) — tradução

Agora dá para usar o **Codex** dentro do **Claude Code**. A OpenAI disponibilizou isso. Então o principal concorrente do Opus 4.6 passa a ser algo que você pode usar dentro do ecossistema Anthropic. E isso é uma ótima notícia para quem curte Claude Code, especialmente se você tem sofrido com limites de uso — porque, francamente, o Codex entrega um custo‑benefício bem melhor em termos de dólar por créditos/tokens.

Neste vídeo, vou mostrar como configurar. Vamos ver o que o Codex realmente consegue fazer com o harness do Claude Code por cima — e, mais importante, o que dá para fazer usando **Claude Code com Opus 4.6 e Codex juntos**: como fazer esses dois modelos se complementarem para obter um resultado maior que a soma das partes.

Antes da instalação, um panorama rápido do que o plugin do Claude Code traz — há algumas coisas. As duas mais importantes, na minha opinião, são as **revisões de código**: basicamente, conseguir fazer o Codex olhar para algo que o Opus escreveu. Isso acontece em dois estágios.

Primeiro, temos a **revisão padrão do Codex** — algo mais neutro: ele lê, é somente leitura. O segundo é a **revisão adversarial**, que eu adoro. Você está, na prática, dizendo ao Codex: “olha o que o Opus (ou qualquer agente de código) construiu, mas com olhar crítico — assume que tem erro e acha o que dá para melhorar”. É um jeito excelente de melhorar a entrega, porque um problema do Opus (e de muitos modelos) é que eles costumam **mal avaliar o próprio código**. A Anthropic falou disso no blog de engenharia da semana passada. Revisão adversarial — perfeito, adoro.

Além disso, dá para usar o **Codex rescue**, que deixa o Codex criar algo sozinho, como você faria com o Opus dentro do Claude Code; e tem uns detalhes de status, tipo acompanhar onde o job está.

Vamos à instalação. É bem simples: você roda o comando para adicionar ao marketplace (vou deixar os comandos na descrição) e depois o comando do plugin para instalar. `codex` na OpenAI costuma perguntar onde instalar — eu uso escopo de usuário. Depois recarregamos os plugins para funcionar. Por fim, rodamos `codex:setup`. Há também um repositório no GitHub com os comandos de instalação — link na descrição.

O uso fica ligado à sua conta ChatGPT, **mesmo no plano gratuito**, aparentemente. Então vai consumir seu uso do Codex. Ele pergunta se você quer instalar o Codex — sim. Aí você faz login e abre o fluxo de autenticação no navegador.

Há dois casos de uso bem óbvios para o Codex dentro do Claude Code. O primeiro é **lidar com limites de uso** no Claude Code. Normalmente, no Pro da Anthropic ou no 5x Max, dá para estourar limite rápido, principalmente com alguns bugs de CLI que vimos na última semana. Nesse caso, você pode usar **Opus 4.6 para planejar** e **Codex para executar**. De novo, bem simples: `codex rescue`, aí você passa o prompt. Dá para especificar várias flags — esforço, etc. O modelo do Codex é sólido e o uso **não chega perto** do que a Anthropic cobra.

O caso mais interessante, que comentei antes, é a **revisão adversarial**. Vamos testar. Vou pedir para ele olhar o meu bot de engajamento/pesquisa no Twitter — o web app que o Claude Code construiu. Basicamente, ele varre tweets no espaço de IA a cada 30–45 minutos, tem filtro de qualidade, sinais de pontuação com vários parâmetros, conecta no Supabase para não repetir tweet, tem sistema de score, integra com Softmax Pics, manda tudo para Telegram e tem IA para ajudar nas respostas. Tem bastante coisa. Além disso, rastreia minhas respostas para ter um loop de feedback. Não é super complexo, mas também não é uma landing page — vamos ver o que o Codex devolve numa revisão adversarial desse código.

Vamos deixar o pedido aberto: “olhe o codebase e diga o que acha”. A primeira coisa que ele faz é estimar o tamanho da revisão para escolher o modo. Depois pergunta se roda em background ou se esperamos o resultado. Vamos esperar. Ele diz que o escopo inclui o codebase inteiro mais nove mudanças na working tree — um arquivo modificado, oito não rastreados. Ele sabe que tem muita coisa para ver.

Enquanto roda, como funciona a revisão adversarial? Já vimos as quatro primeiras partes: parse de argumentos (sem flags, defaults), estimativa de tamanho, resolução do alvo, coleta de contexto — aquele texto sobre untracked e tempo.

Depois disso, ele **monta o prompt adversarial**. Há **sete superfícies de ataque** que recebem atenção especial: autenticação, perda de dados, rollbacks, condições de corrida, dependências degradadas, *version skew* e lacunas de observabilidade — coisas mais “de baixo do capô” que podem quebrar em produção se não estiverem sob controle.

A partir daí envia tudo para o servidor OpenAI para o Codex analisar e devolve **JSON estruturado** — algo como severidade (crítico, alto, médio, baixo), recomendações e próximos passos. Você só espera dentro do Claude Code.

O Codex voltou com **quatro achados**, todos com severidade **alta**. Copiei para o Excalidraw para revisar. Para cada um: severidade, área, problema, arquivos, linhas, impacto e correção. (1) lógica de deduplicação; (2) polling do Telegram; (3) *schema drift*; (4) build do dashboard. É coisa relevante e, felizmente, as correções não parecem impossíveis.

O que me interessa: isso é o Codex — **e o Claude diria o quê** se pedíssemos uma revisão adversarial parecida **do próprio codebase**? Seria esclarecedor comparar lado a lado e ver o que o Codex faz diferente — senão podem ser iguais e o vídeo não serviria para nada.

Agora estou fazendo o Opus rodar o mesmo tipo de revisão adversarial, com o prompt que o Codex ajudou a definir: desafiar implementação e decisões de design, avaliar pontos específicos, formato de saída acordado.

**Resultados:** eles tiveram **um achado em comum** — ambos concordaram que o problema do Telegram era real; o Codex marcou como alto e o Opus como **crítico**. O Opus encontrou **mais sete** questões altas/críticas que o Codex não citou. Não estou dizendo que “mais achados = melhor”; só que o Opus apontou sete coisas a considerar que o Codex não viu. Do outro lado, o Codex achou **três** coisas que o Opus não viu.

O que isso significa? Opus é melhor porque achou mais, ou Codex é melhor porque focou em quatro e não nos levou por um caminho estranho? Acho que cada um tira a conclusão que quiser — e provavelmente a lição é que **há valor em ter os dois olhando**: um segundo par de olhos em vez de “Opus avaliando Opus” o tempo todo. Há um problema fundamental em o **mesmo sistema** planejar, gerar e avaliar. Se dá para trazer o Codex, especialmente pelo preço, só para revisão adversarial, é um dos grandes “ganhos marginais” do coding com IA — e se você já paga ChatGPT (os 20 dólares/mês) e pode plugar isso com tão pouco atrito, qual o lado negativo?

Num teste rápido não teremos veredito definitivo “Codex vs Opus”. Essa conversa, acho, perde o ponto: é **mais uma ferramenta na caixa** — e agora podemos usar.

Dá para ser **bem mais específico** na revisão adversarial; nosso prompt foi genérico e mesmo assim ele interpretou de várias formas. Pelos exemplos no GitHub, dá para direcionar bem o que você quer que o Codex inspecione.

No geral, acho uma ótima adição ao ecossistema Claude Code. Quanto mais ferramentas, melhor — especialmente se você já paga ChatGPT **ou** está no Pro da Anthropic e talvez também pague ChatGPT. Cem dólares/mês pode ser demais, duzentos com certeza é. Isso quase cria um **meio-termo** entre a assinatura de 20 e a de 100 — o Codex é mesmo um ótimo **custo‑benefício**. Vale experimentar; setup fácil. Me diga o que achou. E até a próxima.

---

## English — cleaned from captions (original language)

So we can now use Codex inside of Claude Code. OpenAI has made it. So the number one competitor to Opus 4.6 is now something you can use inside of the Anthropic ecosystem. And this is great news for all Claude Code enjoyers, especially if you're someone who has been struggling with usage rates because frankly Codex gives you a way better bang for your buck in terms of dollar to credit/tokens. And so in this video, I'm going to show you how to set it up. And we're going to go through what Codex can actually do with the Claude Code harness on top of it. And more importantly, what we can do using Claude Code with Opus 4.6 and Codex together, right? How can we play these two models off one another to get a sum that is greater than their parts?

Now, before we do the install, let's do a quick overview of what the Claude Code plugin brings us because there's a few things. Now the two most important things I would argue are the code reviews, right? The ability to essentially have it take a look at something Opus has written and that goes in two stages. First of all, we have the standard Codex review which is just, you know, kind of a neutral review. You know, it's taking a look. It's just read only. The second one is adversarial review, which I love. So this is essentially telling Codex like, hey, take a look at what Opus have built or what any coding agent has built, but have a very discerning eye — like kind of assume they screwed up and figure out what we can do to make it better. So, this is an awesome way to really improve our outputs because one of the issues with Opus and really a lot of AI models in general is they tend to do a bad job of evaluating all their own code. This is something Anthropic talked about in their engineering blog that got released last week. So, something like adversarial review — perfect, love this.

Other than that, we can also use Codex rescue which allows us to have Codex create something all on its own just like you would do with Opus inside of Claude Code and then beyond that just kind of like some status stuff like you know taking a look at where it is in its particular job.

So let's dive into this and take a look at the install. Now to install this is pretty simple. You're just going to run this command to add it to the marketplace and I'll have all these commands down in the description. And then you're going to run this plugin command to install it. Codex at OpenAI will usually ask where you want to install it. I'm going to do user scope. And then we just need to reload the plugins to get it up and working. And then lastly, we want to run `codex:setup`. In case you didn't realize, there's also a GitHub repo for this, which also goes over all of the install command. So I'll link that in the description as well.

And the usage rates are tied to your ChatGPT account, even if you're on the free account, apparently. So just understand it's going to be pulling from your Codex usage. It's going to ask if you want to install Codex. Yes. For that, you log in and that will send you to the browser where it runs you through the authentication process.

Now, there's really two obvious use cases for this Codex tool inside of Claude Code. The first one is dealing with the usage limits inside of Claude Code. Normally, if you're on the pro plan with Anthropic or the 5X Max, you can hit those limits very quickly, especially with some of the CLI bugs we've been seeing in the last week. If that's the case, what you might want to do is use Opus 4.6 to plan and Codex to execute. And to do that, again, very simple. You're just going to do `codex rescue`. And then from there, you're going to give it the prompt. And you can also specify a whole bunch of things like you see all the flags here, including the effort level and all that. And remember, Codex, the model is very solid. And again, the usage isn't even close to what Anthropic charges.

But I think the more interesting use case is what I talked about earlier, and that's the adversarial review. So, let's put that to the test. So, I'm going to have it take a look at my Twitter engagement/research bot. This is the web app I had Claude Code build. Essentially, what it does is it scans tweets in the AI space for every like 30 to 45 minutes. It has a quality filter. It has scoring signals based on a number of different parameters. It's connected to Supabase to make sure the tweets don't get repeated. It has a scoring system. It integrates Softmax Pics. Everything gets pushed to Telegram. And I also have AI built in there to help with responses. So there's a fair amount going on. And then on top of that, it also tracks all of my responses. So we can kind of have a feedback loop. So this is like a relatively — it's not super complicated, but this isn't like a landing page we're having it look at. So we're going to see what Codex comes back with when we do an adversarial review on the code for this, right? So let's see how it does.

So we'll keep it pretty open to interpretation. So we're telling Codex, take a look at the codebase and let me know what you think. And the first thing it does is it tells us, hey, we're going to estimate the review size to determine the best mode. And then from there, it says, hey, do you want to run it in the background or do you just want to wait for the results? So, we're just going to wait for the results. And it's telling us the review scope includes the full codebase plus nine working tree changes, one modified file, eight untracked files. So, it knows there's a lot it needs to take a look at.

And while that's working, let's talk about how adversarial review is actually working. So, we just kind of saw the first four parts, right? It parsed the arguments. We didn't pass any flags, so it's just going off its default settings. And then it estimated the review size, resolved the target, and collected some context. That was all that text about, hey, you know, we have these untracked changes, and this is going to take a while.

Now, after those first four steps, it's then going to build the adversarial prompt. And there's seven attack surfaces it's going to pay special attention to. That's authentication, data loss, rollbacks, race conditions, degraded dependencies, version skew, and observability gaps. Right? So like seven things that are somewhat under the surface that could really screw us if we try to push this to production and we don't have a handle on.

From there it's going to send all that information back to the OpenAI server so Codex can take a look at it. And then it will give us our structured JSON output. We should expect it to look something like this, right? And it will give us some sort of severity of its findings, right? Versus critical, high, medium, and low as well as recommendations and next steps. But all you have to do is sit there inside of Claude Code and wait for the response.

So Codex came back with four issues with our codebase and all of them had a severity of high and I pasted this over to Excalidraw so it's a little easier for us to go through it. So for each one of these it gives us the severity, the area, the actual issue, the files as well as the actual lines of code we need to take a look at and then importantly like what's the actual impact here as well as the fix. So number one it's saying we had an issue with our dedup logic. Number two was how we were dealing with Telegram polling. Third was our schema drift. And then lastly was our actual dashboard build. So this is actually relatively important stuff and luckily it doesn't look like the fixes would be too difficult to implement.

But what I'm interested in is okay, this is what Codex gave us. What would Claude give us if we asked for a similar sort of adversarial review on its own codebase? Because I think that would be kind of enlightening to see them head-to-head and like what Codex really does differently than the other — because for all we know they're exactly the same and this whole video was pointless.

So I'm now having Opus run the same sort of adversarial code review. I had Codex come up with the particular prompt. So essentially it's just saying hey I want you to challenge the implementation and the design choices. Here's some things I want you to evaluate and then here's the sort of output format. So let's see what it comes back with.

And so here's the results broken down. So first of all, they did have one shared finding. So they both agreed that the Telegram issue was a problem. So this was the one issue that they both found and that they said was either high or critical. Codex said it was just high and then Opus said it was critical. Now Opus itself found seven other additional issues ranked high or critical that Codex didn't. Now we're not saying that just by virtue of saying there's more issues that Opus was necessarily better than Codex. Just pointing out it found seven things we might want to look at that Codex didn't. Then obviously on the flip side, we found three issues with Codex that Opus missed.

So what does this mean? If we kind of look at this in totality, does this mean Opus is better than Codex because it found more or that Codex is better than Opus because it narrowed down on four and didn't take us onto a weird path? I think what you draw from this is kind of whatever you want to draw from this. And that probably is that there is kind of value of having these two systems look at it, right? It's a second pair of eyes versus having Opus grade Opus all the time. You know, there is some sort of fundamental flaw I think with having the same AI system do the planning, the generating, and the evaluating. And if we're able to very easily bring in Codex, especially at its price point, to even just do things like this, like an adversarial review, again, that's like one of the great AI coding on the margin plays — which again is like why not, you know, if you're already paying for ChatGPT, if you're already paying the 20 bucks a month and I can now bring in this and kind of have Codex just take a look at anything this simply, like what's the downside to this really?

I mean, I don't think in a quick test like this we're going to have any definitive answer like oh Codex is better versus Opus. And I think that whole conversation sort of misses the point. This is just like one more tool in our toolbox and now we can use it. So I think this is great.

Now we can get way more specific with adversarial review as well because our prompt was pretty just like open and out there and it was able to interpret it in a lot of different ways. But just based off of the GitHub examples, right, you can get pretty specific about what you want Codex to look at.

So overall, I think this is a great addition to the Claude Code ecosystem. The more tools, the better. Especially if you're someone who either A is already paying for ChatGPT or B is like on the Anthropic Pro plan and then maybe you are paying for ChatGPT. 100 bucks a month might be a little much, 200 bucks might certainly be too much. Like this almost gives us like this middle ground between the $20 sub and the $100 sub because Codex really is a great value play. So definitely check it out. Super easy setup. Let me know what you thought. And as always, I'll see you

---

## Arquivos auxiliares nesta pasta

- `raw.en-orig.vtt` / `raw.en.vtt` — legendas brutas do YouTube (WebVTT).
- `_plain_en.txt` — texto contínuo em inglês extraído das legendas (para busca/cópia).
