"use client";

type AdSlotProps = {
  slot?: string;
  className?: string;
};

/**
 * Espaço reservado para futuros anúncios do Google AdSense.
 *
 * Enquanto nenhum "slot" real for informado, o componente não renderiza
 * absolutamente nada e não ocupa espaço na página.
 *
 * Quando o AdSense estiver aprovado, conectaremos aqui:
 * - Publisher ID real
 * - Slot ID real
 * - carregamento do anúncio
 * - comportamento responsivo
 */
export function AdSlot({
  slot,
  className = "",
}: AdSlotProps) {
  // AdSense ainda não configurado:
  // não mostra placeholder e não ocupa espaço.
  if (!slot) {
    return null;
  }

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      data-ad-container
    >
      <ins
        className="adsbygoogle block"
        style={{
          display: "block",
          width: "100%",
        }}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}