// E-mail de entrega da revista (Resend), com identidade da Monatiza.
import { resend } from "@/lib/resend";
import { formatPrice } from "@/types/magazine";

type DeliveryArgs = {
  to: string;
  name?: string | null;
  magazineTitle: string;
  edition?: string | null;
  amount: number;
  /** Link seguro de download (Signed URL) e a página do pedido. */
  downloadUrl: string;
  orderUrl: string;
  /** Anexo opcional do PDF (quando o arquivo é pequeno). */
  attachment?: { filename: string; content: Buffer } | null;
};

/**
 * Envia o e-mail "Sua revista digital está disponível" com botão de
 * download. Anexa o PDF quando cabe; caso contrário, o botão usa o link
 * temporário e seguro (Signed URL de 15 min). Não lança — a entrega por
 * e-mail é cortesia e nunca deve bloquear a confirmação do pedido.
 */
export async function sendMagazineDeliveryEmail(args: DeliveryArgs): Promise<boolean> {
  const first = (args.name || "").trim().split(" ")[0];
  const hello = first ? `Olá, ${first}!` : "Olá!";
  const editionLine = args.edition ? ` — Edição ${args.edition}` : "";

  try {
    await resend.emails.send({
      from: "Monatiza <contato@monatiza.com>",
      to: args.to,
      subject: "Sua revista digital está disponível",
      ...(args.attachment
        ? { attachments: [{ filename: args.attachment.filename, content: args.attachment.content }] }
        : {}),
      html: `
      <div style="background:#f4f4f6;padding:28px 0;font-family:Arial,Helvetica,sans-serif">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee">
          <div style="background:#0b0b10;padding:22px 28px">
            <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">monatiza</span>
          </div>
          <div style="padding:28px">
            <h1 style="margin:0 0 6px;font-size:20px;color:#0b0b10">${hello}</h1>
            <p style="margin:0 0 16px;color:#444;line-height:1.55">
              Obrigado por comprar na Monatiza. Sua compra foi <b>aprovada com sucesso</b>.
              Clique abaixo para baixar a sua revista.
            </p>
            <div style="background:#f7f7fa;border:1px solid #eee;border-radius:12px;padding:14px 16px;margin:0 0 20px">
              <p style="margin:0;font-size:15px;font-weight:800;color:#0b0b10">${args.magazineTitle}${editionLine}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#666">Valor pago: ${formatPrice(args.amount)}</p>
            </div>
            <a href="${args.downloadUrl}" style="display:inline-block;background:#6D28D9;color:#fff;text-decoration:none;font-weight:800;border-radius:30px;padding:14px 30px;font-size:15px">
              ⬇ Baixar minha revista
            </a>
            <p style="margin:18px 0 0;color:#888;font-size:12px;line-height:1.5">
              O link de download é pessoal e expira em 15 minutos por segurança. Se precisar de um novo,
              acesse a página do seu pedido:
              <a href="${args.orderUrl}" style="color:#6D28D9">abrir pedido</a>.
            </p>
          </div>
          <div style="padding:16px 28px;border-top:1px solid #eee">
            <p style="margin:0;color:#aaa;font-size:11px">© ${new Date().getFullYear()} Monatiza — notícias e comunidade. Dúvidas: contato@monatiza.com</p>
          </div>
        </div>
      </div>`,
    });
    return true;
  } catch {
    return false;
  }
}
