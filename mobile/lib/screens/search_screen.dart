import 'dart:async';
import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import 'reader_screen.dart';
import 'member_profile_screen.dart';

const _accent = Color(0xFF1D9BF0);

/// Busca — notícias e pessoas (contas por nome ou @).
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _ctrl = TextEditingController();
  int _tab = 0; // 0 = Notícias, 1 = Pessoas
  List<Map<String, dynamic>> _articles = [];
  List<Map<String, dynamic>> _people = [];
  String _q = '';
  bool _loading = true;
  bool _searchingPeople = false;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    fetchArticles().then((d) {
      if (mounted) setState(() { _articles = d; _loading = false; });
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _ctrl.dispose();
    super.dispose();
  }

  void _onChanged(String v) {
    setState(() => _q = v);
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), _searchPeople);
  }

  Future<void> _searchPeople() async {
    final q = _q.trim();
    if (q.isEmpty) {
      if (mounted) setState(() => _people = []);
      return;
    }
    setState(() => _searchingPeople = true);
    final r = await searchProfiles(q);
    if (mounted) setState(() { _people = r; _searchingPeople = false; });
  }

  List<Map<String, dynamic>> get _articleResults {
    final q = _q.trim().toLowerCase();
    if (q.isEmpty) return _articles;
    return _articles.where((a) {
      final t = (a['title'] ?? '').toString().toLowerCase();
      final c = (a['category'] ?? '').toString().toLowerCase();
      final e = (a['excerpt'] ?? '').toString().toLowerCase();
      return t.contains(q) || c.contains(q) || e.contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(right: 16),
          child: TextField(
            controller: _ctrl,
            autofocus: true,
            onChanged: _onChanged,
            style: const TextStyle(fontSize: 15),
            decoration: InputDecoration(
              hintText: _tab == 0 ? 'Buscar notícias…' : 'Buscar contas (@ ou nome)…',
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
      body: Column(children: [
        // Abas Notícias | Pessoas
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFF101216),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(children: [
              _seg('Notícias', 0),
              _seg('Pessoas', 1),
            ]),
          ),
        ),
        Expanded(child: _tab == 0 ? _newsList() : _peopleList()),
      ]),
    );
  }

  Widget _seg(String label, int i) => Expanded(
        child: GestureDetector(
          onTap: () => setState(() => _tab = i),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(vertical: 9),
            decoration: BoxDecoration(
              color: _tab == i ? _accent : Colors.transparent,
              borderRadius: BorderRadius.circular(20),
            ),
            alignment: Alignment.center,
            child: Text(label,
                style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    color: _tab == i ? Colors.white : Colors.white54)),
          ),
        ),
      );

  Widget _newsList() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    final items = _articleResults;
    if (items.isEmpty) {
      return const Center(child: Text('Nada encontrado.', style: TextStyle(color: Colors.white38)));
    }
    return ListView.separated(
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
    );
  }

  Widget _peopleList() {
    if (_q.trim().isEmpty) {
      return const Center(
          child: Text('Digite um nome ou @ para buscar contas.',
              style: TextStyle(color: Colors.white38)));
    }
    if (_searchingPeople) return const Center(child: CircularProgressIndicator());
    if (_people.isEmpty) {
      return const Center(child: Text('Nenhuma conta encontrada.', style: TextStyle(color: Colors.white38)));
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: _people.length,
      itemBuilder: (c, i) {
        final p = _people[i];
        final name = (p['display_name'] ?? p['handle'] ?? 'Membro').toString();
        final bio = (p['bio'] ?? '').toString();
        return InkWell(
          onTap: () => Navigator.push(c, MaterialPageRoute(builder: (_) => MemberProfileScreen(profile: p))),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              memberAvatar(p, 23),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold))),
                    if (p['verified'] == true)
                      Padding(padding: const EdgeInsets.only(left: 4), child: VerifiedBadge(size: 13, tier: p['verified_tier'])),
                  ]),
                  Text('@${p['handle'] ?? ''}', style: const TextStyle(color: Colors.white38, fontSize: 13)),
                  if (bio.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(bio, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.35)),
                    ),
                ]),
              ),
              const Icon(Icons.chevron_right, color: Colors.white24),
            ]),
          ),
        );
      },
    );
  }
}
