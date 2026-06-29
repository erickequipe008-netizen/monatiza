import 'package:flutter/material.dart';
import '../db.dart';

const _cats = ["Negócios", "IA", "Mercado", "Brasil", "Política", "Tech", "Empreende", "Startups", "Carreira", "Saúde", "Revista"];
const _freqs = {"diaria": "Diária", "semanal": "Semanal", "mensal": "Mensal"};

class NewsletterScreen extends StatefulWidget {
  const NewsletterScreen({super.key});
  @override
  State<NewsletterScreen> createState() => _NewsletterScreenState();
}

class _NewsletterScreenState extends State<NewsletterScreen> {
  final Set<String> _selected = {};
  String _freq = "semanal";
  bool _loading = true, _saving = false, _saved = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final p = await getNewsletterPrefs();
    if (p != null) {
      _selected.addAll(List<String>.from(p['categories'] ?? const []));
      _freq = (p['frequency'] ?? 'semanal').toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _save() async {
    setState(() { _saving = true; _saved = false; });
    await saveNewsletterPrefs(_selected.toList(), _freq);
    if (mounted) setState(() { _saving = false; _saved = true; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Newsletter")),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text("Temas", style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white70)),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _cats.map((c) {
                    final on = _selected.contains(c);
                    return FilterChip(
                      label: Text(c),
                      selected: on,
                      onSelected: (v) => setState(() { _saved = false; v ? _selected.add(c) : _selected.remove(c); }),
                      selectedColor: const Color(0xFF9B72CB),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
                const Text("Frequência", style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white70)),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  children: _freqs.entries.map((e) {
                    final on = _freq == e.key;
                    return ChoiceChip(
                      label: Text(e.value),
                      selected: on,
                      onSelected: (_) => setState(() { _freq = e.key; _saved = false; }),
                      selectedColor: const Color(0xFF9B72CB),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 28),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  style: FilledButton.styleFrom(backgroundColor: const Color(0xFF9B72CB), padding: const EdgeInsets.symmetric(vertical: 14)),
                  child: Text(_saving ? "Salvando…" : "Salvar preferências"),
                ),
                if (_saved) const Padding(padding: EdgeInsets.only(top: 12), child: Text("✓ Preferências salvas", style: TextStyle(color: Colors.green))),
              ],
            ),
    );
  }
}
