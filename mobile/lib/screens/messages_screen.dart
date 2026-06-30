import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import '../widgets/ui.dart';
import 'chat_screen.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});
  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<Map<String, dynamic>> _convs = [];
  List<Map<String, dynamic>> _following = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([listConversations(), listFollowing()]);
    if (mounted) {
      setState(() {
        _convs = results[0];
        _following = results[1];
        _loading = false;
      });
    }
  }

  void _openChat(Map<String, dynamic> prof) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(other: prof))).then((_) => _load());
  }

  @override
  Widget build(BuildContext context) {
    final convoIds = _convs.map((c) => c['other']).toSet();
    final startable = _following.where((p) => !convoIds.contains(p['user_id'])).toList();

    return Scaffold(
      appBar: AppBar(title: const Text("Mensagens")),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  if (startable.isNotEmpty) ...[
                    const Padding(
                      padding: EdgeInsets.fromLTRB(16, 14, 16, 10),
                      child: Text("INICIAR CONVERSA",
                          style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
                    ),
                    SizedBox(
                      height: 92,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: startable.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 16),
                        itemBuilder: (c, i) {
                          final p = startable[i];
                          final nm = (p['display_name'] ?? p['handle'] ?? '').toString().split(' ').first;
                          return GestureDetector(
                            onTap: () => _openChat(p),
                            child: SizedBox(
                              width: 62,
                              child: Column(children: [
                                Container(
                                  padding: const EdgeInsets.all(2),
                                  decoration: const BoxDecoration(shape: BoxShape.circle, gradient: kProGradient),
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF0A0A0C)),
                                    child: memberAvatar(p, 25),
                                  ),
                                ),
                                const SizedBox(height: 5),
                                Text(nm, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: Colors.white54)),
                              ]),
                            ),
                          );
                        },
                      ),
                    ),
                    const Divider(height: 18, color: Colors.white10),
                  ],
                  if (_convs.isEmpty && startable.isEmpty)
                    const Padding(
                      padding: EdgeInsets.fromLTRB(32, 80, 32, 32),
                      child: Center(
                        child: Text("Nenhuma conversa ainda.\nAbra o perfil de alguém e toque em Mensagem.",
                            textAlign: TextAlign.center, style: TextStyle(color: Colors.white38)),
                      ),
                    )
                  else if (_convs.isNotEmpty) ...[
                    const Padding(
                      padding: EdgeInsets.fromLTRB(16, 6, 16, 4),
                      child: Text("RECENTES",
                          style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
                    ),
                    ..._convs.map((conv) {
                      final prof = conv['profile'] as Map<String, dynamic>?;
                      final name = (prof?['display_name'] ?? prof?['handle'] ?? 'Membro').toString();
                      final fromMe = conv['fromMe'] == true;
                      return InkWell(
                        onTap: prof == null ? null : () => _openChat(prof),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
                          child: Row(children: [
                            memberAvatar(prof, 27),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Row(children: [
                                  Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15))),
                                  if (prof?['verified'] == true) const Padding(padding: EdgeInsets.only(left: 4), child: VerifiedBadge(size: 14)),
                                ]),
                                const SizedBox(height: 2),
                                Row(children: [
                                  if (fromMe) const Text("Você: ", style: TextStyle(color: Colors.white38, fontSize: 13)),
                                  Expanded(child: Text(conv['content'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white54, fontSize: 13))),
                                ]),
                              ]),
                            ),
                            const SizedBox(width: 8),
                            Text(timeAgo(conv['created_at']), style: const TextStyle(color: Colors.white38, fontSize: 11)),
                          ]),
                        ),
                      );
                    }),
                  ],
                ],
              ),
            ),
    );
  }
}
