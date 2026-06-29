import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';

class MemberProfileScreen extends StatefulWidget {
  final Map<String, dynamic> profile;
  const MemberProfileScreen({super.key, required this.profile});
  @override
  State<MemberProfileScreen> createState() => _MemberProfileScreenState();
}

class _MemberProfileScreenState extends State<MemberProfileScreen> {
  bool _following = false;
  bool _busy = false;
  Map<String, int> _counts = {'followers': 0, 'following': 0};
  List<Map<String, dynamic>> _posts = [];
  bool _loading = true;

  String get _uid => widget.profile['user_id'];
  bool get _isMe => myId == _uid;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([
      _isMe ? Future.value(false) : isFollowing(_uid),
      followCounts(_uid),
      fetchUserPosts(_uid),
    ]);
    if (mounted) {
      setState(() {
        _following = results[0] as bool;
        _counts = results[1] as Map<String, int>;
        _posts = results[2] as List<Map<String, dynamic>>;
        _loading = false;
      });
    }
  }

  Future<void> _toggleFollow() async {
    final n = !_following;
    setState(() { _following = n; _busy = true; _counts['followers'] = (_counts['followers'] ?? 0) + (n ? 1 : -1); });
    await follow(_uid, n);
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.profile;
    final name = (p['display_name'] ?? p['handle'] ?? 'Membro').toString();
    return Scaffold(
      appBar: AppBar(title: Text("@${p['handle'] ?? ''}")),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(children: [
                  memberAvatar(p, 36),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          Flexible(child: Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800))),
                          if (p['verified'] == true) const Padding(padding: EdgeInsets.only(left: 6), child: VerifiedBadge(size: 18)),
                        ]),
                        Text("@${p['handle'] ?? ''}", style: const TextStyle(color: Colors.white38)),
                      ],
                    ),
                  ),
                ]),
                if ((p['bio'] ?? '').toString().isNotEmpty)
                  Padding(padding: const EdgeInsets.only(top: 12), child: Text(p['bio'], style: const TextStyle(color: Colors.white70, height: 1.4))),
                const SizedBox(height: 12),
                Row(children: [
                  Text("${_counts['followers']} ", style: const TextStyle(fontWeight: FontWeight.bold)),
                  const Text("seguidores   ", style: TextStyle(color: Colors.white54)),
                  Text("${_counts['following']} ", style: const TextStyle(fontWeight: FontWeight.bold)),
                  const Text("seguindo", style: TextStyle(color: Colors.white54)),
                ]),
                const SizedBox(height: 14),
                if (!_isMe)
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _busy ? null : _toggleFollow,
                      style: FilledButton.styleFrom(backgroundColor: _following ? Colors.white24 : const Color(0xFF9B72CB)),
                      child: Text(_following ? "Seguindo" : "Seguir"),
                    ),
                  ),
                const SizedBox(height: 22),
                const Text("PUBLICAÇÕES", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white54, letterSpacing: 1.2)),
                const SizedBox(height: 10),
                if (_posts.isEmpty)
                  const Padding(padding: EdgeInsets.symmetric(vertical: 24), child: Text("Nenhuma publicação ainda.", style: TextStyle(color: Colors.white38)))
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
