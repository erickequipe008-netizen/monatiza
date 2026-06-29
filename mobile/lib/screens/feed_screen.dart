import 'package:flutter/material.dart';
import '../db.dart';
import 'reader_screen.dart';

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
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const Divider(height: 28, color: Colors.white12),
        itemBuilder: (c, i) {
          final a = _items[i];
          return InkWell(
            onTap: () => Navigator.push(c, MaterialPageRoute(builder: (_) => ReaderScreen(article: a))),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Text((a['category'] ?? '').toString().toUpperCase(),
                            style: const TextStyle(color: Color(0xFFFF5C8A), fontSize: 10, fontWeight: FontWeight.w800)),
                        if (a['is_premium'] == true)
                          const Padding(
                            padding: EdgeInsets.only(left: 6),
                            child: Icon(Icons.workspace_premium, size: 13, color: Color(0xFFC9A24B)),
                          ),
                      ]),
                      const SizedBox(height: 4),
                      Text(a['title'] ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, height: 1.2)),
                    ],
                  ),
                ),
                if (a['image_url'] != null)
                  Padding(
                    padding: const EdgeInsets.only(left: 12),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(a['image_url'], width: 96, height: 72, fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const SizedBox(width: 96, height: 72)),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
