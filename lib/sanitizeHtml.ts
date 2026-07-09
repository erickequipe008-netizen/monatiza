// Limpa HTML colado de editores externos (Word, Mailchimp, Google Docs…) para o
// formato semântico simples que o editor e o leitor da Monatiza usam.
// Remove classes, estilos inline e wrappers, preservando a estrutura de blocos.
// Só roda no navegador (usa DOMParser). Fora dele, devolve o HTML original.

const BLOCK_KEEP = new Set(["P", "H1", "H2", "H3", "H4", "UL", "OL", "LI", "BLOCKQUOTE", "FIGURE", "FIGCAPTION", "HR"]);
const INLINE_KEEP = new Set(["B", "STRONG", "I", "EM", "U", "S", "STRIKE", "A", "BR", "IMG", "MARK", "SUB", "SUP"]);
const CONTAINERS = new Set(["DIV", "SECTION", "ARTICLE", "ASIDE", "HEADER", "FOOTER", "MAIN", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "CENTER", "PRE"]);
const DROP = new Set(["SCRIPT", "STYLE", "HEAD", "META", "LINK", "NOSCRIPT", "IFRAME", "OBJECT", "SVG", "BUTTON", "INPUT", "FORM"]);

function stripAttrs(el: HTMLElement) {
  const tag = el.tagName;
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    if (tag === "A" && (name === "href" || name === "target" || name === "rel")) continue;
    if (tag === "IMG" && (name === "src" || name === "alt")) continue;
    el.removeAttribute(attr.name);
  }
  if (tag === "A") {
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  }
}

function hasBlockChild(el: Element): boolean {
  return Array.from(el.children).some((c) => BLOCK_KEEP.has(c.tagName));
}

function isEmpty(el: Element): boolean {
  if (el.querySelector("img, br, hr")) return false;
  return !(el.textContent || "").trim();
}

function clean(node: Node) {
  // percorre uma cópia da lista, pois vamos alterar a árvore
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType !== 1) continue; // ignora texto/comentário aqui
    const el = child as HTMLElement;
    const tag = el.tagName;

    if (DROP.has(tag)) {
      el.remove();
      continue;
    }

    clean(el); // limpa os filhos primeiro
    stripAttrs(el);

    if (BLOCK_KEEP.has(tag) || INLINE_KEEP.has(tag)) {
      if ((BLOCK_KEEP.has(tag) && tag !== "HR" && tag !== "LI") && isEmpty(el)) el.remove();
      continue;
    }

    const parent = el.parentNode;
    if (!parent) continue;

    if (CONTAINERS.has(tag)) {
      if (hasBlockChild(el)) {
        // desembrulha: os filhos já carregam a estrutura de blocos
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        el.remove();
      } else if (isEmpty(el)) {
        el.remove();
      } else {
        // vira um parágrafo, preservando a quebra
        const p = el.ownerDocument.createElement("p");
        while (el.firstChild) p.appendChild(el.firstChild);
        parent.replaceChild(p, el);
      }
    } else {
      // tag desconhecida (span, font, etc.): desembrulha mantendo o conteúdo
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      el.remove();
    }
  }
}

export function sanitizeArticleHtml(html: string): string {
  if (!html || typeof window === "undefined" || typeof DOMParser === "undefined") return html;
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    clean(doc.body);
    return doc.body.innerHTML.trim();
  } catch {
    return html;
  }
}
