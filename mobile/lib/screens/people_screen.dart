import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import 'member_profile_screen.dart';

/// Sugestões de pessoas para seguir.
class PeopleScreen extends StatefulWidget {
  const PeopleScreen({super.key});
  @override
  State<PeopleScreen> createState() => _PeopleScreenState();
}

class _PeopleScreenState extends State<PeopleScreen> {
  List<Map<String, dynamic>> _people = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    recommendedProfiles().then((d) {
      if (mounted) setState(() { _people = d; _loading = false; });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sugestões para você', style: TextStyle(fontSize: 17))),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _people.isEmpty
              ? const Center(child: Text('Nenhuma sugestão no momento.', style: TextStyle(color: Colors.white38)))
              : ListView.builder(
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
                ),
    );
  }
}
