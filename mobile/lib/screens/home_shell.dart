import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../db.dart';
import 'feed_screen.dart';
import 'community_screen.dart';
import 'discover_screen.dart';
import 'profile_screen.dart';
import 'messages_screen.dart';
import 'biblioteca_screen.dart';
import 'article_list_screen.dart';
import 'newsletter_screen.dart';
import 'verificacao_screen.dart';
import 'conta_screen.dart';
import 'compose_screen.dart';

const _danger = Color(0xFFE0263B);

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _i = 0;
  final _bodies = const [FeedBody(), CommunityBody(), MessagesBody(), DiscoverBody(), ProfileBody()];
  final _titles = const ["monatiza", "Comunidade", "Mensagens", "Descobrir", "Perfil"];

  void _tap(int i) {
    if (i == _i) return;
    HapticFeedback.selectionClick();
    setState(() => _i = i);
  }

  // Fecha o menu e abre a tela escolhida.
  void _go(Widget screen) {
    Navigator.pop(context);
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  void _openMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF16181C),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => SafeArea(
        child: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 36,
              height: 4,
              decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(4)),
            ),
            _MenuTile(icon: Icons.bookmark_border, label: 'Biblioteca', onTap: () => _go(const BibliotecaScreen())),
            _MenuTile(icon: Icons.menu_book_outlined, label: 'Revistas', onTap: () => _go(ArticleListScreen(title: 'Revistas', load: () => fetchByCategory('%Revista%')))),
            _MenuTile(icon: Icons.workspace_premium_outlined, label: 'Exclusivo', onTap: () => _go(ArticleListScreen(title: 'Exclusivo', load: fetchPremium))),
            _MenuTile(icon: Icons.mail_outline, label: 'Newsletter', onTap: () => _go(const NewsletterScreen())),
            _MenuTile(icon: Icons.verified_outlined, label: 'Verificação', onTap: () => _go(const VerificacaoScreen())),
            const Divider(height: 12, color: Colors.white12, indent: 24, endIndent: 24),
            _MenuTile(icon: Icons.settings_outlined, label: 'Configurações', onTap: () => _go(const ContaScreen())),
            _MenuTile(icon: Icons.help_outline, label: 'Ajuda', onTap: _help),
            _MenuTile(icon: Icons.info_outline, label: 'Sobre', onTap: _about),
            const Divider(height: 12, color: Colors.white12, indent: 24, endIndent: 24),
            _MenuTile(icon: Icons.logout, label: 'Sair', danger: true, onTap: _confirmLogout),
            const SizedBox(height: 10),
          ]),
        ),
      ),
    );
  }

  void _help() {
    Navigator.pop(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF16181C),
        title: const Text('Ajuda'),
        content: const Text('Precisa de ajuda ou quer falar com a gente?\n\ncontato@monatiza.com'),
        actions: [
          TextButton(
            onPressed: () {
              Clipboard.setData(const ClipboardData(text: 'contato@monatiza.com'));
              Navigator.pop(ctx);
            },
            child: const Text('Copiar e-mail'),
          ),
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fechar')),
        ],
      ),
    );
  }

  void _about() {
    Navigator.pop(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF16181C),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            width: 56,
            height: 56,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Text('m', style: TextStyle(color: Colors.black, fontSize: 28, fontWeight: FontWeight.w800)),
          ),
          const SizedBox(height: 14),
          const Text('Monatiza', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          const Text('Versão 3.1.0', style: TextStyle(color: Colors.white38, fontSize: 12)),
          const SizedBox(height: 10),
          const Text('© 2026 Monatiza — notícias e comunidade.',
              textAlign: TextAlign.center, style: TextStyle(color: Colors.white54, fontSize: 13)),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fechar')),
        ],
      ),
    );
  }

  Future<void> _confirmLogout() async {
    Navigator.pop(context);
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF16181C),
        title: const Text('Sair da conta?'),
        content: const Text('Você pode entrar de novo quando quiser.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Sair', style: TextStyle(color: _danger))),
        ],
      ),
    );
    if (ok == true) await Supabase.instance.client.auth.signOut();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Na aba Início o cabeçalho fica dentro do conteúdo (avatar + busca).
      appBar: _i == 0
          ? null
          : AppBar(
        title: Text(_titles[_i], style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 19)),
        actions: [
          if (_i == 4)
            OutlinedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ContaScreen())),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.white24),
                shape: const StadiumBorder(),
                padding: const EdgeInsets.symmetric(horizontal: 14),
                minimumSize: const Size(0, 32),
                visualDensity: VisualDensity.compact,
                foregroundColor: Colors.white,
              ),
              child: const Text('Editar perfil', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
            ),
          IconButton(tooltip: 'Menu', icon: const Icon(Icons.menu, size: 22), onPressed: _openMenu),
          const SizedBox(width: 4),
        ],
      ),
      body: IndexedStack(index: _i, children: _bodies),
      bottomNavigationBar: _NavBar(index: _i, onTap: _tap),
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool danger;
  const _MenuTile({required this.icon, required this.label, required this.onTap, this.danger = false});

  @override
  Widget build(BuildContext context) {
    final color = danger ? _danger : Colors.white;
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 24),
      horizontalTitleGap: 14,
      visualDensity: const VisualDensity(vertical: -1),
      leading: Icon(icon, size: 22, color: danger ? _danger : Colors.white70),
      title: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 15)),
    );
  }
}

/// Dock flutuante: pílula escura com a aba ativa expandida (ícone +
/// nome em azul) e botão de ação redondo separado — estilo iOS.
class _NavBar extends StatelessWidget {
  final int index;
  final ValueChanged<int> onTap;
  const _NavBar({required this.index, required this.onTap});

  static const _tabs = [
    (Icons.article_outlined, Icons.article, 'Notícias'),
    (Icons.people_outline, Icons.people, 'Comunidade'),
    (Icons.mail_outline, Icons.mail, 'Mensagens'),
    (Icons.explore_outlined, Icons.explore, 'Descobrir'),
    (Icons.person_outline, Icons.person, 'Perfil'),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 6, 12, 10),
        child: Row(children: [
          Expanded(
            child: Container(
              height: 62,
              padding: const EdgeInsets.symmetric(horizontal: 7),
              decoration: BoxDecoration(
                color: const Color(0xFF14171B),
                borderRadius: BorderRadius.circular(34),
                border: Border.all(color: Colors.white.withOpacity(0.07)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.55), blurRadius: 18, offset: const Offset(0, 6)),
                ],
              ),
              child: Row(children: [
                for (var i = 0; i < _tabs.length; i++)
                  if (i == index)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Container(
                        height: 46,
                        padding: const EdgeInsets.symmetric(horizontal: 15),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8B5CF6),
                          borderRadius: BorderRadius.circular(26),
                        ),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(_tabs[i].$2, size: 18, color: Colors.white),
                          const SizedBox(width: 7),
                          Text(_tabs[i].$3,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12.5)),
                        ]),
                      ),
                    )
                  else
                    Expanded(
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: () => onTap(i),
                        child: Center(
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withOpacity(0.05),
                            ),
                            child: Icon(_tabs[i].$1, size: 20, color: Colors.white60),
                          ),
                        ),
                      ),
                    ),
              ]),
            ),
          ),
          const SizedBox(width: 10),
          // Botão de ação: nova publicação
          GestureDetector(
            onTap: () {
              HapticFeedback.mediumImpact();
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ComposeScreen()));
            },
            child: Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 16, offset: const Offset(0, 5)),
                ],
              ),
              child: const Icon(Icons.edit_outlined, size: 22, color: Colors.black),
            ),
          ),
        ]),
      ),
    );
  }
}
