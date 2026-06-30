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
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 3),
                            child: Row(
                              mainAxisAlignment: mine ? MainAxisAlignment.end : MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                if (!mine) Padding(padding: const EdgeInsets.only(right: 6), child: memberAvatar(widget.other, 12)),
                                ConstrainedBox(
                                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                    decoration: BoxDecoration(
                                      gradient: mine ? kProGradient : null,
                                      color: mine ? null : Colors.white10,
                                      borderRadius: BorderRadius.only(
                                        topLeft: const Radius.circular(18),
                                        topRight: const Radius.circular(18),
                                        bottomLeft: Radius.circular(mine ? 18 : 4),
                                        bottomRight: Radius.circular(mine ? 4 : 18),
                                      ),
                                    ),
                                    child: Text(m['content'] ?? '', style: const TextStyle(color: Colors.white)),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(10, 6, 10, 8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                      decoration: InputDecoration(
                        hintText: "Escreva uma mensagem…",
                        filled: true,
                        fillColor: Colors.white.withValues(alpha: 0.06),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(26), borderSide: BorderSide.none),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(26), borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _send,
                    child: Container(
                      height: 48,
                      width: 48,
                      decoration: const BoxDecoration(shape: BoxShape.circle, gradient: kProGradient),
                      child: const Icon(Icons.send, color: Colors.white, size: 20),
                    ),
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
