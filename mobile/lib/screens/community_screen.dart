import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:video_player/video_player.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import 'member_profile_screen.dart';
import 'post_detail_screen.dart';

const _accent = Color(0xFF1D9BF0);
const _like = Color(0xFFE0263B);

bool _isVideo(String? u) => u != null && RegExp(r'\.(mp4|webm|mov|m4v)($|\?)', caseSensitive: false).hasMatch(u);

class CommunityBody extends StatefulWidget {
  const CommunityBody({super.key});
  @override
  State<CommunityBody> createState() => _CommunityBodyState();
}

class _CommunityBodyState extends State<CommunityBody> {
  int _tab = 0; // 0 = Para você, 1 = Seguindo
  List<Map<String, dynamic>> _posts = [];
  bool _loading = true;
  Map<String, dynamic>? _me;

  final _ctrl = TextEditingController();
  bool _posting = false;
  File? _file;
  bool _fileIsVideo = false;

  @override
  void initState() {
    super.initState();
    ensureProfile().then((p) { if (mounted) setState(() => _me = p); });
    _load();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final d = _tab == 1 ? await fetchFollowingPosts() : await fetchPosts();
    if (mounted) setState(() { _posts = d; _loading = false; });
  }

  void _switch(int t) {
    if (t == _tab) return;
    setState(() => _tab = t);
    _load();
  }

  Future<void> _pickMedia() async {
    final choice = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: const Color(0xFF16181C),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          ListTile(leading: const Icon(Icons.image_outlined), title: const Text('Foto'), onTap: () => Navigator.pop(context, 'img')),
          ListTile(leading: const Icon(Icons.videocam_outlined), title: const Text('Vídeo'), onTap: () => Navigator.pop(context, 'vid')),
        ]),
      ),
    );
    if (choice == null) return;
    final picker = ImagePicker();
    final XFile? x = choice == 'vid'
        ? await picker.pickVideo(source: ImageSource.gallery)
        : await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (x != null && mounted) setState(() { _file = File(x.path); _fileIsVideo = choice == 'vid'; });
  }

  Future<void> _publish() async {
    if (_ctrl.text.trim().isEmpty && _file == null) return;
    setState(() => _posting = true);
    String? url;
    if (_file != null) url = await uploadPostMedia(_file!);
    await createPost(_ctrl.text, imageUrl: url);
    _ctrl.clear();
    setState(() { _file = null; _fileIsVideo = false; });
    await _load();
    if (mounted) setState(() => _posting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Tabs Para você | Seguindo
        Row(
          children: [
            _TabBtn(label: 'Para você', active: _tab == 0, onTap: () => _switch(0)),
            _TabBtn(label: 'Seguindo', active: _tab == 1, onTap: () => _switch(1)),
          ],
        ),
        const Divider(height: 1, color: Colors.white12),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _load,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.zero,
              children: [
                _composer(),
                const Divider(height: 1, color: Colors.white12),
                if (_loading)
                  const Padding(padding: EdgeInsets.all(40), child: Center(child: CircularProgressIndicator()))
                else if (_posts.isEmpty)
                  const Padding(padding: EdgeInsets.all(40), child: Center(child: Text('Seja o primeiro a publicar.', style: TextStyle(color: Colors.white38))))
                else
                  ..._posts.map((p) => _PostRow(post: p, onChanged: _load)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _composer() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          memberAvatar(_me, 20),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: _ctrl,
              minLines: 1,
              maxLines: 5,
              maxLength: 500,
              decoration: const InputDecoration(
                hintText: 'Compartilhe sua opinião…',
                border: InputBorder.none, filled: false, counterText: '',
              ),
            ),
          ),
        ]),
        if (_file != null)
          Padding(
            padding: const EdgeInsets.only(left: 50, top: 6),
            child: Stack(children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: _fileIsVideo
                    ? Container(height: 120, width: 200, color: Colors.black, alignment: Alignment.center, child: const Icon(Icons.play_circle_fill, color: Colors.white70, size: 40))
                    : Image.file(_file!, height: 160, fit: BoxFit.cover),
              ),
              Positioned(
                right: 6, top: 6,
                child: GestureDetector(
                  onTap: () => setState(() { _file = null; _fileIsVideo = false; }),
                  child: Container(padding: const EdgeInsets.all(4), decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle), child: const Icon(Icons.close, size: 16, color: Colors.white)),
                ),
              ),
            ]),
          ),
        Padding(
          padding: const EdgeInsets.only(left: 50, top: 4),
          child: Row(children: [
            IconButton(onPressed: _pickMedia, icon: const Icon(Icons.add_photo_alternate_outlined, color: _accent), tooltip: 'Foto/Vídeo'),
            const Spacer(),
            ElevatedButton(
              onPressed: _posting ? null : _publish,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white, foregroundColor: Colors.black,
                shape: const StadiumBorder(), padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
                textStyle: const TextStyle(fontWeight: FontWeight.w800),
              ),
              child: _posting
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : const Text('Publicar'),
            ),
          ]),
        ),
      ]),
    );
  }
}

class _TabBtn extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _TabBtn({required this.label, required this.active, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          alignment: Alignment.center,
          child: Column(children: [
            Text(label, style: TextStyle(fontWeight: FontWeight.w800, color: active ? Colors.white : Colors.white54)),
            const SizedBox(height: 8),
            Container(height: 3, width: 44, decoration: BoxDecoration(color: active ? _accent : Colors.transparent, borderRadius: BorderRadius.circular(2))),
          ]),
        ),
      ),
    );
  }
}

class _PostRow extends StatefulWidget {
  final Map<String, dynamic> post;
  final VoidCallback onChanged;
  const _PostRow({required this.post, required this.onChanged});
  @override
  State<_PostRow> createState() => _PostRowState();
}

class _PostRowState extends State<_PostRow> {
  late bool _liked = widget.post['likedByMe'] == true;
  late int _count = (widget.post['likeCount'] ?? 0) as int;
  late bool _saved = widget.post['bookmarkedByMe'] == true;
  bool _reposted = false;

  Future<void> _toggleLike() async {
    final n = !_liked;
    setState(() { _liked = n; _count += n ? 1 : -1; });
    await togglePostLike(widget.post['id'], n);
  }

  Future<void> _save() async {
    final n = !_saved;
    setState(() => _saved = n);
    await togglePostBookmark(widget.post['id'], n);
  }

  Future<void> _repost() async {
    setState(() => _reposted = true);
    await repost(widget.post['id']);
    widget.onChanged();
  }

  void _openDetail() => Navigator.push(context, MaterialPageRoute(builder: (_) => PostDetailScreen(post: widget.post)));

  void _openMenu() {
    final mine = widget.post['user_id'] == myId;
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF16181C),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          if (!mine)
            ListTile(
              leading: const Icon(Icons.flag_outlined),
              title: const Text('Denunciar publicação'),
              onTap: () async {
                Navigator.pop(context);
                await reportPost(widget.post['id'], '');
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Denúncia enviada.')));
              },
            ),
          if (mine)
            ListTile(
              leading: const Icon(Icons.delete_outline, color: _like),
              title: const Text('Excluir', style: TextStyle(color: _like)),
              onTap: () async {
                Navigator.pop(context);
                await deletePost(widget.post['id']);
                widget.onChanged();
              },
            ),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.post;
    final author = p['author'] as Map<String, dynamic>?;
    final name = (author?['display_name'] ?? author?['handle'] ?? 'Membro').toString();
    final handle = (author?['handle'] ?? 'membro').toString();
    final content = (p['content'] ?? '').toString();
    final media = p['image_url'] as String?;

    return InkWell(
      onTap: _openDetail,
      child: Container(
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Colors.white12))),
        padding: const EdgeInsets.fromLTRB(12, 12, 6, 8),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          GestureDetector(
            onTap: author == null ? null : () => Navigator.push(context, MaterialPageRoute(builder: (_) => MemberProfileScreen(profile: author))),
            child: memberAvatar(author, 21),
          ),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(
                child: Row(children: [
                  Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15))),
                  if (author?['verified'] == true) Padding(padding: const EdgeInsets.only(left: 4), child: VerifiedBadge(size: 14, tier: author?['verified_tier'])),
                  const SizedBox(width: 5),
                  Flexible(child: Text('@$handle · ${timeAgo(p['created_at'])}', overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white38, fontSize: 13))),
                ]),
              ),
              GestureDetector(onTap: _openMenu, child: const Padding(padding: EdgeInsets.only(left: 6, right: 2), child: Icon(Icons.more_horiz, size: 18, color: Colors.white38))),
            ]),
            if (content.isNotEmpty)
              Padding(padding: const EdgeInsets.only(top: 4), child: Text(content, style: const TextStyle(fontSize: 15, height: 1.35))),
            if (media != null)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: _isVideo(media)
                      ? _PostVideo(url: media)
                      : Image.network(media, errorBuilder: (_, __, ___) => const SizedBox()),
                ),
              ),
            Padding(
              padding: const EdgeInsets.only(top: 8, bottom: 2),
              child: Row(children: [
                _Action(icon: Icons.mode_comment_outlined, onTap: _openDetail),
                _Action(icon: Icons.repeat, color: _reposted ? const Color(0xFF00BA7C) : Colors.white38, onTap: _repost),
                _Action(icon: _liked ? Icons.favorite : Icons.favorite_border, color: _liked ? _like : Colors.white38, label: _count > 0 ? '$_count' : null, onTap: _toggleLike),
                _Action(icon: _saved ? Icons.bookmark : Icons.bookmark_border, color: _saved ? _accent : Colors.white38, onTap: _save),
              ]),
            ),
          ])),
        ]),
      ),
    );
  }
}

class _Action extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String? label;
  final VoidCallback onTap;
  const _Action({required this.icon, required this.onTap, this.color = Colors.white38, this.label});
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(children: [
            Icon(icon, size: 18, color: color),
            if (label != null) Padding(padding: const EdgeInsets.only(left: 6), child: Text(label!, style: TextStyle(color: color, fontSize: 13))),
          ]),
        ),
      ),
    );
  }
}

/// Vídeo do post: autoplay mudo; toque ativa som; tocar de novo pausa.
class _PostVideo extends StatefulWidget {
  final String url;
  const _PostVideo({required this.url});
  @override
  State<_PostVideo> createState() => _PostVideoState();
}

class _PostVideoState extends State<_PostVideo> {
  VideoPlayerController? _c;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    final c = VideoPlayerController.networkUrl(Uri.parse(widget.url));
    _c = c;
    c.initialize().then((_) {
      if (!mounted) return;
      c
        ..setLooping(true)
        ..setVolume(0)
        ..play();
      setState(() => _ready = true);
    }).catchError((_) {});
  }

  @override
  void dispose() {
    _c?.dispose();
    super.dispose();
  }

  void _tap() {
    final c = _c;
    if (c == null || !_ready) return;
    if (c.value.volume == 0) {
      c.setVolume(1);
    } else if (c.value.isPlaying) {
      c.pause();
    } else {
      c.play();
    }
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final c = _c;
    if (!_ready || c == null) {
      return Container(height: 210, color: Colors.black, alignment: Alignment.center, child: const CircularProgressIndicator(strokeWidth: 2));
    }
    return GestureDetector(
      onTap: _tap,
      child: Stack(alignment: Alignment.bottomRight, children: [
        AspectRatio(aspectRatio: c.value.aspectRatio == 0 ? 16 / 9 : c.value.aspectRatio, child: VideoPlayer(c)),
        if (!c.value.isPlaying)
          const Positioned.fill(child: Center(child: Icon(Icons.play_circle_fill, size: 54, color: Colors.white70))),
        Padding(
          padding: const EdgeInsets.all(10),
          child: Container(
            padding: const EdgeInsets.all(6),
            decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
            child: Icon(c.value.volume == 0 ? Icons.volume_off : Icons.volume_up, size: 16, color: Colors.white),
          ),
        ),
      ]),
    );
  }
}
