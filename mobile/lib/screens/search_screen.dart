import 'package:flutter/material.dart';
import '../db.dart';
import 'reader_screen.dart';

const _accent = Color(0xFF1D9BF0);

/// Busca de notícias (filtra por título e categoria).
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _ctrl = TextEditingController();
  List<Map<String, dynamic>> _all = [];
  String _q = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    fetchArticles().then((d) {
      if (mounted) setState(() { _all = d; _loading = false; });
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _results {
    final q = _q.trim().toLowerCase();
    if (q.isEmpty) return _all;
    return _all.where((a) {
      final t = (a['title'] ?? '').toString().toLowerCase();
      final c = (a['category'] ?? '').toString().toLowerCase();
      final e = (a['excerpt'] ?? '').toString().toLowerCase();
      return t.contains(q) || c.contains(q) || e.contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final items = _results;
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(right: 16),
          child: TextField(
            controller: _ctrl,
            autofocus: true,
            onChanged: (v) => setState(() => _q = v),
            style: const TextStyle(fontSize: 15),
            decoration: InputDecoration(
              hintText: 'Buscar notícias…',
              hintStyle: const TextStyle(color: Colors.white38),
              prefixIcon: const Icon(Icons.search, size: 20, color: Colors.white38),
              filled: true,
              fillColor: const Color(0xFF101216),
              contentPadding: EdgeInsets.zero,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: BorderSide.none),
            ),
          ),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : items.isEmpty
              ? const Center(child: Text('Nada encontrado.', style: TextStyle(color: Colors.white38)))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (c, i) {
                    final a = items[i];
                    return Material(
                      color: Colors.white.withOpacity(0.05),
                      clipBehavior: Clip.antiAlias,
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        onTap: () => Navigator.push(c, MaterialPageRoute(builder: (_) => ReaderScreen(article: a))),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text((a['category'] ?? '').toString().toUpperCase(),
                                    style: const TextStyle(color: _accent, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                                const SizedBox(height: 4),
                                Text(a['title'] ?? '',
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5, height: 1.25)),
                              ]),
                            ),
                            if (a['image_url'] != null)
                              Padding(
                                padding: const EdgeInsets.only(left: 10),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.network(a['image_url'], width: 84, height: 64, fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => const SizedBox(width: 84, height: 64)),
                                ),
                              ),
                          ]),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
