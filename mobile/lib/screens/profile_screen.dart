import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../db.dart';
import '../widgets/tone.dart';
import '../widgets/avatar.dart';
import '../widgets/verified_badge.dart';
import '../widgets/ui.dart';
import 'post_detail_screen.dart';
import 'member_profile_screen.dart';
import 'people_screen.dart';
import 'verificacao_screen.dart';

const _accent = Color(0xFF8B5CF6);
const _like = Color(0xFFE0263B);

bool _isVideo(String? u) =>
    u != null && RegExp(r'\.(mp4|webm|mov|m4v)($|\?)', caseSensitive: false).hasMatch(u);

/// Perfil no estilo X: capa + avatar sobreposto + abas (Publicações/Seguidores/Seguindo).
class ProfileBody extends StatefulWidget {
  const ProfileBody({super.key});
  @override
  State<ProfileBody> createState() => _ProfileBodyState();
}

class _ProfileBodyState extends State<ProfileBody> {
  Map<String, dynamic>? _profile;
  List<Map<String, dynamic>> _posts = [];
  Map<String, int> _counts = {'followers': 0, 'following': 0};
  bool _loading = true;

  int _tab = 0; // 0 = Publicações, 1 = Seguidores, 2 = Seguindo
  List<Map<String, dynamic>>? _followers;
  List<Map<String, dynamic>>? _following;
  List<Map<String, dynamic>> _suggested = [];
  bool _showVerifBanner = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prof = await ensureProfile();
    List<Map<String, dynamic>> posts = [];
    Map<String, int> counts = {'followers': 0, 'following': 0};
    List<Map<String, dynamic>> suggested = [];
    if (prof != null) {
      posts = await fetchUserPosts(prof['user_id']);
      counts = await followCounts(prof['user_id']);
      suggested = (await recommendedProfiles()).take(8).toList();
    }
    if (mounted) {
      setState(() {
        _profile = prof;
        _posts = posts;
        _counts = counts;
        _suggested = suggested;
        _loading = false;
        _followers = null;
        _following = null;
      });
    }
  }

  Future<void> _switchTab(int t) async {
    setState(() => _tab = t);
    final uid = _profile?['user_id'];
    if (uid == null) return;
    if (t == 1 && _followers == null) {
      final f = await listFollowers(uid);
      if (mounted) setState(() => _followers = f);
    } else if (t == 2 && _following == null) {
      final f = await listFollowing(uid);
      if (mounted) setState(() => _following = f);
    }
  }

  void _open(Widget screen) =>
      Navigator.push(context, MaterialPageRoute(builder: (_) => screen));

  /// Escolhe, ajusta (centraliza) e sobe a foto de perfil ou capa.
  Future<void> _changePhoto(String kind) async {
    final x = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 92);
    if (x == null) return;
    final cropped = await ImageCropper().cropImage(
      sourcePath: x.path,
      aspectRatio: kind == 'avatar'
          ? const CropAspectRatio(ratioX: 1, ratioY: 1)
          : const CropAspectRatio(ratioX: 3, ratioY: 1),
      uiSettings: [
        AndroidUiSettings(
          toolbarTitle: kind == 'avatar' ? 'Ajustar foto' : 'Ajustar capa',
          toolbarColor: Colors.black,
          toolbarWidgetColor: Colors.white,
          backgroundColor: Colors.black,
          activeControlsWidgetColor: _accent,
          lockAspectRatio: true,
        ),
        IOSUiSettings(title: 'Ajustar', aspectRatioLockEnabled: true),
      ],
    );
    if (cropped == null || !mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enviando foto…')));
    final url = await uploadProfileImage(File(cropped.path), kind);
    if (url == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Não foi possível enviar. Tente de novo.')));
      }
      return;
    }
    await updateMyProfile({kind == 'avatar' ? 'avatar_url' : 'cover_url': url});
    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      _load();
    }
  }

  Widget _editDot(double size, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.black.withOpacity(0.75),
            border: Border.all(color: Colors.white24),
          ),
          child: Icon(Icons.camera_alt_outlined, size: size * 0.52, color: Colors.white),
        ),
      );

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    final p = _profile;
    final name = (p?['display_name'] ?? p?['handle'] ?? 'Membro').toString();
    final handle = (p?['handle'] ?? '').toString();
    final bio = (p?['bio'] ?? '').toString();
    final link = (p?['link'] ?? '').toString();
    final cover = p?['cover_url'] as String?;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // ---- Capa + avatar sobreposto ----
          // Tudo dentro de uma área com altura própria: assim o botão de
          // trocar a foto do avatar recebe o toque (fora dos limites do
          // Stack o Flutter desenha, mas não deixa clicar).
          SizedBox(
            height: 176,
            child: Stack(children: [
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: 118,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF8B5CF6), Color(0xFF0A0A0A)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    image: (cover != null && cover.isNotEmpty)
                        ? DecorationImage(image: NetworkImage(cover), fit: BoxFit.cover)
                        : null,
                  ),
                ),
              ),
              // Trocar capa
              Positioned(right: 12, top: 12, child: _editDot(34, () => _changePhoto('cover'))),
              Positioned(
                left: 16,
                top: 84,
                child: Stack(children: [
                  GradientAvatarRing(padding: 3, child: memberAvatar(p, 38)),
                  // Trocar foto de perfil
                  Positioned(right: 0, bottom: 0, child: _editDot(28, () => _changePhoto('avatar'))),
                ]),
              ),
            ]),
          ),
          const SizedBox(height: 12),
          // ---- Nome / handle / bio / link / contagens ----
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Flexible(child: Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.3))),
                if (p?['verified'] == true)
                  Padding(padding: const EdgeInsets.only(left: 6), child: VerifiedBadge(size: 18, tier: p?['verified_tier'])),
              ]),
              if (handle.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text('@$handle', style: TextStyle(color: t54(context))),
                ),
              if (bio.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(bio, style: const TextStyle(height: 1.4)),
                ),
              if (link.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: InkWell(
                    onTap: () => launchUrl(
                      Uri.parse(link.startsWith('http') ? link : 'https://$link'),
                      mode: LaunchMode.externalApplication,
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.link, size: 16, color: _accent),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(link.replaceAll(RegExp(r'^https?://'), ''),
                            overflow: TextOverflow.ellipsis, style: const TextStyle(color: _accent)),
                      ),
                    ]),
                  ),
                ),
              const SizedBox(height: 16),
              Row(children: [
                _CountLink(value: _counts['following'] ?? 0, label: 'Seguindo', onTap: () => _switchTab(2)),
                const SizedBox(width: 22),
                _CountLink(value: _counts['followers'] ?? 0, label: 'Seguidores', onTap: () => _switchTab(1)),
              ]),
            ]),
          ),
          // ---- Aviso: conta ainda sem selo (estilo X) ----
          if (p?['verified'] != true && _showVerifBanner)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
              child: Container(
                padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
                decoration: BoxDecoration(
                  color: isDarkC(context) ? const Color(0xFF11291C) : const Color(0xFFE7F5EC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF2E7D5B).withOpacity(0.35)),
                ),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Flexible(
                          child: Text('Você ainda não passou pela verificação',
                              style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13.5,
                                  color: isDarkC(context) ? Colors.white : const Color(0xFF0B3D25))),
                        ),
                        const SizedBox(width: 5),
                        const VerifiedBadge(size: 14),
                      ]),
                      const SizedBox(height: 4),
                      Text(
                        'Garanta seu selo para autenticar a conta e priorizar o alcance das suas publicações.',
                        style: TextStyle(
                            fontSize: 12,
                            height: 1.35,
                            color: isDarkC(context) ? Colors.white70 : Colors.black87),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        height: 32,
                        child: FilledButton(
                          style: FilledButton.styleFrom(
                            backgroundColor: isDarkC(context) ? Colors.white : const Color(0xFF0B3D25),
                            foregroundColor: isDarkC(context) ? Colors.black : Colors.white,
                            shape: const StadiumBorder(),
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
                          ),
                          onPressed: () => _open(const VerificacaoScreen()),
                          child: const Text('Obter verificação'),
                        ),
                      ),
                    ]),
                  ),
                  GestureDetector(
                    onTap: () => setState(() => _showVerifBanner = false),
                    child: Padding(
                        padding: const EdgeInsets.all(4),
                        child: Icon(Icons.close, size: 16, color: t38(context))),
                  ),
                ]),
              ),
            ),
          const SizedBox(height: 18),
          // ---- Abas ----
          Row(children: [
            _Tab(label: 'Publicações', active: _tab == 0, onTap: () => _switchTab(0)),
            _Tab(label: 'Seguidores', active: _tab == 1, onTap: () => _switchTab(1)),
            _Tab(label: 'Seguindo', active: _tab == 2, onTap: () => _switchTab(2)),
          ]),
          Divider(height: 1, color: t12(context)),
          // ---- Conteúdo da aba ----
          ..._tabContent(),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  List<Widget> _tabContent() {
    if (_tab == 0) {
      final list = <Widget>[];
      if (_posts.isEmpty) {
        list.add(const _Empty('Você ainda não publicou nada.'));
      } else {
        list.addAll(_posts.map((post) => _MyPost(post: post, me: _profile, onChanged: _load)));
      }
      if (_suggested.isNotEmpty) list.add(_quemSeguir());
      return list;
    }
    if (_tab == 1) {
      if (_followers == null) return [const _Loading()];
      if (_followers!.isEmpty) return [const _Empty('Ninguém ainda te segue.')];
      return _followers!
          .map((u) => _PersonRow(profile: u, onTap: () => _open(MemberProfileScreen(profile: u))))
          .toList();
    }
    if (_following == null) return [const _Loading()];
    if (_following!.isEmpty) return [const _Empty('Você ainda não segue ninguém.')];
    return _following!
        .map((u) => _PersonRow(profile: u, onTap: () => _open(MemberProfileScreen(profile: u))))
        .toList();
  }
}

  Widget _quemSeguir() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 8, 6),
          child: Row(children: [
            const Expanded(
                child: Text('Quem seguir', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800))),
            TextButton(
              onPressed: () => _open(const PeopleScreen()),
              child: const Text('Mostrar mais',
                  style: TextStyle(color: _accent, fontWeight: FontWeight.w700, fontSize: 12.5)),
            ),
          ]),
        ),
        SizedBox(
          height: 208,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _suggested.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (c, i) => _SuggestCard(
              profile: _suggested[i],
              onOpen: () => _open(MemberProfileScreen(profile: _suggested[i])),
            ),
          ),
        ),
        const SizedBox(height: 8),
      ]);
}

/// Cartão "Quem seguir" (capa + avatar + Seguir), estilo X.
class _SuggestCard extends StatefulWidget {
  final Map<String, dynamic> profile;
  final VoidCallback onOpen;
  const _SuggestCard({required this.profile, required this.onOpen});
  @override
  State<_SuggestCard> createState() => _SuggestCardState();
}

class _SuggestCardState extends State<_SuggestCard> {
  bool _following = false;
  bool _busy = false;

  Future<void> _toggle() async {
    final n = !_following;
    setState(() { _following = n; _busy = true; });
    await follow(widget.profile['user_id'], n);
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.profile;
    final name = (p['display_name'] ?? p['handle'] ?? 'Membro').toString();
    final bio = (p['bio'] ?? '').toString();
    final cover = p['cover_url'] as String?;
    return GestureDetector(
      onTap: widget.onOpen,
      child: Container(
        width: 232,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: tCardC(context),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: t12(context)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            height: 62,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF8B5CF6), Color(0xFF2B2141)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              image: (cover != null && cover.isNotEmpty)
                  ? DecorationImage(image: NetworkImage(cover), fit: BoxFit.cover)
                  : null,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                memberAvatar(p, 15),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Flexible(
                          child: Text(name,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5))),
                      if (p['verified'] == true)
                        Padding(
                            padding: const EdgeInsets.only(left: 3),
                            child: VerifiedBadge(size: 12, tier: p['verified_tier'])),
                    ]),
                    Text('@${p['handle'] ?? ''}',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: t38(context), fontSize: 11)),
                  ]),
                ),
                const SizedBox(width: 6),
                SizedBox(
                  height: 30,
                  child: _following
                      ? OutlinedButton(
                          onPressed: _busy ? null : _toggle,
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: t24(context)),
                            shape: const StadiumBorder(),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            foregroundColor: tInk(context),
                            textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11.5),
                          ),
                          child: const Text('Seguindo'),
                        )
                      : FilledButton(
                          onPressed: _busy ? null : _toggle,
                          style: FilledButton.styleFrom(
                            backgroundColor: tInk(context),
                            foregroundColor: isDarkC(context) ? Colors.black : Colors.white,
                            shape: const StadiumBorder(),
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11.5),
                          ),
                          child: const Text('Seguir'),
                        ),
                ),
              ]),
              if (bio.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(bio,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: t54(context), fontSize: 12, height: 1.3)),
                ),
            ]),
          ),
        ]),
      ),
    );
  }
}

class _CountLink extends StatelessWidget {
  final int value;
  final String label;
  final VoidCallback onTap;
  const _CountLink({required this.value, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Text('$value ', style: const TextStyle(fontWeight: FontWeight.w800)),
          Text(label, style: TextStyle(color: t54(context))),
        ]),
      );
}

class _Tab extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _Tab({required this.label, required this.active, required this.onTap});
  @override
  Widget build(BuildContext context) => Expanded(
        child: InkWell(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            alignment: Alignment.center,
            child: Column(children: [
              Text(label,
                  style: TextStyle(
                      fontWeight: FontWeight.w800, fontSize: 13, color: active ? tInk(context) : t54(context))),
              const SizedBox(height: 8),
              Container(
                height: 3,
                width: 40,
                decoration: BoxDecoration(
                    color: active ? _accent : Colors.transparent, borderRadius: BorderRadius.circular(2)),
              ),
            ]),
          ),
        ),
      );
}

class _Empty extends StatelessWidget {
  final String text;
  const _Empty(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Center(child: Text(text, style: TextStyle(color: t38(context)))),
      );
}

class _Loading extends StatelessWidget {
  const _Loading();
  @override
  Widget build(BuildContext context) =>
      const Padding(padding: EdgeInsets.all(40), child: Center(child: CircularProgressIndicator()));
}

class _PersonRow extends StatelessWidget {
  final Map<String, dynamic> profile;
  final VoidCallback onTap;
  const _PersonRow({required this.profile, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final name = (profile['display_name'] ?? profile['handle'] ?? 'Membro').toString();
    final handle = (profile['handle'] ?? '').toString();
    final bio = (profile['bio'] ?? '').toString();
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: t12(context)))),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          memberAvatar(profile, 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold))),
                if (profile['verified'] == true)
                  Padding(padding: const EdgeInsets.only(left: 4), child: VerifiedBadge(size: 13, tier: profile['verified_tier'])),
              ]),
              if (handle.isNotEmpty)
                Text('@$handle', style: TextStyle(color: t38(context), fontSize: 13)),
              if (bio.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(bio, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                ),
            ]),
          ),
        ]),
      ),
    );
  }
}

/// Publicação do próprio usuário (linha estilo X, com excluir).
class _MyPost extends StatefulWidget {
  final Map<String, dynamic> post;
  final Map<String, dynamic>? me;
  final VoidCallback onChanged;
  const _MyPost({required this.post, required this.me, required this.onChanged});
  @override
  State<_MyPost> createState() => _MyPostState();
}

class _MyPostState extends State<_MyPost> {
  late bool _liked = widget.post['likedByMe'] == true;
  late int _count = (widget.post['likeCount'] ?? 0) as int;
  late bool _saved = widget.post['bookmarkedByMe'] == true;

  Future<void> _likeToggle() async {
    final n = !_liked;
    setState(() {
      _liked = n;
      _count += n ? 1 : -1;
    });
    await togglePostLike(widget.post['id'], n);
  }

  Future<void> _saveToggle() async {
    final n = !_saved;
    setState(() => _saved = n);
    await togglePostBookmark(widget.post['id'], n);
  }

  void _detail() =>
      Navigator.push(context, MaterialPageRoute(builder: (_) => PostDetailScreen(post: widget.post)));

  void _menu() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          ListTile(
            leading: const Icon(Icons.delete_outline, color: _like),
            title: const Text('Excluir', style: TextStyle(color: _like)),
            onTap: () async {
              Navigator.pop(context);
              await deletePost(widget.post['id']);
              widget.onChanged();
            },
          ),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.post;
    final name = (widget.me?['display_name'] ?? widget.me?['handle'] ?? 'Você').toString();
    final handle = (widget.me?['handle'] ?? '').toString();
    final content = (p['content'] ?? '').toString();
    final media = p['image_url'] as String?;
    return InkWell(
      onTap: _detail,
      child: Container(
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: t12(context)))),
        padding: const EdgeInsets.fromLTRB(16, 12, 8, 6),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          memberAvatar(widget.me, 21),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(
                  child: Row(children: [
                    Flexible(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15))),
                    if (widget.me?['verified'] == true)
                      Padding(padding: const EdgeInsets.only(left: 4), child: VerifiedBadge(size: 14, tier: widget.me?['verified_tier'])),
                    const SizedBox(width: 5),
                    Flexible(child: Text('@$handle · ${timeAgo(p['created_at'])}', overflow: TextOverflow.ellipsis, style: TextStyle(color: t38(context), fontSize: 13))),
                  ]),
                ),
                GestureDetector(
                  onTap: _menu,
                  child: Padding(padding: const EdgeInsets.only(left: 6, right: 2), child: Icon(Icons.more_horiz, size: 18, color: t38(context))),
                ),
              ]),
              if (content.isNotEmpty)
                Padding(padding: const EdgeInsets.only(top: 4), child: Text(content, style: const TextStyle(fontSize: 15, height: 1.35))),
              if (media != null)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: _isVideo(media)
                        ? GestureDetector(
                            onTap: _detail,
                            child: Container(height: 200, color: Colors.black, alignment: Alignment.center, child: const Icon(Icons.play_circle_fill, size: 50, color: Colors.white70)),
                          )
                        : Image.network(media, errorBuilder: (_, __, ___) => const SizedBox()),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.only(top: 8, bottom: 2),
                child: Row(children: [
                  _act(Icons.mode_comment_outlined, t38(context), null, _detail),
                  _act(_liked ? Icons.favorite : Icons.favorite_border, _liked ? _like : t38(context), _count > 0 ? '$_count' : null, _likeToggle),
                  _act(_saved ? Icons.bookmark : Icons.bookmark_border, _saved ? _accent : t38(context), null, _saveToggle),
                  const Spacer(),
                ]),
              ),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _act(IconData icon, Color color, String? label, VoidCallback onTap) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.only(right: 28, top: 6, bottom: 6),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 18, color: color),
            if (label != null) Padding(padding: const EdgeInsets.only(left: 6), child: Text(label, style: TextStyle(color: color, fontSize: 13))),
          ]),
        ),
      );
}
