import 'package:flutter/material.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import 'chat_screen.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});
  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<Map<String, dynamic>> _convs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final d = await listConversations();
    if (mounted) setState(() { _convs = d; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Mensagens")),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _convs.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Text("Nenhuma conversa ainda.\nAbra o perfil de alguém e toque em Mensagem.",
                        textAlign: TextAlign.center, style: TextStyle(color: Colors.white38)),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    itemCount: _convs.length,
                    separatorBuilder: (_, __) => const Divider(height: 1, color: Colors.white12),
                    itemBuilder: (c, i) {
                      final conv = _convs[i];
                      final prof = conv['profile'] as Map<String, dynamic>?;
                      final name = (prof?['display_name'] ?? prof?['handle'] ?? 'Membro').toString();
                      return ListTile(
                        leading: memberAvatar(prof, 24),
                        title: Row(children: [
                          Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold))),
                          if (prof?['verified'] == true) const Padding(padding: EdgeInsets.only(left: 4), child: VerifiedBadge(size: 13)),
                        ]),
                        subtitle: Text(conv['content'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis),
                        onTap: prof == null ? null : () => Navigator.push(c, MaterialPageRoute(builder: (_) => ChatScreen(other: prof))),
                      );
                    },
                  ),
                ),
    );
  }
}
