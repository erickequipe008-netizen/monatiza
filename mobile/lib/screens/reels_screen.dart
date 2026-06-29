import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';

class ReelsBody extends StatefulWidget {
  const ReelsBody({super.key});
  @override
  State<ReelsBody> createState() => _ReelsBodyState();
}

class _ReelsBodyState extends State<ReelsBody> {
  List<Map<String, dynamic>> _reels = [];
  bool _loading = true;
  int _current = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final d = await fetchReels();
    if (mounted) setState(() { _reels = d; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_reels.isEmpty) {
      return const Center(child: Text("Nenhum vídeo ainda.", style: TextStyle(color: Colors.white38)));
    }
    return PageView.builder(
      scrollDirection: Axis.vertical,
      itemCount: _reels.length,
      onPageChanged: (i) => setState(() => _current = i),
      itemBuilder: (c, i) => _ReelPage(reel: _reels[i], active: i == _current),
    );
  }
}

class _ReelPage extends StatefulWidget {
  final Map<String, dynamic> reel;
  final bool active;
  const _ReelPage({required this.reel, required this.active});
  @override
  State<_ReelPage> createState() => _ReelPageState();
}

class _ReelPageState extends State<_ReelPage> {
  VideoPlayerController? _c;
  bool _ready = false;
  late bool _liked = widget.reel['likedByMe'] == true;
  late int _count = (widget.reel['likeCount'] ?? 0) as int;

  @override
  void initState() {
    super.initState();
    final url = widget.reel['video_url'];
    if (url != null) {
      _c = VideoPlayerController.networkUrl(Uri.parse(url))
        ..setLooping(true)
        ..initialize().then((_) {
          if (mounted) {
            setState(() => _ready = true);
            if (widget.active) _c!.play();
          }
        });
    }
  }

  @override
  void didUpdateWidget(covariant _ReelPage old) {
    super.didUpdateWidget(old);
    if (_c != null && _ready) {
      if (widget.active) {
        _c!.play();
      } else {
        _c!.pause();
        _c!.seekTo(Duration.zero);
      }
    }
  }

  @override
  void dispose() {
    _c?.dispose();
    super.dispose();
  }

  Future<void> _like() async {
    final n = !_liked;
    setState(() { _liked = n; _count += n ? 1 : -1; });
    await toggleReelLike(widget.reel['id'], n);
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.reel;
    final author = r['author'] as Map<String, dynamic>?;
    final name = (author?['display_name'] ?? author?['handle'] ?? 'Membro').toString();
    return GestureDetector(
      onTap: () {
        if (_c != null && _ready) {
          setState(() => _c!.value.isPlaying ? _c!.pause() : _c!.play());
        }
      },
      child: Container(
        color: Colors.black,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (_ready && _c != null)
              FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(width: _c!.value.size.width, height: _c!.value.size.height, child: VideoPlayer(_c!)),
              )
            else
              const Center(child: CircularProgressIndicator()),
            Positioned(
              left: 16,
              right: 80,
              bottom: 24,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(children: [
                    memberAvatar(author, 16),
                    const SizedBox(width: 8),
                    Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                    if (author?['verified'] == true) const Padding(padding: EdgeInsets.only(left: 4), child: VerifiedBadge(size: 14)),
                  ]),
                  if ((r['caption'] ?? '').toString().isNotEmpty)
                    Padding(padding: const EdgeInsets.only(top: 8), child: Text(r['caption'], style: const TextStyle(color: Colors.white))),
                ],
              ),
            ),
            Positioned(
              right: 12,
              bottom: 40,
              child: Column(
                children: [
                  IconButton(
                    onPressed: _like,
                    icon: Icon(_liked ? Icons.favorite : Icons.favorite_border, color: _liked ? const Color(0xFFE0263B) : Colors.white, size: 32),
                  ),
                  Text("$_count", style: const TextStyle(color: Colors.white)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
