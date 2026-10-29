import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/tone.dart';
import 'reader_screen.dart';

/// Explorar (igual ao site): grade de artigos.
class DiscoverBody extends StatefulWidget {
  const DiscoverBody({super.key});
  @override
  State<DiscoverBody> createState() => _DiscoverBodyState();
}

class _DiscoverBodyState extends State<DiscoverBody> {
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
      return Center(child: Text("Nada por aqui ainda.", style: TextStyle(color: t38(context))));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: GridView.builder(
        padding: const EdgeInsets.all(12),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 16, childAspectRatio: 0.72,
        ),
        itemCount: _items.length,
        itemBuilder: (c, i) {
          final a = _items[i];
          return InkWell(
            onTap: () => Navigator.push(c, MaterialPageRoute(builder: (_) => ReaderScreen(article: a))),
            borderRadius: BorderRadius.circular(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              AspectRatio(
                aspectRatio: 16 / 10,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: a['image_url'] != null
                      ? Image.network(a['image_url'], fit: BoxFit.cover, cacheWidth: 500, errorBuilder: (_, __, ___) => Container(color: t10(context)))
                      : Container(color: t10(context)),
                ),
              ),
              const SizedBox(height: 8),
              Text((a['category'] ?? '').toString().toUpperCase(),
                  style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.w800)),
              const SizedBox(height: 2),
              Expanded(
                child: Text(a['title'] ?? '', maxLines: 3, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, height: 1.25)),
              ),
            ]),
          );
        },
      ),
    );
  }
}
