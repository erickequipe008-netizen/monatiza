import 'package:supabase_flutter/supabase_flutter.dart';

final _sb = Supabase.instance.client;
String? get myId => _sb.auth.currentUser?.id;

String timeAgo(String? iso) {
  if (iso == null) return '';
  final d = DateTime.tryParse(iso.contains('T') ? iso : iso.replaceFirst(' ', 'T') + 'Z');
  if (d == null) return '';
  final diff = DateTime.now().toUtc().difference(d.toUtc());
  if (diff.inHours < 1) return 'agora';
  if (diff.inHours < 24) return '${diff.inHours}h';
  return '${diff.inDays}d';
}

// ── Notícias ──
Future<List<Map<String, dynamic>>> fetchArticles() async {
  final d = await _sb
      .from('articles')
      .select('id, slug, title, excerpt, image_url, category, is_premium')
      .eq('status', 'publicado')
      .order('created_at', ascending: false)
      .limit(40);
  return List<Map<String, dynamic>>.from(d);
}

Future<String?> fetchArticleBody(String slug) async {
  final r = await _sb.rpc('get_article_body', params: {'p_slug': slug});
  return r as String?;
}

// ── Comunidade ──
Future<List<Map<String, dynamic>>> fetchPosts() async {
  final posts = List<Map<String, dynamic>>.from(await _sb
      .from('posts')
      .select('id, user_id, content, image_url, created_at')
      .isFilter('parent_id', null)
      .order('created_at', ascending: false)
      .limit(40));
  if (posts.isEmpty) return posts;
  await _enrich(posts);
  return posts;
}

Future<List<Map<String, dynamic>>> fetchUserPosts(String userId) async {
  final posts = List<Map<String, dynamic>>.from(await _sb
      .from('posts')
      .select('id, user_id, content, image_url, created_at')
      .eq('user_id', userId)
      .isFilter('parent_id', null)
      .order('created_at', ascending: false)
      .limit(40));
  if (posts.isEmpty) return posts;
  await _enrich(posts);
  return posts;
}

Future<void> _enrich(List<Map<String, dynamic>> posts) async {
  final ids = posts.map((p) => p['id']).toList();
  final authorIds = posts.map((p) => p['user_id']).toSet().toList();
  final profs = List<Map<String, dynamic>>.from(await _sb
      .from('community_profiles')
      .select('user_id, handle, display_name, avatar_url, verified')
      .inFilter('user_id', authorIds));
  final pmap = {for (final p in profs) p['user_id']: p};
  final likes = List<Map<String, dynamic>>.from(
      await _sb.from('post_likes').select('post_id, user_id').inFilter('post_id', ids));
  final me = myId;
  for (final p in posts) {
    p['author'] = pmap[p['user_id']];
    p['likeCount'] = likes.where((l) => l['post_id'] == p['id']).length;
    p['likedByMe'] = likes.any((l) => l['post_id'] == p['id'] && l['user_id'] == me);
  }
}

Future<void> togglePostLike(int postId, bool on) async {
  final me = myId;
  if (me == null) return;
  if (on) {
    await _sb.from('post_likes').upsert({'post_id': postId, 'user_id': me});
  } else {
    await _sb.from('post_likes').delete().eq('post_id', postId).eq('user_id', me);
  }
}

Future<void> createPost(String content) async {
  final me = myId;
  if (me == null || content.trim().isEmpty) return;
  await _sb.from('posts').insert({'user_id': me, 'content': content.trim()});
}

// ── Perfis ──
Future<Map<String, dynamic>?> ensureProfile() async {
  final u = _sb.auth.currentUser;
  if (u == null) return null;
  final existing =
      await _sb.from('community_profiles').select().eq('user_id', u.id).maybeSingle();
  if (existing != null) return existing;
  final base = (u.email ?? 'membro')
      .split('@')
      .first
      .replaceAll(RegExp(r'[^a-z0-9_]', caseSensitive: false), '')
      .toLowerCase();
  final handle = base.isEmpty ? 'membro' : base;
  try {
    return await _sb
        .from('community_profiles')
        .insert({'user_id': u.id, 'handle': handle, 'display_name': u.userMetadata?['name'] ?? handle})
        .select()
        .maybeSingle();
  } catch (_) {
    return await _sb.from('community_profiles').select().eq('user_id', u.id).maybeSingle();
  }
}

Future<List<Map<String, dynamic>>> recommendedProfiles() async {
  final me = myId;
  final fol = me == null
      ? <Map<String, dynamic>>[]
      : List<Map<String, dynamic>>.from(
          await _sb.from('follows').select('following_id').eq('follower_id', me));
  final exclude = <dynamic>{me, ...fol.map((f) => f['following_id'])}..remove(null);
  final list = List<Map<String, dynamic>>.from(await _sb
      .from('community_profiles')
      .select('user_id, handle, display_name, avatar_url, bio, verified')
      .order('created_at', ascending: false)
      .limit(40));
  return list.where((p) => !exclude.contains(p['user_id'])).toList();
}

Future<bool> isFollowing(String userId) async {
  final me = myId;
  if (me == null) return false;
  final r = await _sb
      .from('follows')
      .select('following_id')
      .eq('follower_id', me)
      .eq('following_id', userId)
      .maybeSingle();
  return r != null;
}

Future<void> follow(String userId, bool on) async {
  final me = myId;
  if (me == null) return;
  if (on) {
    await _sb.from('follows').upsert({'follower_id': me, 'following_id': userId});
  } else {
    await _sb.from('follows').delete().eq('follower_id', me).eq('following_id', userId);
  }
}
