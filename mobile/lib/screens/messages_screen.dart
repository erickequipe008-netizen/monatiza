import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/tone.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import '../widgets/ui.dart';
import 'chat_screen.dart';

/// Tela cheia (quando aberta por push) — reaproveita o corpo abaixo.
class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Mensagens")),
      body: const MessagesBody(),
    );
  }
}

/// Corpo da caixa de entrada — usado como ABA no menu inferior.
class MessagesBody extends StatefulWidget {
  const MessagesBody({super.key});
  @override
  State<MessagesBody> createState() => _MessagesBodyState();
}

class _MessagesBodyState extends State<MessagesBody> {
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

    if (_loading) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          if (startable.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
              child: Text("INICIAR CONVERSA",
                  style: TextStyle(color: t38(context), fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
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
                            decoration: BoxDecoration(shape: BoxShape.circle, color: Theme.of(c).scaffoldBackgroundColor),
                            child: memberAvatar(p, 25),
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(nm, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, color: t54(c))),
                      ]),
                    ),
                  );
                },
              ),
            ),
            Divider(height: 18, color: t12(context)),
          ],
          if (_convs.isEmpty && startable.isEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(32, 80, 32, 32),
              child: Center(
                child: Text("Nenhuma conversa ainda.\nAbra o perfil de alguém e toque em Mensagem.",
                    textAlign: TextAlign.center, style: TextStyle(color: t38(context))),
              ),
            )
          else if (_convs.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 4),
              child: Text("RECENTES",
                  style: TextStyle(color: t38(context), fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
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
                          if (prof?['verified'] == true) Padding(padding: const EdgeInsets.only(left: 4), child: VerifiedBadge(size: 14, tier: prof?['verified_tier'])),
                        ]),
                        const SizedBox(height: 2),
                        Row(children: [
                          if (fromMe) Text("Você: ", style: TextStyle(color: t38(context), fontSize: 13)),
                          Expanded(child: Text(conv['content'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: t54(context), fontSize: 13))),
                        ]),
                      ]),
                    ),
                    const SizedBox(width: 8),
                    Text(timeAgo(conv['created_at']), style: TextStyle(color: t38(context), fontSize: 11)),
                  ]),
                ),
              );
            }),
          ],
        ],
      ),
    );
  }
}
