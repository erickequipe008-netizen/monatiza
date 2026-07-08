import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../db.dart';
import '../widgets/tone.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import '../widgets/ui.dart';
import 'chat_screen.dart';
import 'post_detail_screen.dart';

const _accent = Color(0xFF8B5CF6);
const _like = Color(0xFFE0263B);

bool _isVideo(String? u) =>
    u != null && RegExp(r'\.(mp4|webm|mov|m4v)($|\?)', caseSensitive: false).hasMatch(u);

/// Perfil de outro membro: capa + avatar sobreposto + infos + posts estilo X.
class MemberProfileScreen extends StatefulWidget {
  final Map<String, dynamic> profile;
  const MemberProfileScreen({super.key, required this.profile});
  @override
  State<MemberProfileScreen> createState() => _MemberProfileScreenState();
}

class _MemberProfileScreenState extends State<MemberProfileScreen> {
  Map<String, dynamic> _p = {};
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
    _p = Map<String, dynamic>.from(widget.profile);
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([
      fetchProfile(_uid),
      _isMe ? Future.value(false) : isFollowing(_uid),
      followCounts(_uid),
      fetchUserPosts(_uid),
    ]);
    if (mounted) {
      setState(() {
        if (results[0] != null) _p = results[0] as Map<String, dynamic>;
        _following = results[1] as bool;
        _counts = results[2] as Map<String, int>;
        _posts = results[3] as List<Map<String, dynamic>>;
        _loading = false;
      });
    }
  }

  Future<void> _toggleFollow() async {
    final n = !_following;
    setState(() {
      _following = n;
      _busy = true;
      _counts['followers'] = (_counts['followers'] ?? 0) + (n ? 1 : -1);
    });
    await follow(_uid, n);
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final name = (_p['display_name'] ?? _p['handle'] ?? 'Membro').toString();
    final handle = (_p['handle'] ?? '').toString();
    final bio = (_p['bio'] ?? '').toString();
    final link = (_p['link'] ?? '').toString();
    final cover = _p['cover_url'] as String?;

    return Scaffold(
      appBar: AppBar(title: Text('@$handle', style: const TextStyle(fontSize: 17))),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  // ---- Capa + avatar sobreposto ----
                  Stack(clipBehavior: Clip.none, children: [
                    Container(
                      height: 128,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF8B5CF6), Color(0xFF0A0A0A)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        image: (cover != null && cover.isNotEmpty)
                            ? DecorationImage(image: NetworkImage(cover), fit: BoxFit.cover)
                            : null,
                      ),
                    ),
                    Positioned(
                      left: 16,
                      bottom: -34,
                      child: GradientAvatarRing(padding: 3, child: memberAvatar(_p, 38)),
                    ),
                  ]),
                  // ---- Ações (Seguir / Mensagem) ----
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
                    child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                      if (!_isMe) ...[
                        SizedBox(
                          height: 36,
                          child: OutlinedButton.icon(
                            onPressed: () => Navigator.push(context,
                                MaterialPageRoute(builder: (_) => ChatScreen(other: _p))),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: t24(context)),
                              shape: const StadiumBorder(),
                              foregroundColor: tInk(context),
                              padding: const EdgeInsets.symmetric(horizontal: 14),
                            ),
                            icon: const Icon(Icons.mail_outline, size: 16),
                            label: const Text('Mensagem',
                                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          height: 36,
                          child: _following
                              ? OutlinedButton(
                                  onPressed: _busy ? null : _toggleFollow,
                                  style: OutlinedButton.styleFrom(
                                    side: BorderSide(color: t24(context)),
                                    shape: const StadiumBorder(),
                                    foregroundColor: tInk(context),
                                    padding: const EdgeInsets.symmetric(horizontal: 18),
                                  ),
                                  child: const Text('Seguindo',
                                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                )
                              : FilledButton(
                                  onPressed: _busy ? null : _toggleFollow,
                                  style: FilledButton.styleFrom(
                                    backgroundColor: tInk(context),
                                    foregroundColor: isDarkC(context) ? Colors.black : Colors.white,
                                    shape: const StadiumBorder(),
                                    padding: const EdgeInsets.symmetric(horizontal: 22),
                                  ),
                                  child: const Text('Seguir',
                                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                                ),
                        ),
                      ],
                    ]),
                  ),
                  const SizedBox(height: 4),
                  // ---- Nome / handle / bio / link / contagens ----
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Flexible(
                            child: Text(name,
                                style: const TextStyle(
                                    fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.3))),
                        if (_p['verified'] == true)
                          Padding(
                              padding: const EdgeInsets.only(left: 6),
                              child: VerifiedBadge(size: 18, tier: _p['verified_tier'])),
                      ]),
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text('@$handle', style: TextStyle(color: t54(context))),
                      ),
                      if (bio.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 10),
                          child: Text(bio, style: const TextStyle(height: 1.45)),
                        ),
                      if (link.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: InkWell(
                            onTap: () => launchUrl(
                              Uri.parse(link.startsWith('http') ? link : 'https://$link'),
                              mode: LaunchMode.externalApplication,
                            ),
                            child: Row(mainAxisSize: MainAxisSize.min, children: [
                              const Icon(Icons.link, size: 16, color: _accent),
                              const SizedBox(width: 4),
                              Flexible(
                                child: Text(link.replaceAll(RegExp(r'^https?://'), ''),
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(color: _accent)),
                              ),
                            ]),
                          ),
                        ),
                      const SizedBox(height: 14),
                      Row(children: [
                        Text('${_counts['following']} ', style: const TextStyle(fontWeight: FontWeight.w800)),
                        Text('Seguindo', style: TextStyle(color: t54(context))),
                        const SizedBox(width: 22),
                        Text('${_counts['followers']} ', style: const TextStyle(fontWeight: FontWeight.w800)),
                        Text('Seguidores', style: TextStyle(color: t54(context))),
                      ]),
                    ]),
                  ),
                  const SizedBox(height: 18),
                  Divider(height: 1, color: t12(context)),
                  // ---- Publicações (estilo X) ----
                  if (_posts.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                          child: Text('Nenhuma publicação ainda.',
                              style: TextStyle(color: t38(context)))),
                    )
                  else
                    ..._posts.map((post) => _MemberPost(post: post, author: _p)),
                  const SizedBox(height: 30),
                ],
              ),
            ),
    );
  }
}

class _MemberPost extends StatefulWidget {
  final Map<String, dynamic> post;
  final Map<String, dynamic> author;
  const _MemberPost({required this.post, required this.author});
  @override
  State<_MemberPost> createState() => _MemberPostState();
}

class _MemberPostState extends State<_MemberPost> {
  late bool _liked = widget.post['likedByMe'] == true;
  late int _count = (widget.post['likeCount'] ?? 0) as int;
  late bool _saved = widget.post['bookmarkedByMe'] == true;

  Future<void> _toggleLike() async {
    final n = !_liked;
    setState(() {
      _liked = n;
      _count += n ? 1 : -1;
    });
    await togglePostLike(widget.post['id'], n);
  }

  Future<void> _toggleSave() async {
    final n = !_saved;
    setState(() => _saved = n);
    await togglePostBookmark(widget.post['id'], n);
  }

  void _detail() => Navigator.push(
      context, MaterialPageRoute(builder: (_) => PostDetailScreen(post: widget.post)));

  @override
  Widget build(BuildContext context) {
    final p = widget.post;
    final a = widget.author;
    final name = (a['display_name'] ?? a['handle'] ?? 'Membro').toString();
    final handle = (a['handle'] ?? '').toString();
    final content = (p['content'] ?? '').toString();
    final media = p['image_url'] as String?;
    return InkWell(
      onTap: _detail,
      child: Container(
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: t12(context)))),
        padding: const EdgeInsets.fromLTRB(16, 12, 10, 6),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          memberAvatar(a, 21),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Flexible(
                    child: Text(name,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15))),
                if (a['verified'] == true)
                  Padding(
                      padding: const EdgeInsets.only(left: 4),
                      child: VerifiedBadge(size: 14, tier: a['verified_tier'])),
                const SizedBox(width: 5),
                Flexible(
                    child: Text('@$handle · ${timeAgo(p['created_at'])}',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: t38(context), fontSize: 13))),
              ]),
              if (content.isNotEmpty)
                Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(content, style: const TextStyle(fontSize: 15, height: 1.35))),
              if (media != null)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: _isVideo(media)
                        ? GestureDetector(
                            onTap: _detail,
                            child: Container(
                                height: 200,
                                color: Colors.black,
                                alignment: Alignment.center,
                                child: const Icon(Icons.play_circle_fill,
                                    size: 50, color: Colors.white70)),
                          )
                        : Image.network(media, errorBuilder: (_, __, ___) => const SizedBox()),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.only(top: 8, bottom: 2),
                child: Row(children: [
                  _act(Icons.mode_comment_outlined, t38(context), null, _detail),
                  _act(_liked ? Icons.favorite : Icons.favorite_border,
                      _liked ? _like : t38(context), _count > 0 ? '$_count' : null, _toggleLike),
                  _act(_saved ? Icons.bookmark : Icons.bookmark_border,
                      _saved ? _accent : t38(context), null, _toggleSave),
                  const Spacer(),
                ]),
              ),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _act(IconData icon, Color color, String? label, VoidCallback onTap) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.only(right: 28, top: 6, bottom: 6),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 18, color: color),
            if (label != null)
              Padding(
                  padding: const EdgeInsets.only(left: 6),
                  child: Text(label, style: TextStyle(color: color, fontSize: 13))),
          ]),
        ),
      );
}
