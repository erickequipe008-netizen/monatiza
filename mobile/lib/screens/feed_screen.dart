import 'package:flutter/material.dart';
import '../db.dart';
import 'reader_screen.dart';

const _accent = Color(0xFF1D9BF0);

class FeedBody extends StatefulWidget {
  const FeedBody({super.key});
  @override
  State<FeedBody> createState() => _FeedBodyState();
}

class _FeedBodyState extends State<FeedBody> {
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final d = await fetchArticles();
    if (mounted) setState(() { _items = d; _loading = false; });
  }

  void _open(BuildContext c, Map<String, dynamic> a) =>
      Navigator.push(c, MaterialPageRoute(builder: (_) => ReaderScreen(article: a)));

  Widget _cat(Map<String, dynamic> a) => Row(children: [
        Text((a['category'] ?? '').toString().toUpperCase(),
            style: const TextStyle(color: _accent, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
        if (a['is_premium'] == true)
          const Padding(padding: EdgeInsets.only(left: 6), child: Icon(Icons.workspace_premium, size: 13, color: Color(0xFFC9A24B))),
      ]);

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const Divider(height: 26, color: Colors.white12),
        itemBuilder: (c, i) {
          final a = _items[i];
          // Primeira matéria em destaque (hero)
          if (i == 0) {
            return InkWell(
              onTap: () => _open(c, a),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                if (a['image_url'] != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: Image.network(a['image_url'], fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(color: Colors.white10)),
                    ),
                  ),
                const SizedBox(height: 10),
                _cat(a),
                const SizedBox(height: 4),
                Text(a['title'] ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, height: 1.2)),
                if ((a['excerpt'] ?? '').toString().isNotEmpty)
                  Padding(padding: const EdgeInsets.only(top: 6), child: Text(a['excerpt'], maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white54, height: 1.35))),
              ]),
            );
          }
          // Demais: linha compacta com miniatura
          return InkWell(
            onTap: () => _open(c, a),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  _cat(a),
                  const SizedBox(height: 4),
                  Text(a['title'] ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, height: 1.2)),
                ]),
              ),
              if (a['image_url'] != null)
                Padding(
                  padding: const EdgeInsets.only(left: 12),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(a['image_url'], width: 104, height: 76, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const SizedBox(width: 104, height: 76)),
                  ),
                ),
            ]),
          );
        },
      ),
    );
  }
}
