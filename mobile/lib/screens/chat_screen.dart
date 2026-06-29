import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../db.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import '../widgets/ui.dart';

class ChatScreen extends StatefulWidget {
  final Map<String, dynamic> other;
  const ChatScreen({super.key, required this.other});
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  List<Map<String, dynamic>> _msgs = [];
  bool _loading = true;
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  RealtimeChannel? _ch;

  String get _otherId => widget.other['user_id'] as String;

  @override
  void initState() {
    super.initState();
    _load();
    _subscribe();
  }

  @override
  void dispose() {
    if (_ch != null) Supabase.instance.client.removeChannel(_ch!);
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final d = await fetchMessages(_otherId);
    if (mounted) {
      setState(() { _msgs = d; _loading = false; });
      _toEnd();
    }
  }

  void _subscribe() {
    final me = myId;
    _ch = Supabase.instance.client
        .channel('dm-$_otherId-${DateTime.now().millisecondsSinceEpoch}')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'direct_messages',
          callback: (payload) {
            final m = payload.newRecord;
            final ok = (m['sender_id'] == me && m['recipient_id'] == _otherId) ||
                (m['sender_id'] == _otherId && m['recipient_id'] == me);
            if (ok && mounted) {
              setState(() => _msgs.add(Map<String, dynamic>.from(m)));
              _toEnd();
            }
          },
        )
        .subscribe();
  }

  void _toEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) _scroll.jumpTo(_scroll.position.maxScrollExtent);
    });
  }

  Future<void> _send() async {
    final t = _ctrl.text.trim();
    if (t.isEmpty) return;
    _ctrl.clear();
    await sendMessage(_otherId, t);
  }

  @override
  Widget build(BuildContext context) {
    final me = myId;
    final name = (widget.other['display_name'] ?? widget.other['handle'] ?? 'Membro').toString();
    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          memberAvatar(widget.other, 16),
          const SizedBox(width: 8),
          Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 16))),
          if (widget.other['verified'] == true) const Padding(padding: EdgeInsets.only(left: 4), child: VerifiedBadge(size: 14)),
        ]),
      ),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _msgs.isEmpty
                    ? const Center(child: Text("Diga olá 👋", style: TextStyle(color: Colors.white38)))
                    : ListView.builder(
                        controller: _scroll,
                        padding: const EdgeInsets.all(12),
                        itemCount: _msgs.length,
                        itemBuilder: (c, i) {
                          final m = _msgs[i];
                          final mine = m['sender_id'] == me;
                          return Align(
                            alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
                              decoration: BoxDecoration(
                                gradient: mine ? kProGradient : null,
                                color: mine ? null : Colors.white10,
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: Text(m['content'] ?? '', style: const TextStyle(color: Colors.white)),
                            ),
                          );
                        },
                      ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(10, 6, 10, 6),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                      decoration: const InputDecoration(hintText: "Mensagem…"),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _send,
                    icon: const Icon(Icons.send),
                    style: IconButton.styleFrom(backgroundColor: const Color(0xFF9B72CB)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
