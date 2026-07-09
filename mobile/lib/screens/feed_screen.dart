import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../db.dart';
import '../main.dart';
import '../widgets/avatar.dart';
import 'reader_screen.dart';
import 'search_screen.dart';
import 'compose_screen.dart';
import 'people_screen.dart';
import 'member_profile_screen.dart';
import 'article_list_screen.dart';
import 'profile_screen.dart';

const _accent = Color(0xFF8B5CF6);

/// Início — saudação, pessoas, composer e destaques (estilo apps premium).
class FeedBody extends StatefulWidget {
  const FeedBody({super.key});
  @override
  State<FeedBody> createState() => _FeedBodyState();
}

class _FeedBodyState extends State<FeedBody> {
  Map<String, dynamic>? _me;
  List<Map<String, dynamic>> _people = [];
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;
  RealtimeChannel? _rt;

  @override
  void initState() {
    super.initState();
    _load();
    // Tempo real: matéria nova e conta nova aparecem sozinhas.
    _rt = Supabase.instance.client
        .channel('rt-home')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'articles',
          callback: (_) { if (mounted) _load(); },
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'community_profiles',
          callback: (_) { if (mounted) _load(); },
        )
        .subscribe();
  }

  @override
  void dispose() {
    final ch = _rt;
    if (ch != null) Supabase.instance.client.removeChannel(ch);
    super.dispose();
  }

  Future<void> _load() async {
    final results = await Future.wait([
      ensureProfile(),
      recommendedProfiles(),
      fetchArticles(),
    ]);
    if (mounted) {
      setState(() {
        _me = results[0] as Map<String, dynamic>?;
        _people = (results[1] as List<Map<String, dynamic>>).take(12).toList();
        _items = results[2] as List<Map<String, dynamic>>;
        _loading = false;
      });
    }
  }

  void _push(Widget s) => Navigator.push(context, MaterialPageRoute(builder: (_) => s));

  Widget _circleBtn(bool dark, IconData icon, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: dark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05),
            border: Border.all(color: dark ? Colors.white12 : Colors.black12),
          ),
          child: Icon(icon, size: 20, color: dark ? Colors.white70 : Colors.black54),
        ),
      );

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    final dark = Theme.of(context).brightness == Brightness.dark;
    final destaque = _items.isNotEmpty ? _items.first : null;
    final rest = _items.length > 1 ? _items.sublist(1) : <Map<String, dynamic>>[];

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 28),
          children: [
            // ---- Topo: avatar + tema + busca ----
            Row(children: [
              GestureDetector(
                onTap: () => _push(Scaffold(
                  appBar: AppBar(title: const Text('Perfil', style: TextStyle(fontSize: 17))),
                  body: const ProfileBody(),
                )),
                child: memberAvatar(_me, 21),
              ),
              const Spacer(),
              // Alternar claro/escuro
              _circleBtn(dark, dark ? Icons.light_mode_outlined : Icons.dark_mode_outlined, toggleTheme),
              const SizedBox(width: 10),
              _circleBtn(dark, Icons.search, () => _push(const SearchScreen())),
            ]),
            const SizedBox(height: 20),
            // ---- Título grande em dois tons ----
            Text.rich(
              TextSpan(children: [
                TextSpan(text: 'Seu mundo,\n', style: TextStyle(color: dark ? Colors.white : const Color(0xFF0B0B10))),
                TextSpan(text: 'bem informado.', style: TextStyle(color: dark ? Colors.white38 : Colors.black38)),
              ]),
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, height: 1.18, letterSpacing: -0.6),
            ),
            const SizedBox(height: 18),
            // ---- Pessoas (sugestões) ----
            if (_people.isNotEmpty) ...[
              SizedBox(
                height: 92,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _PersonBubble(
                      label: 'Descobrir',
                      child: Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: dark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05),
                          border: Border.all(color: dark ? Colors.white24 : Colors.black26),
                        ),
                        child: Icon(Icons.add, size: 24, color: dark ? Colors.white70 : Colors.black54),
                      ),
                      onTap: () => _push(const PeopleScreen()),
                    ),
                    ..._people.map((p) => _PersonBubble(
                          label: (p['display_name'] ?? p['handle'] ?? '').toString().split(' ').first,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: _accent.withOpacity(0.6), width: 1.6),
                            ),
                            child: memberAvatar(p, 25),
                          ),
                          onTap: () => _push(MemberProfileScreen(profile: p)),
                        )),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            // ---- Composer ----
            Material(
              color: dark ? Colors.white.withOpacity(0.05) : Colors.white,
              clipBehavior: Clip.antiAlias,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(color: dark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.08)),
              ),
              child: InkWell(
                onTap: () => _push(const ComposeScreen()),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(children: [
                    memberAvatar(_me, 17),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text('Comece uma publicação…',
                          style: TextStyle(color: dark ? Colors.white38 : Colors.black38, fontSize: 14.5)),
                    ),
                    Icon(Icons.image_outlined, size: 20, color: dark ? Colors.white38 : Colors.black38),
                    const SizedBox(width: 14),
                    Container(
                      width: 34,
                      height: 34,
                      decoration: const BoxDecoration(shape: BoxShape.circle, color: _accent),
                      child: const Icon(Icons.edit, size: 16, color: Colors.white),
                    ),
                  ]),
                ),
              ),
            ),
            const SizedBox(height: 16),
            // ---- Cartões: destaque + atalhos (mesmo tamanho, mais presença) ----
            if (destaque != null)
              SizedBox(
                height: 208,
                child: Row(children: [
                  Expanded(
                    child: _HeroCard(article: destaque, onTap: () => _push(ReaderScreen(article: destaque))),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(children: [
                      Expanded(
                        child: _MiniCard(
                          icon: Icons.workspace_premium,
                          iconColor: const Color(0xFFC9A24B),
                          title: 'Exclusivo',
                          subtitle: 'Para assinantes',
                          onTap: () => _push(ArticleListScreen(title: 'Exclusivo', load: fetchPremium)),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Expanded(
                        child: _MiniCard(
                          icon: Icons.menu_book_outlined,
                          iconColor: _accent,
                          title: 'Revistas',
                          subtitle: 'Edições especiais',
                          onTap: () => _push(ArticleListScreen(title: 'Revistas', load: () => fetchByCategory('%Revista%'))),
                        ),
                      ),
                    ]),
                  ),
                ]),
              ),
            const SizedBox(height: 26),
            // ---- Últimas notícias ----
            Text('ÚLTIMAS NOTÍCIAS',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: dark ? Colors.white54 : Colors.black45,
                    letterSpacing: 1.2)),
            const SizedBox(height: 12),
            ...rest.map((a) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: _ArticleCard(article: a),
                )),
            if (_items.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Center(
                    child: Text('Nada por aqui ainda.',
                        style: TextStyle(color: dark ? Colors.white38 : Colors.black38))),
              ),
          ],
        ),
      ),
    );
  }
}

class _PersonBubble extends StatelessWidget {
  final String label;
  final Widget child;
  final VoidCallback onTap;
  const _PersonBubble({required this.label, required this.child, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.only(right: 14),
        child: Column(children: [
          child,
          const SizedBox(height: 6),
          SizedBox(
            width: 60,
            child: Text(label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, color: dark ? Colors.white70 : Colors.black87)),
          ),
        ]),
      ),
    );
  }
}

/// Cartão grande do destaque do dia (imagem de fundo + título).
class _HeroCard extends StatelessWidget {
  final Map<String, dynamic> article;
  final VoidCallback onTap;
  const _HeroCard({required this.article, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final a = article;
    return Material(
      clipBehavior: Clip.antiAlias,
      borderRadius: BorderRadius.circular(22),
      color: const Color(0xFF101216),
      child: InkWell(
        onTap: onTap,
        child: Stack(fit: StackFit.expand, children: [
          if (a['image_url'] != null)
            Image.network(a['image_url'], fit: BoxFit.cover, cacheWidth: 640,
                errorBuilder: (_, __, ___) => const SizedBox()),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.transparent, Colors.black87],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0.35, 1],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.end, children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: _accent, borderRadius: BorderRadius.circular(20)),
                child: Text((a['category'] ?? 'DESTAQUE').toString().toUpperCase(),
                    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.4)),
              ),
              const SizedBox(height: 8),
              Text(a['title'] ?? '',
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w800, height: 1.2, color: Colors.white)),
            ]),
          ),
        ]),
      ),
    );
  }
}

class _MiniCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  const _MiniCard({required this.icon, required this.iconColor, required this.title, required this.subtitle, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Material(
      color: dark ? Colors.white.withOpacity(0.05) : Colors.white,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(22),
        side: BorderSide(color: dark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.08)),
      ),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          // Conteúdo agrupado no centro — sem vão no meio do quadro.
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(9),
                decoration: BoxDecoration(color: iconColor.withOpacity(0.15), shape: BoxShape.circle),
                child: Icon(icon, size: 21, color: iconColor),
              ),
              const SizedBox(height: 8),
              Text(title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15.5)),
              const SizedBox(height: 2),
              Text(subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: dark ? Colors.white38 : Colors.black45, fontSize: 11)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Card padrão de notícia (imagem em cima, categoria, título, resumo).
class _ArticleCard extends StatelessWidget {
  final Map<String, dynamic> article;
  const _ArticleCard({required this.article});

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final a = article;
    final category = (a['category'] ?? '').toString();
    final excerpt = (a['excerpt'] ?? '').toString();
    final premium = a['is_premium'] == true;

    return Material(
      color: dark ? Colors.white.withOpacity(0.05) : Colors.white,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: dark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.08)),
      ),
      child: InkWell(
        onTap: () => Navigator.push(
            context, MaterialPageRoute(builder: (_) => ReaderScreen(article: a))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (a['image_url'] != null)
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Image.network(a['image_url'], fit: BoxFit.cover, cacheWidth: 1000,
                  errorBuilder: (_, __, ___) => Container(color: Colors.white10)),
            ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (category.isNotEmpty || premium)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(children: [
                    if (category.isNotEmpty)
                      Text(category.toUpperCase(),
                          style: const TextStyle(
                              color: _accent, fontSize: 10.5, fontWeight: FontWeight.w800, letterSpacing: 0.6)),
                    if (premium)
                      const Padding(
                        padding: EdgeInsets.only(left: 6),
                        child: Icon(Icons.workspace_premium, size: 13, color: Color(0xFFC9A24B)),
                      ),
                  ]),
                ),
              Text(a['title'] ?? '',
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 17.5, fontWeight: FontWeight.w800, height: 1.22, letterSpacing: -0.2)),
              if (excerpt.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(excerpt,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: dark ? Colors.white54 : Colors.black54, fontSize: 13.5, height: 1.4)),
                ),
            ]),
          ),
        ]),
      ),
    );
  }
}
