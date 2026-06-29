import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import 'member_profile_screen.dart';

class PostDetailScreen extends StatefulWidget {
  final Map<String, dynamic> post;
  const PostDetailScreen({super.key, required this.post});
  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  List<Map<String, dynamic>> _replies = [];
  bool _loading = true;
  final _ctrl = TextEditingController();
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final d = await fetchReplies(widget.post['id']);
    if (mounted) setState(() { _replies = d; _loading = false; });
  }

  Future<void> _reply() async {
    final t = _ctrl.text.trim();
    if (t.isEmpty) return;
    setState(() => _sending = true);
    await createReply(widget.post['id'], t);
    _ctrl.clear();
    await _load();
    if (mounted) setState(() => _sending = false);
  }

  Widget _postRow(Map<String, dynamic> p, {bool big = false}) {
    final author = p['author'] as Map<String, dynamic>?;
    final name = (author?['display_name'] ?? author?['handle'] ?? 'Membro').toString();
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Colors.white10))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GestureDetector(
            onTap: author == null ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => MemberProfileScreen(profile: author))),
            child: Row(children: [
              memberAvatar(author, 16),
              const SizedBox(width: 8),
              Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold))),
              if (author?['verified'] == true) const Padding(padding: EdgeInsets.only(left: 4), child: VerifiedBadge(size: 14)),
              const SizedBox(width: 6),
              Text(timeAgo(p['created_at']), style: const TextStyle(color: Colors.white38, fontSize: 12)),
            ]),
          ),
          if ((p['content'] ?? '').toString().isNotEmpty)
            Padding(padding: const EdgeInsets.only(top: 8), child: Text(p['content'], style: TextStyle(fontSize: big ? 17 : 15, height: 1.4))),
          if (p['image_url'] != null)
            Padding(padding: const EdgeInsets.only(top: 10), child: ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.network(p['image_url'], errorBuilder: (_, __, ___) => const SizedBox()))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Publicação"),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              final author = widget.post['author'] as Map<String, dynamic>?;
              final who = author?['display_name'] ?? author?['handle'] ?? 'Monatiza';
              Share.share('"${widget.post['content'] ?? ''}" — $who · MonatizaPro');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _postRow(widget.post, big: true),
                const Padding(
                  padding: EdgeInsets.only(top: 14, bottom: 4),
                  child: Text("RESPOSTAS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white38, letterSpacing: 1.2)),
                ),
                if (_loading)
                  const Padding(padding: EdgeInsets.all(20), child: Center(child: CircularProgressIndicator()))
                else if (_replies.isEmpty)
                  const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Text("Seja o primeiro a responder.", style: TextStyle(color: Colors.white38)))
                else
                  ..._replies.map((r) => _postRow(r)),
              ],
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(10, 6, 10, 6),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      decoration: const InputDecoration(hintText: "Escreva uma resposta…"),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _sending ? null : _reply,
                    icon: _sending ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.send),
                    style: IconButton.styleFrom(backgroundColor: const Color(0xFF9B72CB)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
