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
    showAboutDialog(
      context: context,
      applicationName: 'Monatiza',
      applicationVersion: '2.4.0',
      applicationLegalese: '© 2026 Monatiza — notícias e comunidade.',
      applicationIcon: Container(
        width: 44,
        height: 44,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white12),
        ),
        child: const Text('m', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
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
      appBar: AppBar(
        title: _i == 0
            ? const Text('monatiza', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 22, letterSpacing: -0.5))
            : Text(_titles[_i], style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 19)),
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

/// Barra inferior minimalista: ícones pequenos, rótulo discreto,
/// ativo em branco com leve "pop" animado (estilo X/Threads).
class _NavBar extends StatelessWidget {
  final int index;
  final ValueChanged<int> onTap;
  const _NavBar({required this.index, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF000000),
        border: Border(top: BorderSide(color: Colors.white10, width: 0.6)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 58,
          child: Row(children: [
            _NavItem(active: index == 0, icon: Icons.article_outlined, activeIcon: Icons.article, label: 'Notícias', onTap: () => onTap(0)),
            _NavItem(active: index == 1, icon: Icons.people_outline, activeIcon: Icons.people, label: 'Comunidade', onTap: () => onTap(1)),
            _NavItem(active: index == 2, icon: Icons.mail_outline, activeIcon: Icons.mail, label: 'Mensagens', onTap: () => onTap(2)),
            _NavItem(active: index == 3, icon: Icons.explore_outlined, activeIcon: Icons.explore, label: 'Descobrir', onTap: () => onTap(3)),
            _NavItem(active: index == 4, icon: Icons.person_outline, activeIcon: Icons.person, label: 'Perfil', onTap: () => onTap(4)),
          ]),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final bool active;
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final VoidCallback onTap;
  const _NavItem({required this.active, required this.icon, required this.activeIcon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: active ? 1.0 : 0.0),
          duration: const Duration(milliseconds: 260),
          curve: Curves.easeOutCubic,
          builder: (context, t, _) {
            final color = Color.lerp(Colors.white38, Colors.white, t)!;
            return Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Transform.scale(
                scale: 0.92 + 0.08 * t,
                child: Icon(t > 0.5 ? activeIcon : icon, size: 23, color: color),
              ),
              const SizedBox(height: 3),
              Text(label,
                  style: TextStyle(
                      fontSize: 10,
                      color: color,
                      fontWeight: t > 0.5 ? FontWeight.w700 : FontWeight.w500,
                      letterSpacing: 0.1)),
            ]);
          },
        ),
      ),
    );
  }
}
