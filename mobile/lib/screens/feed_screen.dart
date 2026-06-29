import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'reader_screen.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});
  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  List<Map<String, dynamic>> _articles = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await Supabase.instance.client
        .from('articles')
        .select('id, slug, title, excerpt, image_url, category, is_premium')
        .eq('status', 'publicado')
        .order('created_at', ascending: false)
        .limit(40);
    if (mounted) {
      setState(() {
        _articles = List<Map<String, dynamic>>.from(data);
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('monatiza', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Supabase.instance.client.auth.signOut(),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _articles.length,
                separatorBuilder: (_, __) => const Divider(height: 28, color: Colors.white12),
                itemBuilder: (context, i) {
                  final a = _articles[i];
                  return InkWell(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => ReaderScreen(article: a)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                Text((a['category'] ?? '').toString().toUpperCase(),
                                    style: const TextStyle(
                                        color: Color(0xFFFF5C8A), fontSize: 10, fontWeight: FontWeight.w800)),
                                if (a['is_premium'] == true) ...[
                                  const SizedBox(width: 6),
                                  const Icon(Icons.workspace_premium, size: 13, color: Color(0xFFC9A24B)),
                                ],
                              ]),
                              const SizedBox(height: 4),
                              Text(a['title'] ?? '',
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, height: 1.2)),
                            ],
                          ),
                        ),
                        if (a['image_url'] != null) ...[
                          const SizedBox(width: 12),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.network(a['image_url'],
                                width: 96, height: 72, fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const SizedBox(width: 96, height: 72)),
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}
