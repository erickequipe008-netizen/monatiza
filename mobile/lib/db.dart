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

Future<Map<String, int>> followCounts(String userId) async {
  final f = List.from(await _sb.from('follows').select('follower_id').eq('following_id', userId));
  final g = List.from(await _sb.from('follows').select('following_id').eq('follower_id', userId));
  return {'followers': f.length, 'following': g.length};
}

// ── Conteúdo (categorias / exclusivo) ──
Future<List<Map<String, dynamic>>> fetchByCategory(String like) async {
  final d = await _sb
      .from('articles')
      .select('id, slug, title, excerpt, image_url, category, is_premium')
      .eq('status', 'publicado')
      .ilike('category', like)
      .order('created_at', ascending: false)
      .limit(40);
  return List<Map<String, dynamic>>.from(d);
}

Future<List<Map<String, dynamic>>> fetchPremium() async {
  final d = await _sb
      .from('articles')
      .select('id, slug, title, excerpt, image_url, category, is_premium')
      .eq('status', 'publicado')
      .eq('is_premium', true)
      .order('created_at', ascending: false)
      .limit(40);
  return List<Map<String, dynamic>>.from(d);
}

// ── Reels (vídeos) ──
Future<List<Map<String, dynamic>>> fetchReels() async {
  final reels = List<Map<String, dynamic>>.from(await _sb
      .from('reels')
      .select('id, user_id, video_url, caption, created_at')
      .order('created_at', ascending: false)
      .limit(30));
  if (reels.isEmpty) return reels;
  final ids = reels.map((r) => r['id']).toList();
  final authorIds = reels.map((r) => r['user_id']).toSet().toList();
  final profs = List<Map<String, dynamic>>.from(await _sb
      .from('community_profiles')
      .select('user_id, handle, display_name, avatar_url, verified')
      .inFilter('user_id', authorIds));
  final pmap = {for (final p in profs) p['user_id']: p};
  final likes = List<Map<String, dynamic>>.from(
      await _sb.from('reel_likes').select('reel_id, user_id').inFilter('reel_id', ids));
  final me = myId;
  for (final r in reels) {
    r['author'] = pmap[r['user_id']];
    r['likeCount'] = likes.where((l) => l['reel_id'] == r['id']).length;
    r['likedByMe'] = likes.any((l) => l['reel_id'] == r['id'] && l['user_id'] == me);
  }
  return reels;
}

Future<void> toggleReelLike(int reelId, bool on) async {
  final me = myId;
  if (me == null) return;
  if (on) {
    await _sb.from('reel_likes').upsert({'reel_id': reelId, 'user_id': me});
  } else {
    await _sb.from('reel_likes').delete().eq('reel_id', reelId).eq('user_id', me);
  }
}

// ── Biblioteca (salvar / curtir / histórico de matérias) ──
Future<bool> isBookmarked(int articleId) async {
  final me = myId;
  if (me == null) return false;
  final r = await _sb.from('bookmarks').select('article_id').eq('user_id', me).eq('article_id', articleId).maybeSingle();
  return r != null;
}

Future<void> toggleBookmark(int articleId, bool on) async {
  final me = myId;
  if (me == null) return;
  if (on) {
    await _sb.from('bookmarks').upsert({'user_id': me, 'article_id': articleId});
  } else {
    await _sb.from('bookmarks').delete().eq('user_id', me).eq('article_id', articleId);
  }
}

Future<bool> isArticleLiked(int articleId) async {
  final me = myId;
  if (me == null) return false;
  final r = await _sb.from('article_likes').select('article_id').eq('user_id', me).eq('article_id', articleId).maybeSingle();
  return r != null;
}

Future<void> toggleArticleLike(int articleId, bool on) async {
  final me = myId;
  if (me == null) return;
  if (on) {
    await _sb.from('article_likes').upsert({'user_id': me, 'article_id': articleId});
  } else {
    await _sb.from('article_likes').delete().eq('user_id', me).eq('article_id', articleId);
  }
}

Future<void> recordView(int articleId) async {
  final me = myId;
  if (me == null) return;
  await _sb.from('reading_history').upsert(
      {'user_id': me, 'article_id': articleId, 'last_read_at': DateTime.now().toUtc().toIso8601String()});
}

List<Map<String, dynamic>> _embedArticles(List data) =>
    data.map((r) => r['articles']).whereType<Map<String, dynamic>>().toList();

Future<List<Map<String, dynamic>>> getSavedArticles() async {
  final me = myId;
  if (me == null) return [];
  final d = await _sb.from('bookmarks').select('articles(id,slug,title,image_url,category,is_premium)').eq('user_id', me).order('created_at', ascending: false);
  return _embedArticles(List.from(d));
}

Future<List<Map<String, dynamic>>> getLikedArticles() async {
  final me = myId;
  if (me == null) return [];
  final d = await _sb.from('article_likes').select('articles(id,slug,title,image_url,category,is_premium)').eq('user_id', me).order('created_at', ascending: false);
  return _embedArticles(List.from(d));
}

Future<List<Map<String, dynamic>>> getHistory() async {
  final me = myId;
  if (me == null) return [];
  final d = await _sb.from('reading_history').select('articles(id,slug,title,image_url,category,is_premium)').eq('user_id', me).order('last_read_at', ascending: false).limit(50);
  return _embedArticles(List.from(d));
}

// ── Newsletter ──
Future<Map<String, dynamic>?> getNewsletterPrefs() async {
  final me = myId;
  if (me == null) return null;
  return await _sb.from('newsletter_subscriptions').select('categories, frequency').eq('user_id', me).maybeSingle();
}

Future<void> saveNewsletterPrefs(List<String> cats, String freq) async {
  final me = myId;
  if (me == null) return;
  await _sb.from('newsletter_subscriptions').upsert({
    'user_id': me,
    'categories': cats,
    'frequency': freq,
    'updated_at': DateTime.now().toUtc().toIso8601String(),
  });
}

// ── Conta / verificação ──
Future<Map<String, dynamic>?> getSubscription() async {
  final me = myId;
  if (me == null) return null;
  return await _sb.from('subscribers').select('status, plan, current_period_end').eq('id', me).maybeSingle();
}

Future<Map<String, dynamic>> getVerification() async {
  final me = myId;
  if (me == null) return {'verified': false, 'status': null};
  final prof = await _sb.from('community_profiles').select('verified').eq('user_id', me).maybeSingle();
  final req = await _sb.from('verification_requests').select('status').eq('user_id', me).maybeSingle();
  return {'verified': prof?['verified'] == true, 'status': req?['status']};
}

// ── Comentários (respostas a posts) ──
Future<List<Map<String, dynamic>>> fetchReplies(int postId) async {
  final rows = List<Map<String, dynamic>>.from(await _sb
      .from('posts')
      .select('id, user_id, content, image_url, created_at')
      .eq('parent_id', postId)
      .order('created_at', ascending: true));
  if (rows.isNotEmpty) await _enrich(rows);
  return rows;
}

Future<void> createReply(int postId, String content) async {
  final me = myId;
  if (me == null || content.trim().isEmpty) return;
  await _sb.from('posts').insert({'user_id': me, 'content': content.trim(), 'parent_id': postId});
}

// ── Mensagens diretas (DM) ──
Future<List<Map<String, dynamic>>> listConversations() async {
  final me = myId;
  if (me == null) return [];
  final rows = List<Map<String, dynamic>>.from(await _sb
      .from('direct_messages')
      .select('sender_id, recipient_id, content, created_at')
      .or('sender_id.eq.$me,recipient_id.eq.$me')
      .order('created_at', ascending: false)
      .limit(300));
  final latest = <String, Map<String, dynamic>>{};
  for (final r in rows) {
    final other = (r['sender_id'] == me ? r['recipient_id'] : r['sender_id']) as String;
    latest.putIfAbsent(other, () => {'other': other, 'content': r['content'], 'created_at': r['created_at'], 'fromMe': r['sender_id'] == me});
  }
  if (latest.isEmpty) return [];
  final profs = List<Map<String, dynamic>>.from(await _sb
      .from('community_profiles')
      .select('user_id, handle, display_name, avatar_url, verified')
      .inFilter('user_id', latest.keys.toList()));
  final pmap = {for (final p in profs) p['user_id']: p};
  return latest.values.map((c) {
    c['profile'] = pmap[c['other']];
    return c;
  }).toList();
}

Future<List<Map<String, dynamic>>> fetchMessages(String otherId) async {
  final me = myId;
  if (me == null) return [];
  final rows = List<Map<String, dynamic>>.from(await _sb
      .from('direct_messages')
      .select('id, sender_id, recipient_id, content, created_at')
      .or('and(sender_id.eq.$me,recipient_id.eq.$otherId),and(sender_id.eq.$otherId,recipient_id.eq.$me)')
      .order('created_at', ascending: true)
      .limit(300));
  return rows;
}

Future<void> sendMessage(String otherId, String content) async {
  final me = myId;
  if (me == null || content.trim().isEmpty) return;
  await _sb.from('direct_messages').insert({'sender_id': me, 'recipient_id': otherId, 'content': content.trim()});
}

Future<List<Map<String, dynamic>>> listFollowing([String? userId]) async {
  final uid = userId ?? myId;
  if (uid == null) return [];
  final rows = List<Map<String, dynamic>>.from(await _sb
      .from('follows')
      .select('following_id')
      .eq('follower_id', uid)
      .order('created_at', ascending: false)
      .limit(50));
  if (rows.isEmpty) return [];
  final ids = rows.map((r) => r['following_id']).toList();
  return List<Map<String, dynamic>>.from(await _sb
      .from('community_profiles')
      .select('user_id, handle, display_name, avatar_url, verified')
      .inFilter('user_id', ids));
}
