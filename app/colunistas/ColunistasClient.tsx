"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { COLUMNIST_PLANS, formatBRL } from "@/lib/columnist";

const AREAS = [
  "Negócios & Empreendedorismo",
  "Tecnologia",
  "Política",
  "Economia",
  "Gastronomia",
  "Saúde & Vida",
  "Moda",
  "Esportes",
  "Cultura & Eventos",
];

export default function ColunistasClient() {
  const [selected, setSelected] = useState<1 | 2 | 3 | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loggedEmail, setLoggedEmail] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [regiao, setRegiao] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [site, setSite] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setLoggedEmail(user.email ?? "");
        setEmail(user.email ?? "");
        const meta = (user.user_metadata ?? {}) as { name?: string; display_name?: string };
        if (meta.display_name || meta.name) setNome(meta.display_name || meta.name || "");
      }
    })();
  }, []);

  function pickPlan(id: 1 | 2 | 3) {
    setSelected(id);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selected) {
      setError("Escolha um plano acima antes de enviar o cadastro.");
      document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!accepted) {
      setError("É preciso aceitar os termos de uso do colaborador.");
      return;
    }
    if (!nome.trim()) return setError("Digite seu nome completo.");
    if (!email.trim()) return setError("Digite seu e-mail.");
    if (!loggedEmail && senha.length < 6) return setError("Crie uma senha de acesso (mínimo 6 caracteres).");

    setBusy(true);
    try {
      // garante uma conta logada (o painel do colunista usa a mesma conta)
      let {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        const { data: up, error: upErr } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { data: { name: nome.trim() } },
        });
        if (upErr && !upErr.message.toLowerCase().includes("already registered")) {
          setError(upErr.message);
          setBusy(false);
          return;
        }
        session = up?.session ?? null;
        if (!session) {
          const { data: si, error: inErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: senha,
          });
          if (inErr || !si.session) {
            setError(
              inErr?.message.includes("Invalid")
                ? "Este e-mail já tem conta com outra senha. Entre em /painel/login e volte aqui."
                : "Conta criada! Confirme seu e-mail e volte a esta página para concluir."
            );
            setBusy(false);
            return;
          }
          session = si.session;
        }
      }

      const res = await fetch("/api/colunista/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan: selected,
          profile: {
            full_name: nome.trim(),
            phone: telefone.trim(),
            region: regiao.trim(),
            area,
            site: site.trim(),
            bio: bio.trim(),
          },
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setError(json.error || "Não foi possível iniciar o pagamento. Tente novamente.");
        setBusy(false);
        return;
      }
      window.location.assign(json.url);
    } catch {
      setError("Erro inesperado. Tente novamente.");
      setBusy(false);
    }
  }

  const plans = [COLUMNIST_PLANS[1], COLUMNIST_PLANS[2], COLUMNIST_PLANS[3]];

  return (
    <div className="colu">
      <style>{CSS}</style>

      <nav className="bar3">
        <div className="wrap">
          <a href="#sobre">Sobre o programa</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#planos">Planos</a>
          <a href="#colunistas">Colunistas</a>
          <a href="#termos">Termos de uso</a>
          <a href="#cadastro">Cadastro</a>
        </div>
      </nav>

      <div className="wrap article-layout">
        <main>
          <div className="kicker-row">
            <span className="kicker">Colunistas</span>
            <span className="time-dot" />
            <span className="time">Chamada permanente</span>
          </div>
          <h1 className="headline">Programa de colunistas da Revista Monatiza</h1>
          <p className="lede">
            <b>
              A Revista Monatiza mantém um programa de colaboração para jornalistas, especialistas e vozes
              regionais que desejam assinar colunas sobre negócios, tecnologia, política, economia,
              gastronomia, saúde, moda e esportes.
            </b>{" "}
            Nesta página você encontra como a colaboração funciona, as regras editoriais, os planos
            disponíveis e o formulário de cadastro.
          </p>

          <div className="byline">
            <div className="av" />
            <div className="who">
              <b>Redação Monatiza</b>
              <span>Atualizado hoje · Imprensa Digital Monatiza</span>
            </div>
          </div>

          <div className="hero-art">
            <div className="rule" />
            <div className="cap">&quot;Toda pauta começa em algum lugar que o jornal ainda não cobriu.&quot;</div>
          </div>
          <p className="hero-caption">Programa de colunistas da Monatiza — cadastro, planos e curadoria editorial.</p>

          <div className="prose" id="sobre">
            <p>
              A <b>Revista Monatiza</b> é referência em <b>negócios, empreendedorismo e tecnologia</b>, com
              cobertura também em política, economia, gastronomia, saúde e vida, moda e esportes — além de
              matérias e cobertura de eventos, shows, lançamentos de livros, CDs e peças teatrais em todo o país.
            </p>
            <p>
              O programa de colunistas é um canal permanente para <b>colaboradores externos</b>: pessoas com
              uma pauta relevante podem se cadastrar e publicar artigos no site, sempre com apoio e revisão de
              uma equipe de jornalistas antes da publicação. A colaboração é organizada em planos mensais,
              detalhados mais abaixo, que definem quantos artigos podem ser publicados por mês.
            </p>
            <p>As áreas de cobertura aceitas atualmente são:</p>
            <div className="tag-row">
              {AREAS.slice(0, 8).map((a) => (
                <span key={a} className="area-pill">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="prose" id="como-funciona">
            <h2>Como funciona a colaboração</h2>
            <p>O processo é simples e todo colunista passa pelas mesmas quatro etapas, do cadastro até a publicação nas redes:</p>
            <div className="steps">
              <div className="step">
                <span className="n">01</span>
                <h3>Cadastro e plano</h3>
                <p>Você escolhe um dos três planos, aceita os termos de uso e conta sua região e área de cobertura.</p>
              </div>
              <div className="step">
                <span className="n">02</span>
                <h3>Produção do conteúdo</h3>
                <p>Escreve artigos, envia fotos e vídeos — de sua autoria ou com a fonte original devidamente citada.</p>
              </div>
              <div className="step">
                <span className="n">03</span>
                <h3>Revisão da Redação</h3>
                <p>Nossos jornalistas revisam, ajustam e aprovam (ou pedem revisão) antes de qualquer publicação.</p>
              </div>
              <div className="step">
                <span className="n">04</span>
                <h3>Publicação e divulgação</h3>
                <p>O artigo vai ao ar no site e é divulgado nas redes sociais da Monatiza, com seu crédito de autoria.</p>
              </div>
            </div>
          </div>

          <div className="prose" id="planos">
            <h2>Planos de colunista</h2>
            <p>
              A colaboração funciona por assinatura mensal. Cada plano define a quantidade de{" "}
              <b>créditos de publicação</b> liberados por mês — cada artigo enviado consome 1 crédito. Os
              créditos são liberados automaticamente no painel do colunista assim que o pagamento é
              confirmado, e renovados a cada mensalidade. Selecione abaixo o plano que será usado no seu
              cadastro.
            </p>
            <div className="plans">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`plan${selected === p.id ? " selected" : ""}`}
                  onClick={() => pickPlan(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && pickPlan(p.id)}
                >
                  <span className="badge">{p.badge}</span>
                  <div className="price">
                    {formatBRL(p.amount).replace(",00", "")} <small>/ mês</small>
                  </div>
                  <div className="cadence">
                    {p.credits} créditos de publicação por mês · renovação automática
                  </div>
                  <ul>
                    {p.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                  <div className="pick">{selected === p.id ? "Plano selecionado ✓" : "Selecionar este plano"}</div>
                </div>
              ))}
            </div>
            <div className="plan-note">
              <b>Permanência mínima de 4 meses</b> em qualquer plano. Depois desse período, o colunista pode
              encerrar a colaboração quando quiser, sem multa. Caso queira publicar além do limite mensal do
              plano, é possível adquirir créditos de publicação adicionais no painel do colunista.
            </div>
          </div>

          <div className="prose" id="colunistas">
            <h2>Quem já escreve na Monatiza</h2>
            <p>Colunistas de diferentes regiões e áreas já publicam com regularidade. Veja alguns exemplos:</p>
            <div className="columnists">
              <div className="col-card">
                <div className="col-photo c1">
                  <span className="initials">LP</span>
                </div>
                <div className="col-body">
                  <div className="kicker">Economia &amp; Negócios</div>
                  <h4>Luciana Paula</h4>
                  <blockquote>&quot;Escrevo sobre as pequenas empresas que sustentam a economia da minha região.&quot;</blockquote>
                  <div className="meta">
                    <span>Plano 1</span>
                    <span className="verified">✓ Verificada</span>
                  </div>
                </div>
              </div>
              <div className="col-card">
                <div className="col-photo c2">
                  <span className="initials">PH</span>
                </div>
                <div className="col-body">
                  <div className="kicker">Tecnologia &amp; Startups</div>
                  <h4>Pedro Henrique</h4>
                  <blockquote>
                    &quot;Cubro lançamentos de tecnologia e startups no interior — pautas que precisam de quem conhece o terreno.&quot;
                  </blockquote>
                  <div className="meta">
                    <span>Plano 2</span>
                    <span className="verified">✓ Verificado</span>
                  </div>
                </div>
              </div>
              <div className="col-card">
                <div className="col-photo c3">
                  <span className="initials">FM</span>
                </div>
                <div className="col-body">
                  <div className="kicker">Esportes &amp; Cultura</div>
                  <h4>Fábio Martins</h4>
                  <blockquote>
                    &quot;De peças teatrais a campeonatos amadores, minha coluna dá palco a quem ainda não tinha vitrine.&quot;
                  </blockquote>
                  <div className="meta">
                    <span>Plano 3</span>
                    <span className="verified">✓ Verificado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="prose" id="termos">
            <h2>Termos de uso do colaborador</h2>
            <p>Ao se cadastrar, todo colunista concorda com as regras abaixo:</p>
            <div className="terms-list">
              {[
                <>Todo material enviado deve ser <b>de sua autoria</b>, exceto quando a fonte, o autor ou o veículo original forem citados.</>,
                <>Toda foto, ilustração ou infográfico deve trazer o <b>nome do fotógrafo, autor ou fonte</b> de origem.</>,
                <>Não há <b>vínculo empregatício</b>. Todo conteúdo publicado é sem fins lucrativos para o colaborador.</>,
                <>O Jornal se reserva o direito de <b>negar ou editar</b> qualquer material enviado.</>,
                <>Não publicamos conteúdo <b>pornográfico, racista ou apologista</b>, nem que exponha ou prejudique terceiros.</>,
                <>O Jornal <b>não se responsabiliza</b> por danos causados pelo conteúdo do colaborador, isentando-se de ações judiciais.</>,
                <>A parceria tem duração mínima de <b>4 meses</b>. Após esse período, o colunista pode se desligar quando quiser.</>,
              ].map((t, i) => (
                <div className="term-item" key={i}>
                  <span className="num">{i + 1}</span>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="prose" id="cadastro">
            <h2>Cadastro</h2>
            <p>
              Preencha os dados abaixo, confira o plano escolhido e conclua o pagamento. Com o pagamento
              confirmado, o acesso ao painel do colunista é liberado com os créditos de publicação do mês.
            </p>
            <div className="form-card">
              <form onSubmit={submit}>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="nome">Nome completo</label>
                    <input id="nome" required placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="voce@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!!loggedEmail}
                    />
                  </div>
                  {!loggedEmail && (
                    <div className="field">
                      <label htmlFor="senha">Senha de acesso (cria sua conta de colunista)</label>
                      <input
                        id="senha"
                        type="password"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="field">
                    <label htmlFor="telefone">Telefone / WhatsApp</label>
                    <input id="telefone" required placeholder="(11) 90000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="regiao">Cidade / Região</label>
                    <input id="regiao" required placeholder="Ex: Vale do Paraíba, SP" value={regiao} onChange={(e) => setRegiao(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="area">Área de cobertura</label>
                    <select id="area" value={area} onChange={(e) => setArea(e.target.value)}>
                      {AREAS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="site">Site ou portal próprio (opcional — Plano 3)</label>
                    <input id="site" placeholder="https://seusite.com.br" value={site} onChange={(e) => setSite(e.target.value)} />
                  </div>
                  <div className="field full">
                    <label htmlFor="sobre-voce">Fale sobre você e sua pauta</label>
                    <textarea
                      id="sobre-voce"
                      placeholder="Conte um pouco da sua experiência e o que pretende cobrir."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  <div className="selected-plan-box">
                    Plano selecionado:{" "}
                    <b>
                      {selected
                        ? `${COLUMNIST_PLANS[selected].name} — ${formatBRL(COLUMNIST_PLANS[selected].amount)}/mês (${COLUMNIST_PLANS[selected].credits} artigos/mês)`
                        : "nenhum — escolha um plano acima"}
                    </b>
                  </div>

                  <div className="terms-accept">
                    <input type="checkbox" id="accept-terms" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                    <label htmlFor="accept-terms">
                      Li e aceito os <a href="#termos">termos de uso</a> do colaborador/colunista, incluindo a
                      permanência mínima de 4 meses na parceria.
                    </label>
                  </div>

                  {error && <div className="form-error">{error}</div>}

                  <button type="submit" className="submit-btn" disabled={!accepted || busy}>
                    {busy ? "Abrindo pagamento seguro…" : "Continuar para o pagamento"}
                  </button>
                  <p className="pay-hint">
                    Pagamento em ambiente seguro e criptografado. Após a confirmação, você é direcionado ao seu
                    painel de colunista com os créditos do mês já liberados.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </main>

        <aside className="sidebar">
          <div className="side-cta">
            <h5>Resumo do programa</h5>
            <p>
              Cadastro com plano mensal, produção do conteúdo, revisão pela Redação e publicação no site com
              crédito de autoria.
            </p>
            <a href="#planos">Conhecer os planos →</a>
          </div>

          <div className="side-block">
            <div className="side-title">Como funciona a publicação</div>
            <div className="side-item">
              <div className="side-thumb t1" />
              <div className="side-text">
                <div className="kicker">Créditos</div>
                <h5>Cada artigo enviado consome 1 crédito de publicação do mês</h5>
                <span className="time">Liberação automática após a confirmação do pagamento</span>
              </div>
            </div>
            <div className="side-item">
              <div className="side-thumb t2" />
              <div className="side-text">
                <div className="kicker">Revisão</div>
                <h5>Toda matéria passa pela Redação antes de ir ao ar</h5>
                <span className="time">Curadoria editorial</span>
              </div>
            </div>
            <div className="side-item">
              <div className="side-thumb t3" />
              <div className="side-text">
                <div className="kicker">Créditos adicionais</div>
                <h5>Publicações além do limite do plano usam créditos adicionais</h5>
                <span className="time">Disponíveis no painel do colunista</span>
              </div>
            </div>
          </div>

          <div className="side-block">
            <div className="side-title">Ecossistema Monatiza</div>
            <div className="side-item">
              <div className="side-text">
                <h5>Revista Empreende Brasil</h5>
                <span className="time">Negócios &amp; empreendedorismo</span>
              </div>
            </div>
            <div className="side-item">
              <div className="side-text">
                <h5>Monatiza Saúde</h5>
                <span className="time">Saúde &amp; bem-estar</span>
              </div>
            </div>
            <div className="side-item">
              <div className="side-text">
                <h5>Monatiza Play</h5>
                <span className="time">Cultura &amp; entretenimento</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const CSS = `
.colu{
  --paper:#ffffff; --paper-2:#f6f6f3; --paper-3:#efefeb;
  --ink:#15161a; --ink-dim:#5b5e66; --ink-faint:#93969e;
  --line:#e6e5e0; --red:#d81f2c; --gold:#b8862f; --gold-soft:#f4ecdb;
  --serif:'PT Serif', Georgia, serif;
  --sans:'Inter', -apple-system, sans-serif;
  background:var(--paper); color:var(--ink); font-family:var(--sans); line-height:1.5;
}
.colu *{box-sizing:border-box;}
.colu a{color:inherit; text-decoration:none;}
.colu ::selection{background:#f6d9b8;}
.colu .wrap{max-width:1180px; margin:0 auto; padding:0 24px;}

.colu .bar3{background:var(--paper); border-bottom:1px solid var(--line); position:sticky; top:0; z-index:30;}
.colu .bar3 .wrap{display:flex; gap:26px; padding:14px 24px; overflow-x:auto; scrollbar-width:none;}
.colu .bar3 .wrap::-webkit-scrollbar{display:none;}
.colu .bar3 a{font-size:13.5px; font-weight:600; color:var(--ink-dim); white-space:nowrap;}
.colu .bar3 a:hover{color:var(--ink);}

.colu .article-layout{display:grid; grid-template-columns:1fr 340px; gap:56px; padding:44px 24px 40px;}
@media (max-width:980px){ .colu .article-layout{grid-template-columns:1fr; gap:40px;} }

.colu .kicker-row{display:flex; align-items:center; gap:10px; margin-bottom:18px;}
.colu .kicker{font-size:12.5px; font-weight:800; color:var(--red); letter-spacing:0.3px; text-transform:uppercase;}
.colu .time-dot{width:4px; height:4px; border-radius:50%; background:var(--ink-faint);}
.colu .time{font-size:12.5px; color:var(--ink-faint); display:flex; align-items:center; gap:5px;}

.colu h1.headline{font-family:var(--serif); font-weight:700; font-size:clamp(30px,4.4vw,50px); line-height:1.1; margin:0 0 22px; letter-spacing:-0.5px; max-width:800px;}
.colu .lede{font-size:19px; font-weight:400; color:#2b2d33; line-height:1.55; margin:0 0 24px; max-width:700px;}
.colu .lede b{font-weight:700;}
.colu .byline{display:flex; align-items:center; gap:12px; padding:18px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); margin-bottom:28px;}
.colu .byline .av{width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#e8c98a,#a9772a); flex-shrink:0;}
.colu .byline .who b{font-size:13.5px; display:block;}
.colu .byline .who span{font-size:12px; color:var(--ink-faint);}

.colu .hero-art{width:100%; aspect-ratio:16/8; border-radius:4px; margin-bottom:14px;
  background:linear-gradient(120deg, rgba(216,31,44,0.14), transparent 55%),
    linear-gradient(200deg, rgba(184,134,47,0.22), transparent 60%), #1c1e24;
  position:relative; overflow:hidden;}
.colu .hero-art .rule{position:absolute; inset:0; background-image:repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 42px);}
.colu .hero-art .cap{position:absolute; bottom:16px; left:20px; font-family:var(--serif); font-style:italic; color:#f2ede2; font-size:15px;}
.colu .hero-caption{font-size:12px; color:var(--ink-faint); margin:0 0 32px;}

.colu .prose h2{font-family:var(--serif); font-size:26px; font-weight:700; margin:44px 0 14px;}
.colu .prose > p{font-size:16px; color:#33353b; line-height:1.75; margin:0 0 18px; max-width:720px;}
.colu .prose p b{font-weight:700; color:var(--ink);}

.colu .tag-row{display:flex; flex-wrap:wrap; gap:9px; margin:6px 0 8px;}
.colu .area-pill{font-size:13px; font-weight:700; padding:8px 15px; border-radius:5px; background:var(--paper-3); color:#3a3c42; border:1px solid var(--line);}

.colu .steps{display:grid; grid-template-columns:repeat(4,1fr); gap:0; margin:26px 0 10px; border-top:1px solid var(--line);}
@media (max-width:820px){ .colu .steps{grid-template-columns:1fr;} }
.colu .step{padding:22px 20px 22px 0; border-right:1px solid var(--line);}
.colu .step:last-child{border-right:none;}
@media (max-width:820px){ .colu .step{border-right:none; border-bottom:1px solid var(--line); padding:20px 0;} }
.colu .step .n{font-family:var(--serif); font-weight:700; font-size:13px; color:var(--red); margin-bottom:10px; display:block;}
.colu .step h3{font-size:15px; margin:0 0 7px; font-weight:700;}
.colu .step p{font-size:13.5px; color:var(--ink-dim); margin:0; line-height:1.6;}

.colu .plans{display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin:24px 0 8px;}
@media (max-width:900px){ .colu .plans{grid-template-columns:1fr;} }
.colu .plan{border:1px solid var(--line); border-radius:6px; padding:24px 22px; cursor:pointer; transition:box-shadow .15s, border-color .15s; background:var(--paper);}
.colu .plan:hover{box-shadow:0 4px 18px rgba(0,0,0,0.06);}
.colu .plan.selected{border-color:var(--gold); background:var(--gold-soft);}
.colu .plan .badge{font-family:monospace; font-size:10.5px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--gold); margin-bottom:14px; display:block;}
.colu .plan .price{font-family:var(--serif); font-weight:700; font-size:32px; margin-bottom:2px;}
.colu .plan .price small{font-family:var(--sans); font-size:13px; color:var(--ink-faint); font-weight:500;}
.colu .plan .cadence{font-size:12px; color:var(--ink-faint); margin-bottom:18px;}
.colu .plan ul{list-style:none; padding:0; margin:0 0 20px;}
.colu .plan li{font-size:13.5px; color:#3a3c42; padding:9px 0; border-top:1px solid var(--line); display:flex; gap:8px;}
.colu .plan li:first-child{border-top:none;}
.colu .plan li::before{content:'—'; color:var(--gold); flex-shrink:0;}
.colu .plan .pick{text-align:center; font-weight:700; font-size:13px; padding:11px; border-radius:5px; border:1px solid var(--ink); color:var(--ink);}
.colu .plan.selected .pick{background:var(--gold); border-color:var(--gold); color:#fff;}
.colu .plan-note{margin:16px 0 30px; padding:14px 16px; border-radius:5px; background:#fdf1ec; border:1px solid #f2d3c3; font-size:13px; color:#8a3a1f; line-height:1.6;}

.colu .columnists{display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin:24px 0 10px;}
@media (max-width:900px){ .colu .columnists{grid-template-columns:1fr;} }
.colu .col-card{border:1px solid var(--line); border-radius:6px; overflow:hidden;}
.colu .col-photo{height:110px; position:relative;}
.colu .col-photo.c1{background:linear-gradient(135deg,#f0d9ab,#b8862f);}
.colu .col-photo.c2{background:linear-gradient(135deg,#a9e0d8,#1c8c82);}
.colu .col-photo.c3{background:linear-gradient(135deg,#d8c8f2,#7c5cc4);}
.colu .col-photo .initials{position:absolute; bottom:10px; left:14px; font-family:var(--serif); font-weight:700; font-size:24px; color:#fff;}
.colu .col-body{padding:16px 18px 18px;}
.colu .col-body .kicker{font-size:11px; margin-bottom:8px;}
.colu .col-body h4{margin:0 0 8px; font-size:16px; font-weight:700;}
.colu .col-body blockquote{margin:0 0 14px; font-family:var(--serif); font-style:italic; font-size:13.5px; color:#3a3c42; line-height:1.55;}
.colu .col-body .meta{display:flex; justify-content:space-between; font-size:11.5px; color:var(--ink-faint); font-weight:600; border-top:1px solid var(--line); padding-top:12px;}
.colu .verified{color:#178a7d;}

.colu .terms-list{border-top:1px solid var(--line); margin-top:20px;}
.colu .term-item{display:flex; gap:20px; padding:20px 0; border-bottom:1px solid var(--line);}
.colu .term-item .num{font-family:var(--serif); font-weight:700; font-size:20px; color:var(--red); flex-shrink:0; width:30px;}
.colu .term-item p{margin:0; font-size:14.5px; color:#3a3c42; line-height:1.65;}
.colu .term-item p b{font-weight:700; color:var(--ink);}

.colu .form-card{background:var(--paper-2); border:1px solid var(--line); border-radius:10px; padding:36px; margin-top:24px;}
@media (max-width:640px){ .colu .form-card{padding:22px 18px;} }
.colu .form-grid{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
@media (max-width:640px){ .colu .form-grid{grid-template-columns:1fr;} }
.colu .field{display:flex; flex-direction:column; gap:6px;}
.colu .field.full{grid-column:1/-1;}
.colu .field label{font-size:12.5px; font-weight:700; color:var(--ink-dim);}
.colu .field input, .colu .field select, .colu .field textarea{background:#fff; border:1px solid var(--line); border-radius:6px; padding:11px 13px; font-family:var(--sans); font-size:14px; color:var(--ink); outline:none;}
.colu .field input:focus, .colu .field select:focus, .colu .field textarea:focus{border-color:var(--gold);}
.colu .field input[readonly]{background:var(--paper-3); color:var(--ink-dim);}
.colu .field textarea{resize:vertical; min-height:78px;}
.colu .selected-plan-box{grid-column:1/-1; display:flex; gap:8px; flex-wrap:wrap; align-items:center; background:var(--gold-soft); border:1px solid #e6cf9c; border-radius:8px; padding:13px 16px; font-size:13.5px;}
.colu .selected-plan-box b{color:var(--gold);}
.colu .terms-accept{grid-column:1/-1; display:flex; gap:11px; align-items:flex-start; margin-top:4px; padding:15px; border-radius:8px; border:1px solid var(--line); background:#fff;}
.colu .terms-accept input{margin-top:3px; width:16px; height:16px; accent-color:var(--gold); flex-shrink:0;}
.colu .terms-accept label{font-size:12.8px; color:var(--ink-dim); line-height:1.6;}
.colu .terms-accept a{color:var(--red); text-decoration:underline; font-weight:600;}
.colu .form-error{grid-column:1/-1; padding:12px 15px; border-radius:8px; background:#fdecec; border:1px solid #f3c3c3; color:#9d1c1c; font-size:13px; line-height:1.5;}
.colu .submit-btn{grid-column:1/-1; margin-top:4px; padding:15px; border-radius:7px; border:none; background:var(--ink); color:#fff; font-weight:700; font-size:15px; cursor:pointer;}
.colu .submit-btn:disabled{opacity:0.35; cursor:not-allowed;}
.colu .pay-hint{grid-column:1/-1; margin:2px 0 0; font-size:12px; color:var(--ink-faint); text-align:center; line-height:1.6;}

.colu .sidebar{padding-top:2px;}
.colu .side-block{margin-bottom:36px;}
.colu .side-title{font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:var(--red); margin-bottom:16px; padding-bottom:10px; border-bottom:2px solid var(--ink);}
.colu .side-item{display:flex; gap:12px; padding:16px 0; border-bottom:1px solid var(--line);}
.colu .side-item:last-child{border-bottom:none;}
.colu .side-thumb{width:84px; height:64px; border-radius:4px; flex-shrink:0;}
.colu .side-thumb.t1{background:linear-gradient(135deg,#f3d7ae,#b8862f);}
.colu .side-thumb.t2{background:linear-gradient(135deg,#c9cdf2,#5a5fbf);}
.colu .side-thumb.t3{background:linear-gradient(135deg,#a9e0d8,#1c8c82);}
.colu .side-text .kicker{font-size:10.5px; margin-bottom:5px;}
.colu .side-text h5{font-size:13.5px; font-weight:700; margin:0 0 5px; line-height:1.35;}
.colu .side-text .time{font-size:11px;}
.colu .side-cta{background:#0d0d0e; color:#fff; border-radius:8px; padding:22px 20px; margin-bottom:36px;}
.colu .side-cta h5{font-family:var(--serif); font-size:18px; font-weight:700; margin:0 0 10px;}
.colu .side-cta p{font-size:13px; color:#c9cacd; line-height:1.6; margin:0 0 16px;}
.colu .side-cta a{display:inline-block; background:var(--gold); color:#1a1206; font-weight:700; font-size:13px; padding:11px 18px; border-radius:6px;}
`;
