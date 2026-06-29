import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';

class ProfileBody extends StatefulWidget {
  const ProfileBody({super.key});
  @override
  State<ProfileBody> createState() => _ProfileBodyState();
}

class _ProfileBodyState extends State<ProfileBody> {
  Map<String, dynamic>? _profile;
  List<Map<String, dynamic>> _posts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prof = await ensureProfile();
    List<Map<String, dynamic>> posts = [];
    if (prof != null) posts = await fetchUserPosts(prof['user_id']);
    if (mounted) setState(() { _profile = prof; _posts = posts; _loading = false; });
  }

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
          Row(
            children: [
              memberAvatar(p, 36),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Flexible(child: Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800))),
                      if (p?['verified'] == true) const Padding(padding: EdgeInsets.only(left: 6), child: VerifiedBadge(size: 18)),
                    ]),
                    Text("@${p?['handle'] ?? ''}", style: const TextStyle(color: Colors.white38)),
                  ],
                ),
              ),
            ],
          ),
          if ((p?['bio'] ?? '').toString().isNotEmpty)
            Padding(padding: const EdgeInsets.only(top: 12), child: Text(p!['bio'], style: const TextStyle(color: Colors.white70, height: 1.4))),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () => Supabase.instance.client.auth.signOut(),
            icon: const Icon(Icons.logout, size: 18),
            label: const Text("Sair"),
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
