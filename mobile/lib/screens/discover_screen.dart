import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';

class DiscoverBody extends StatefulWidget {
  const DiscoverBody({super.key});
  @override
  State<DiscoverBody> createState() => _DiscoverBodyState();
}

class _DiscoverBodyState extends State<DiscoverBody> {
  List<Map<String, dynamic>> _people = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final d = await recommendedProfiles();
    if (mounted) setState(() { _people = d; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_people.isEmpty) {
      return const Center(child: Text("Sem perfis para sugerir ainda.", style: TextStyle(color: Colors.white38)));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: _people.length,
        separatorBuilder: (_, __) => const Divider(height: 1, color: Colors.white12),
        itemBuilder: (c, i) => _ProfileRow(profile: _people[i]),
      ),
    );
  }
}

class _ProfileRow extends StatefulWidget {
  final Map<String, dynamic> profile;
  const _ProfileRow({required this.profile});
  @override
  State<_ProfileRow> createState() => _ProfileRowState();
}

class _ProfileRowState extends State<_ProfileRow> {
  bool _following = false;
  bool _busy = false;

  Future<void> _toggle() async {
    final n = !_following;
    setState(() { _following = n; _busy = true; });
    await follow(widget.profile['user_id'], n);
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.profile;
    final name = (p['display_name'] ?? p['handle'] ?? 'Membro').toString();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          memberAvatar(p, 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold))),
                  if (p['verified'] == true) const Padding(padding: EdgeInsets.only(left: 4), child: VerifiedBadge(size: 13)),
                ]),
                Text("@${p['handle'] ?? ''}", style: const TextStyle(color: Colors.white38, fontSize: 13)),
                if ((p['bio'] ?? '').toString().isNotEmpty)
                  Text(p['bio'], maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white54, fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          OutlinedButton(
            onPressed: _busy ? null : _toggle,
            style: OutlinedButton.styleFrom(
              backgroundColor: _following ? Colors.transparent : const Color(0xFF9B72CB),
              foregroundColor: _following ? Colors.white70 : Colors.white,
              side: BorderSide(color: _following ? Colors.white24 : Colors.transparent),
            ),
            child: Text(_following ? "Seguindo" : "Seguir"),
          ),
        ],
      ),
    );
  }
}
