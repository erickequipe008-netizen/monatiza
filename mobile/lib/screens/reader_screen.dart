import 'package:flutter/material.dart';
import '../config.dart';
import '../db.dart';

class ReaderScreen extends StatefulWidget {
  final Map<String, dynamic> article;
  const ReaderScreen({super.key, required this.article});
  @override
  State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
  String? _body;
  bool _loading = true;
  bool _saved = false;
  bool _liked = false;

  int get _id => widget.article['id'] as int;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([
      fetchArticleBody(widget.article['slug']),
      isBookmarked(_id),
      isArticleLiked(_id),
    ]);
    recordView(_id);
    if (mounted) {
      setState(() {
        _body = results[0] as String?;
        _saved = results[1] as bool;
        _liked = results[2] as bool;
        _loading = false;
      });
    }
  }

  String _plain(String html) => html
      .replaceAll(RegExp(r'</p>|<br\s*/?>', caseSensitive: false), '\n\n')
      .replaceAll(RegExp(r'<[^>]+>'), '')
      .trim();

  @override
  Widget build(BuildContext context) {
    final a = widget.article;
    final locked = (a['is_premium'] == true) && (_body == null) && !_loading;
    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
            tooltip: "Salvar",
            icon: Icon(_saved ? Icons.bookmark : Icons.bookmark_border, color: _saved ? const Color(kAccent) : null),
            onPressed: () async {
              final n = !_saved;
              setState(() => _saved = n);
              await toggleBookmark(_id, n);
            },
          ),
          IconButton(
            tooltip: "Curtir",
            icon: Icon(_liked ? Icons.favorite : Icons.favorite_border, color: _liked ? const Color(0xFFE0263B) : null),
            onPressed: () async {
              final n = !_liked;
              setState(() => _liked = n);
              await toggleArticleLike(_id, n);
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text((a['category'] ?? '').toString().toUpperCase(),
              style: const TextStyle(color: Color(0xFFFF5C8A), fontSize: 11, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text(a['title'] ?? '', style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, height: 1.15)),
          const SizedBox(height: 16),
          if (a['image_url'] != null)
            ClipRRect(borderRadius: BorderRadius.circular(14), child: Image.network(a['image_url'], errorBuilder: (_, __, ___) => const SizedBox())),
          const SizedBox(height: 20),
          if (_loading)
            const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
          else if (locked)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white12),
              ),
              child: const Column(children: [
                Icon(Icons.lock_outline, color: Color(kAccent)),
                SizedBox(height: 12),
                Text('Conteúdo de assinante', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800), textAlign: TextAlign.center),
                SizedBox(height: 8),
                Text('Assine a Monatiza para ler esta e outras matérias exclusivas.',
                    style: TextStyle(color: Colors.white60), textAlign: TextAlign.center),
              ]),
            )
          else
            Text(_plain(_body ?? ''), style: const TextStyle(fontSize: 17, height: 1.7, color: Color(0xFFD4D4D8))),
        ],
      ),
    );
  }
}
