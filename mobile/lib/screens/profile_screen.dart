import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import '../widgets/ui.dart';
import 'biblioteca_screen.dart';
import 'article_list_screen.dart';
import 'newsletter_screen.dart';
import 'verificacao_screen.dart';
import 'conta_screen.dart';

class ProfileBody extends StatefulWidget {
  const ProfileBody({super.key});
  @override
  State<ProfileBody> createState() => _ProfileBodyState();
}

class _ProfileBodyState extends State<ProfileBody> {
  Map<String, dynamic>? _profile;
  List<Map<String, dynamic>> _posts = [];
  Map<String, int> _counts = {'followers': 0, 'following': 0};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prof = await ensureProfile();
    List<Map<String, dynamic>> posts = [];
    Map<String, int> counts = {'followers': 0, 'following': 0};
    if (prof != null) {
      posts = await fetchUserPosts(prof['user_id']);
      counts = await followCounts(prof['user_id']);
    }
    if (mounted) setState(() { _profile = prof; _posts = posts; _counts = counts; _loading = false; });
  }

  Widget _tile(BuildContext c, IconData icon, String label, Widget screen) => ListTile(
        leading: Icon(icon, color: Colors.white70),
        title: Text(label),
        trailing: const Icon(Icons.chevron_right, color: Colors.white24),
        onTap: () => Navigator.push(c, MaterialPageRoute(builder: (_) => screen)),
      );

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    final p = _profile;
    final name = (p?['display_name'] ?? p?['handle'] ?? 'Membro').toString();
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                colors: [const Color(0xFF9B72CB).withValues(alpha: 0.18), Colors.white.withValues(alpha: 0.03)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GradientAvatarRing(child: memberAvatar(p, 34)),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [
                            Flexible(child: Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800))),
                            if (p?['verified'] == true) const Padding(padding: EdgeInsets.only(left: 6), child: VerifiedBadge(size: 18)),
                          ]),
                          Text("@${p?['handle'] ?? ''}", style: const TextStyle(color: Colors.white60)),
                        ],
                      ),
                    ),
                  ],
                ),
                if ((p?['bio'] ?? '').toString().isNotEmpty)
                  Padding(padding: const EdgeInsets.only(top: 12), child: Text(p!['bio'], style: const TextStyle(color: Colors.white70, height: 1.4))),
                const SizedBox(height: 14),
                Row(children: [
                  Text("${_counts['followers']} ", style: const TextStyle(fontWeight: FontWeight.bold)),
                  const Text("seguidores     ", style: TextStyle(color: Colors.white54)),
                  Text("${_counts['following']} ", style: const TextStyle(fontWeight: FontWeight.bold)),
                  const Text("seguindo", style: TextStyle(color: Colors.white54)),
                ]),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(16)),
            child: Column(children: [
              _tile(context, Icons.bookmark_border, "Biblioteca", const BibliotecaScreen()),
              _tile(context, Icons.menu_book_outlined, "Revistas", ArticleListScreen(title: "Revistas", load: () => fetchByCategory("%Revista%"))),
              _tile(context, Icons.workspace_premium_outlined, "Exclusivo", ArticleListScreen(title: "Exclusivo", load: fetchPremium)),
              _tile(context, Icons.mail_outline, "Newsletter", const NewsletterScreen()),
              _tile(context, Icons.verified_outlined, "Verificação", const VerificacaoScreen()),
              _tile(context, Icons.account_circle_outlined, "Minha conta", const ContaScreen()),
            ]),
          ),
          const SizedBox(height: 22),
          const Text("MINHAS PUBLICAÇÕES",
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white54, letterSpacing: 1.2)),
          const SizedBox(height: 10),
          if (_posts.isEmpty)
            const Padding(padding: EdgeInsets.symmetric(vertical: 24), child: Text("Você ainda não publicou nada.", style: TextStyle(color: Colors.white38)))
          else
            ..._posts.map((post) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(14)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(timeAgo(post['created_at']), style: const TextStyle(color: Colors.white38, fontSize: 12)),
                      if ((post['content'] ?? '').toString().isNotEmpty)
                        Padding(padding: const EdgeInsets.only(top: 4), child: Text(post['content'])),
                      if (post['image_url'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: ClipRRect(borderRadius: BorderRadius.circular(10), child: Image.network(post['image_url'], errorBuilder: (_, __, ___) => const SizedBox())),
                        ),
                    ],
                  ),
                )),
        ],
      ),
    );
  }
}
