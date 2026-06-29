import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';

class CommunityBody extends StatefulWidget {
  const CommunityBody({super.key});
  @override
  State<CommunityBody> createState() => _CommunityBodyState();
}

class _CommunityBodyState extends State<CommunityBody> {
  List<Map<String, dynamic>> _posts = [];
  bool _loading = true;
  final _ctrl = TextEditingController();
  bool _posting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final d = await fetchPosts();
    if (mounted) setState(() { _posts = d; _loading = false; });
  }

  Future<void> _publish() async {
    if (_ctrl.text.trim().isEmpty) return;
    setState(() => _posting = true);
    await createPost(_ctrl.text);
    _ctrl.clear();
    await _load();
    if (mounted) setState(() => _posting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _ctrl,
                  minLines: 1,
                  maxLines: 4,
                  decoration: const InputDecoration(hintText: "Compartilhe sua opinião…", border: OutlineInputBorder()),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: _posting ? null : _publish,
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF9B72CB)),
                child: Text(_posting ? "…" : "Publicar"),
              ),
            ],
          ),
        ),
        const Divider(height: 1, color: Colors.white12),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _posts.isEmpty
                      ? ListView(children: const [Padding(padding: EdgeInsets.all(40), child: Center(child: Text("Seja o primeiro a publicar.", style: TextStyle(color: Colors.white38))))])
                      : ListView.builder(
                          padding: const EdgeInsets.all(12),
                          itemCount: _posts.length,
                          itemBuilder: (c, i) => _PostTile(post: _posts[i]),
                        ),
                ),
        ),
      ],
    );
  }
}

class _PostTile extends StatefulWidget {
  final Map<String, dynamic> post;
  const _PostTile({required this.post});
  @override
  State<_PostTile> createState() => _PostTileState();
}

class _PostTileState extends State<_PostTile> {
  late bool _liked = widget.post['likedByMe'] == true;
  late int _count = (widget.post['likeCount'] ?? 0) as int;

  Future<void> _like() async {
    final n = !_liked;
    setState(() { _liked = n; _count += n ? 1 : -1; });
    await togglePostLike(widget.post['id'], n);
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.post;
    final author = p['author'] as Map<String, dynamic>?;
    final name = (author?['display_name'] ?? author?['handle'] ?? 'Membro').toString();
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              memberAvatar(author, 18),
              const SizedBox(width: 8),
              Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold))),
              if (author?['verified'] == true) const Padding(padding: EdgeInsets.only(left: 4), child: VerifiedBadge(size: 14)),
              const SizedBox(width: 6),
              Expanded(
                child: Text("@${author?['handle'] ?? ''} · ${timeAgo(p['created_at'])}",
                    overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white38, fontSize: 12)),
              ),
            ],
          ),
          if ((p['content'] ?? '').toString().isNotEmpty)
            Padding(padding: const EdgeInsets.only(top: 8), child: Text(p['content'], style: const TextStyle(fontSize: 15, height: 1.4))),
          if (p['image_url'] != null)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.network(p['image_url'], errorBuilder: (_, __, ___) => const SizedBox())),
            ),
          const SizedBox(height: 8),
          InkWell(
            onTap: _like,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(_liked ? Icons.favorite : Icons.favorite_border, size: 18, color: _liked ? const Color(0xFFE0263B) : Colors.white38),
                const SizedBox(width: 6),
                Text("$_count", style: const TextStyle(color: Colors.white54)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
