import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid md:grid-cols-4 gap-10">

          <div>
            <h2 className="text-4xl font-bold mb-4">
              monatiza
            </h2>

            <p className="text-zinc-400 text-sm leading-6">
              Portal brasileiro de notícias sobre tecnologia,
              inteligência artificial, negócios, economia e inovação.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              Empresa
            </h3>

            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/editorial">Editorial</Link></li>
              <li><Link href="/contact">Contato</Link></li>
              <li><Link href="/about">Sobre</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              Legal
            </h3>

            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/privacy">Privacidade</Link></li>
              <li><Link href="/cookies">Cookies</Link></li>
              <li><Link href="/terms">Termos</Link></li>
              <li><Link href="/disclaimer">Disclaimer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              Editorias
            </h3>

            <ul className="space-y-2 text-zinc-400">
              <li>IA</li>
              <li>Negócios</li>
              <li>Tecnologia</li>
              <li>Mercado</li>
              <li>Startups</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Monatiza Media.
            Todos os direitos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
}