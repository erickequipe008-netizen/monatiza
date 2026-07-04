import 'package:flutter/material.dart';
import '../db.dart';
import 'reader_screen.dart';

const _accent = Color(0xFF1D9BF0);

/// Notícias: todos os artigos em cards iguais (estilo Apple News / Discover).
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

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_items.isEmpty) {
      return const Center(child: Text('Nada por aqui ainda.', style: TextStyle(color: Colors.white38)));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 28),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 14),
        itemBuilder: (c, i) => _ArticleCard(article: _items[i]),
      ),
    );
  }
}

class _ArticleCard extends StatelessWidget {
  final Map<String, dynamic> article;
  const _ArticleCard({required this.article});

  @override
  Widget build(BuildContext context) {
    final a = article;
    final category = (a['category'] ?? '').toString();
    final excerpt = (a['excerpt'] ?? '').toString();
    final premium = a['is_premium'] == true;

    return Material(
      color: Colors.white.withOpacity(0.05),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.white.withOpacity(0.06)),
      ),
      child: InkWell(
        onTap: () => Navigator.push(
            context, MaterialPageRoute(builder: (_) => ReaderScreen(article: a))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (a['image_url'] != null)
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Image.network(a['image_url'], fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(color: Colors.white10)),
            ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (category.isNotEmpty || premium)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(children: [
                    if (category.isNotEmpty)
                      Text(category.toUpperCase(),
                          style: const TextStyle(
                              color: _accent, fontSize: 10.5, fontWeight: FontWeight.w800, letterSpacing: 0.6)),
                    if (premium)
                      const Padding(
                        padding: EdgeInsets.only(left: 6),
                        child: Icon(Icons.workspace_premium, size: 13, color: Color(0xFFC9A24B)),
                      ),
                  ]),
                ),
              Text(a['title'] ?? '',
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 17.5, fontWeight: FontWeight.w800, height: 1.22, letterSpacing: -0.2)),
              if (excerpt.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(excerpt,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white54, fontSize: 13.5, height: 1.4)),
                ),
            ]),
          ),
        ]),
      ),
    );
  }
}
