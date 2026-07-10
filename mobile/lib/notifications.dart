import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'db.dart';

/// Notificações no celular: pede a autorização e avisa em tempo real
/// quando chega mensagem ou quando alguém que você segue publica.
final FlutterLocalNotificationsPlugin _fln = FlutterLocalNotificationsPlugin();
RealtimeChannel? _ch;
bool _ready = false;

Future<void> _init() async {
  if (_ready) return;
  const android = AndroidInitializationSettings('@mipmap/ic_launcher');
  await _fln.initialize(const InitializationSettings(android: android));
  await _fln
      .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
      ?.requestNotificationsPermission();
  _ready = true;
}

Future<void> _show(String title, String body) async {
  await _fln.show(
    DateTime.now().millisecondsSinceEpoch.remainder(1 << 31),
    title,
    body,
    const NotificationDetails(
      android: AndroidNotificationDetails(
        'monatiza_geral',
        'Notificações',
        channelDescription: 'Novas publicações e mensagens',
        importance: Importance.high,
        priority: Priority.high,
      ),
    ),
  );
}

/// Liga os avisos (chamar depois do login).
Future<void> startNotifications() async {
  try {
    await _init();
  } catch (_) {
    return; // sem permissão/plataforma — segue sem avisos
  }
  final me = myId;
  if (me == null) return;

  final following = await listFollowing();
  final ids = following.map((p) => p['user_id']).toSet();
  final names = {
    for (final p in following)
      p['user_id']: (p['display_name'] ?? p['handle'] ?? 'Alguém').toString()
  };

  final sb = Supabase.instance.client;
  final old = _ch;
  if (old != null) sb.removeChannel(old);
  _ch = sb
      .channel('rt-avisos')
      .onPostgresChanges(
        event: PostgresChangeEvent.insert,
        schema: 'public',
        table: 'direct_messages',
        callback: (p) async {
          final m = p.newRecord;
          if (m['recipient_id'] != me || m['sender_id'] == me) return;
          var who = names[m['sender_id']];
          if (who == null) {
            final prof = await fetchProfile(m['sender_id'] as String);
            who = (prof?['display_name'] ?? prof?['handle'] ?? 'Nova mensagem').toString();
          }
          final txt = (m['content'] ?? '').toString();
          _show(who, m['image_url'] != null ? '📷 Foto' : (txt.isEmpty ? 'Nova mensagem' : txt));
        },
      )
      .onPostgresChanges(
        event: PostgresChangeEvent.insert,
        schema: 'public',
        table: 'posts',
        callback: (p) {
          final m = p.newRecord;
          final uid = m['user_id'];
          if (uid == me || !ids.contains(uid)) return;
          if (m['parent_id'] != null) return; // respostas não avisam
          final txt = (m['content'] ?? '').toString();
          _show('${names[uid]} publicou', txt.isEmpty ? 'Nova publicação' : txt);
        },
      )
      .subscribe();
}
