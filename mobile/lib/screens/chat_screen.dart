import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../db.dart';
import '../widgets/tone.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import '../widgets/ui.dart';

/// Conversa — bolhas com hora e visto dentro, foto no chat e leitura
/// marcada em tempo real (estilo dos grandes apps de mensagem).
class ChatScreen extends StatefulWidget {
  final Map<String, dynamic> other;
  const ChatScreen({super.key, required this.other});
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  List<Map<String, dynamic>> _msgs = [];
  bool _loading = true;
  bool _sendingPhoto = false;
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
    markConversationRead(_otherId);
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
              if (m['sender_id'] == _otherId) markConversationRead(_otherId);
              _toEnd();
            }
          },
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'direct_messages',
          callback: (payload) {
            // Visto ✓✓ ao vivo quando a outra pessoa lê
            final m = payload.newRecord;
            if (!mounted) return;
            final i = _msgs.indexWhere((x) => x['id'] == m['id']);
            if (i >= 0) setState(() => _msgs[i] = Map<String, dynamic>.from(m));
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

  Future<void> _sendPhoto() async {
    final x = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (x == null || !mounted) return;
    setState(() => _sendingPhoto = true);
    final url = await uploadDmMedia(File(x.path));
    if (url != null) await sendMessage(_otherId, _ctrl.text, imageUrl: url);
    _ctrl.clear();
    if (mounted) setState(() => _sendingPhoto = false);
  }

  String _hhmm(String? iso) {
    final d = DateTime.tryParse(iso ?? '')?.toLocal();
    if (d == null) return '';
    return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  void _viewImage(String url) {
    showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (ctx) => GestureDetector(
        onTap: () => Navigator.pop(ctx),
        child: InteractiveViewer(
          child: Center(child: Image.network(url)),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final me = myId;
    final dark = isDarkC(context);
    final name = (widget.other['display_name'] ?? widget.other['handle'] ?? 'Membro').toString();
    final handle = (widget.other['handle'] ?? '').toString();

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        centerTitle: false,
        title: Row(children: [
          memberAvatar(widget.other, 17),
          const SizedBox(width: 10),
          Flexible(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisSize: MainAxisSize.min, children: [
                Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800))),
                if (widget.other['verified'] == true)
                  Padding(padding: const EdgeInsets.only(left: 4), child: VerifiedBadge(size: 13, tier: widget.other['verified_tier'])),
              ]),
              if (handle.isNotEmpty)
                Text('@$handle', style: TextStyle(fontSize: 11.5, color: t38(context), fontWeight: FontWeight.w500)),
            ]),
          ),
        ]),
      ),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _msgs.isEmpty
                    ? Center(child: Text('Diga olá 👋', style: TextStyle(color: t38(context))))
                    : ListView.builder(
                        controller: _scroll,
                        padding: const EdgeInsets.fromLTRB(12, 14, 12, 8),
                        itemCount: _msgs.length,
                        itemBuilder: (c, i) {
                          final m = _msgs[i];
                          final mine = m['sender_id'] == me;
                          return _bubble(context, m, mine, dark);
                        },
                      ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(10, 6, 10, 8),
              child: Row(
                children: [
                  // Anexar foto
                  GestureDetector(
                    onTap: _sendingPhoto ? null : _sendPhoto,
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: dark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.05),
                        border: Border.all(color: dark ? Colors.white12 : Colors.black12),
                      ),
                      child: _sendingPhoto
                          ? const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(strokeWidth: 2))
                          : Icon(Icons.add, size: 22, color: dark ? Colors.white70 : Colors.black54),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                      decoration: InputDecoration(
                        hintText: 'Envie uma mensagem…',
                        hintStyle: TextStyle(color: t38(context), fontSize: 14.5),
                        filled: true,
                        fillColor: tFillC(context),
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
                      height: 44,
                      width: 44,
                      decoration: const BoxDecoration(shape: BoxShape.circle, gradient: kProGradient),
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 19),
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

  Widget _bubble(BuildContext context, Map<String, dynamic> m, bool mine, bool dark) {
    final content = (m['content'] ?? '').toString();
    final image = m['image_url'] as String?;
    final read = m['read'] == true;

    // Referência: minhas bolhas claras com texto escuro; as da outra
    // pessoa escuras — invertido no modo claro para manter o contraste.
    final bg = mine
        ? (dark ? Colors.white : const Color(0xFF0B0B10))
        : (dark ? const Color(0xFF1A1D21) : Colors.white);
    final fg = mine
        ? (dark ? const Color(0xFF0B0B10) : Colors.white)
        : tInk(context);
    final meta = mine
        ? (dark ? Colors.black45 : Colors.white60)
        : t38(context);

    final time = Row(mainAxisSize: MainAxisSize.min, children: [
      Text(_hhmm(m['created_at']), style: TextStyle(fontSize: 10.5, color: meta)),
      if (mine) ...[
        const SizedBox(width: 3),
        Icon(read ? Icons.done_all : Icons.check, size: 13, color: meta),
      ],
    ]);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: mine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!mine)
            Padding(padding: const EdgeInsets.only(right: 6), child: memberAvatar(widget.other, 12)),
          ConstrainedBox(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.74),
            child: Container(
              padding: image != null
                  ? const EdgeInsets.all(4)
                  : const EdgeInsets.fromLTRB(14, 9, 12, 8),
              decoration: BoxDecoration(
                color: bg,
                border: (!mine && !dark) ? Border.all(color: Colors.black12) : null,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(mine ? 20 : 5),
                  bottomRight: Radius.circular(mine ? 5 : 20),
                ),
              ),
              child: image != null
                  ? Column(crossAxisAlignment: CrossAxisAlignment.end, mainAxisSize: MainAxisSize.min, children: [
                      GestureDetector(
                        onTap: () => _viewImage(image),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(17),
                          child: Image.network(image, cacheWidth: 720,
                              errorBuilder: (_, __, ___) => Container(
                                  width: 180, height: 120, color: Colors.black26,
                                  child: const Icon(Icons.broken_image_outlined, color: Colors.white38))),
                        ),
                      ),
                      if (content.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(10, 6, 8, 2),
                          child: Text(content, style: TextStyle(color: fg, fontSize: 14.5, height: 1.3)),
                        ),
                      Padding(padding: const EdgeInsets.fromLTRB(0, 3, 6, 3), child: time),
                    ])
                  : Column(crossAxisAlignment: CrossAxisAlignment.end, mainAxisSize: MainAxisSize.min, children: [
                      Text(content, style: TextStyle(color: fg, fontSize: 14.5, height: 1.3)),
                      const SizedBox(height: 2),
                      time,
                    ]),
            ),
          ),
        ],
      ),
    );
  }
}
