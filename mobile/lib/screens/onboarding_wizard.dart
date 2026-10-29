import 'dart:async';
import 'dart:io';
import 'dart:math' as math;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../auth_gate.dart';
import '../db.dart';
import '../notifications.dart';
import '../widgets/verified_badge.dart';
import 'login_screen.dart';

const _lilas = Color(0xFF8B5CF6);
const _ink = Color(0xFF14002E);
const _fill = Color(0xFF101216);

/// Onboarding premium em etapas deslizantes:
/// 0 boas-vindas · 1 nascimento · 2 nome · 3 e-mail/senha · 4 @usuário
/// 5 foto · 6 interesses · 7 quem seguir · 8 contatos · 9 notificações
/// 10 celebração → Home. Tudo com salvamento automático e retomada.
class OnboardingWizard extends StatefulWidget {
  final int startStep;
  const OnboardingWizard({super.key, this.startStep = 0});
  @override
  State<OnboardingWizard> createState() => _OnboardingWizardState();
}

class _OnboardingWizardState extends State<OnboardingWizard> {
  static const _totalSteps = 11;
  late int _step = widget.startStep;
  late final PageController _pc = PageController(initialPage: widget.startStep);
  SharedPreferences? _prefs;

  // Dados coletados
  DateTime? _birth;
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _pass = TextEditingController();
  final _handle = TextEditingController();
  bool _showPass = false;
  String? _error;
  bool _busy = false;

  // @ disponível?
  _HandleStatus _hStatus = _HandleStatus.idle;
  List<String> _hSugs = [];
  Timer? _hDebounce;

  // Foto
  File? _photo;

  // Interesses
  static const _allInterests = [
    'Empreendedorismo', 'Marketing', 'Tecnologia', 'IA', 'Negócios',
    'Investimentos', 'Startups', 'Design', 'Programação', 'Vendas',
    'Criadores', 'Saúde', 'Educação',
  ];
  final Set<String> _interests = {};

  // Recomendações
  List<Map<String, dynamic>>? _recs;
  bool _recsLoading = false;
  final Set<String> _followed = {};

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((p) {
      if (!mounted) return;
      setState(() {
        _prefs = p;
        _name.text = p.getString('ob_name') ?? '';
        _email.text = p.getString('ob_email') ?? '';
        _handle.text = p.getString('ob_handle') ?? '';
        final b = p.getString('ob_birth');
        if (b != null) _birth = DateTime.tryParse(b);
        final ints = p.getString('ob_interests');
        if (ints != null && ints.isNotEmpty) _interests.addAll(ints.split(','));
      });
    });
  }

  @override
  void dispose() {
    _hDebounce?.cancel();
    _pc.dispose();
    _name.dispose();
    _email.dispose();
    _pass.dispose();
    _handle.dispose();
    super.dispose();
  }

  // ── Navegação entre etapas ──
  void _go(int s) {
    HapticFeedback.selectionClick();
    setState(() {
      _step = s;
      _error = null;
    });
    _prefs?.setInt('ob_step', s);
    _pc.animateToPage(s, duration: const Duration(milliseconds: 340), curve: Curves.easeOutCubic);
  }

  void _next() => _go(_step + 1);

  void _back() {
    final min = _step >= 5 ? 5 : 0;
    if (_step > min) _go(_step - 1);
  }

  int get _age {
    final b = _birth;
    if (b == null) return 0;
    final now = DateTime.now();
    var a = now.year - b.year;
    if (now.month < b.month || (now.month == b.month && now.day < b.day)) a--;
    return a;
  }

  // ── @: verificação ao vivo + sugestões ──
  void _onHandleChanged(String v) {
    final clean = v.replaceAll(RegExp(r'[^a-zA-Z0-9_]'), '').toLowerCase();
    if (clean != v) {
      _handle.value = TextEditingValue(text: clean, selection: TextSelection.collapsed(offset: clean.length));
    }
    _prefs?.setString('ob_handle', clean);
    setState(() {
      _hStatus = clean.length < 3 ? _HandleStatus.idle : _HandleStatus.checking;
      _hSugs = [];
    });
    _hDebounce?.cancel();
    if (clean.length < 3) return;
    _hDebounce = Timer(const Duration(milliseconds: 420), () => _checkHandle(clean));
  }

  Future<void> _checkHandle(String h) async {
    final free = await handleAvailable(h);
    if (!mounted || _handle.text != h) return;
    if (free) {
      setState(() => _hStatus = _HandleStatus.free);
      return;
    }
    // Sugestões inteligentes: variações curtas e um toque do nome
    final rnd = math.Random();
    final base = h.length > 12 ? h.substring(0, 12) : h;
    final fromName = _name.text.trim().toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
    final candidates = <String>{
      '$base${DateTime.now().year % 100}',
      '${base}_${10 + rnd.nextInt(89)}',
      if (fromName.length >= 3 && fromName != base) '$fromName${rnd.nextInt(99)}',
      '$base${rnd.nextInt(899) + 100}',
    }.take(4).toList();
    final checks = await Future.wait(candidates.map(handleAvailable));
    if (!mounted || _handle.text != h) return;
    setState(() {
      _hStatus = _HandleStatus.taken;
      _hSugs = [for (var i = 0; i < candidates.length; i++) if (checks[i]) candidates[i]].take(3).toList();
    });
  }

  // ── Criação da conta (fim da etapa do @) ──
  Future<void> _createAccount() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final client = Supabase.instance.client;
      final res = await client.auth.signUp(
        email: _email.text.trim(),
        password: _pass.text,
        data: {
          'name': _name.text.trim(),
          'handle': _handle.text.trim(),
          if (_birth != null) 'birth_date': _birth!.toIso8601String().substring(0, 10),
        },
      );
      if (res.session == null) {
        await client.auth.signInWithPassword(email: _email.text.trim(), password: _pass.text);
      }
      await ensureProfile();
      _prefs?.setInt('ob_step', 5);
      HapticFeedback.mediumImpact();
      if (mounted) _go(5);
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Não foi possível criar a conta. Verifique sua conexão.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  // ── Foto ──
  Future<void> _pickPhoto(ImageSource src) async {
    final x = await ImagePicker().pickImage(source: src, imageQuality: 90);
    if (x != null && mounted) setState(() => _photo = File(x.path));
  }

  Future<void> _savePhotoAndNext() async {
    if (_photo == null) {
      _next();
      return;
    }
    setState(() => _busy = true);
    final url = await uploadProfileImage(_photo!, 'avatar');
    if (url != null) await updateMyProfile({'avatar_url': url});
    if (mounted) {
      setState(() => _busy = false);
      _next();
    }
  }

  // ── Recomendações por interesse ──
  Future<void> _loadRecs() async {
    if (_recs != null || _recsLoading) return;
    _recsLoading = true;
    final all = await recommendedProfiles();
    int score(Map<String, dynamic> p) {
      final bio = (p['bio'] ?? '').toString().toLowerCase();
      var s = 0;
      for (final i in _interests) {
        if (bio.contains(i.toLowerCase())) s += 2;
      }
      if (p['verified'] == true) s += 1;
      return s;
    }
    all.sort((a, b) => score(b).compareTo(score(a)));
    if (mounted) setState(() => _recs = all.take(10).toList());
  }

  // ── Conclusão ──
  Future<void> _finish() async {
    final p = _prefs ?? await SharedPreferences.getInstance();
    await p.setBool('ob_done', true);
    await p.remove('ob_step');
    startNotifications();
    obDone.value = true; // AuthGate troca para a Home com fade
  }

  @override
  Widget build(BuildContext context) {
    final showChrome = _step > 0 && _step < 10;
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(children: [
          if (showChrome)
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 20, 4),
              child: Row(children: [
                IconButton(
                  onPressed: _back,
                  icon: const Icon(Icons.arrow_back, size: 22, color: Colors.white),
                ),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      height: 5,
                      color: Colors.white12,
                      alignment: Alignment.centerLeft,
                      child: AnimatedFractionallySizedBox(
                        duration: const Duration(milliseconds: 340),
                        curve: Curves.easeOutCubic,
                        widthFactor: _step / (_totalSteps - 1),
                        heightFactor: 1,
                        child: Container(color: _lilas),
                      ),
                    ),
                  ),
                ),
              ]),
            ),
          Expanded(
            child: PageView(
              controller: _pc,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _welcome(),
                _birthStep(),
                _nameStep(),
                _credsStep(),
                _handleStep(),
                _photoStep(),
                _interestsStep(),
                _recsStep(),
                _contactsStep(),
                _notifStep(),
                _CelebrationView(name: _name.text.trim(), onDone: _finish),
              ],
            ),
          ),
        ]),
      ),
    );
  }

  // ─────────────────────────── páginas ───────────────────────────

  Widget _welcome() {
    return Container(
      color: _lilas,
      child: Column(children: [
        const SizedBox(height: 26),
        const Text('monatiza',
            style: TextStyle(color: _ink, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
        const Spacer(),
        Container(
          width: 96,
          height: 96,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: const Color(0xFF0B0B10),
            borderRadius: BorderRadius.circular(26),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.35), blurRadius: 26, offset: const Offset(0, 10))],
          ),
          child: const Text('m', style: TextStyle(color: Colors.white, fontSize: 50, fontWeight: FontWeight.w800)),
        ),
        const SizedBox(height: 30),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 32),
          child: Text('Notícias e comunidade,\nnum só lugar',
              textAlign: TextAlign.center,
              style: TextStyle(color: _ink, fontSize: 30, fontWeight: FontWeight.w800, height: 1.15, letterSpacing: -0.8)),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 44),
          child: Text('Informe-se com jornalismo direto e converse com quem pensa grande.',
              textAlign: TextAlign.center,
              style: TextStyle(color: _ink.withOpacity(0.65), fontSize: 14.5, height: 1.45)),
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(children: [
            _PrimaryBtn(label: 'Começar', dark: true, onTap: _next),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: _ink.withOpacity(0.4), width: 1.4),
                  foregroundColor: _ink,
                  shape: const StadiumBorder(),
                  textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                ),
                onPressed: () => Navigator.push(
                    context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                child: const Text('Já tenho uma conta'),
              ),
            ),
          ]),
        ),
        const SizedBox(height: 24),
      ]),
    );
  }

  Widget _page({required String title, required String sub, required List<Widget> children, Widget? footer}) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title,
            style: const TextStyle(color: Colors.white, fontSize: 27, fontWeight: FontWeight.w800, height: 1.15, letterSpacing: -0.6)),
        const SizedBox(height: 8),
        Text(sub, style: const TextStyle(color: Colors.white54, fontSize: 14.5, height: 1.4)),
        const SizedBox(height: 26),
        ...children,
        if (footer != null) ...[const SizedBox(height: 26), footer],
      ]),
    );
  }

  Widget _birthStep() {
    final ok = _birth != null && _age >= 13;
    return _page(
      title: 'Quando você nasceu?',
      sub: 'Usamos só para garantir a idade mínima de 13 anos. Não aparece no seu perfil.',
      children: [
        Container(
          height: 210,
          decoration: BoxDecoration(color: _fill, borderRadius: BorderRadius.circular(20)),
          child: CupertinoTheme(
            data: const CupertinoThemeData(
              brightness: Brightness.dark,
              textTheme: CupertinoTextThemeData(
                dateTimePickerTextStyle: TextStyle(color: Colors.white, fontSize: 19),
              ),
            ),
            child: CupertinoDatePicker(
              mode: CupertinoDatePickerMode.date,
              initialDateTime: _birth ?? DateTime(2000, 6, 15),
              minimumDate: DateTime(1920),
              maximumDate: DateTime.now(),
              onDateTimeChanged: (d) {
                setState(() => _birth = d);
                _prefs?.setString('ob_birth', d.toIso8601String());
              },
            ),
          ),
        ),
        if (_birth != null && _age < 13)
          const Padding(
            padding: EdgeInsets.only(top: 12),
            child: Text('É preciso ter pelo menos 13 anos para usar a Monatiza.',
                style: TextStyle(color: Color(0xFFFF6B7A), fontSize: 13)),
          ),
      ],
      footer: _PrimaryBtn(label: 'Continuar', enabled: ok, onTap: _next),
    );
  }

  Widget _nameStep() {
    final n = _name.text.trim();
    return _page(
      title: 'Como devemos\nte chamar?',
      sub: 'Esse é o nome que aparece no seu perfil. Dá para mudar depois.',
      children: [
        TextField(
          controller: _name,
          textCapitalization: TextCapitalization.words,
          autofocus: false,
          style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800),
          cursorColor: _lilas,
          onChanged: (v) {
            setState(() {});
            _prefs?.setString('ob_name', v);
          },
          decoration: const InputDecoration(
            hintText: 'Seu nome',
            hintStyle: TextStyle(color: Colors.white24, fontSize: 24, fontWeight: FontWeight.w800),
            border: InputBorder.none,
            filled: false,
          ),
        ),
        Container(height: 1.4, color: n.isEmpty ? Colors.white12 : _lilas),
        const SizedBox(height: 22),
        // Preview em tempo real
        AnimatedOpacity(
          duration: const Duration(milliseconds: 200),
          opacity: n.isEmpty ? 0.35 : 1,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _fill,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white.withOpacity(0.07)),
            ),
            child: Row(children: [
              CircleAvatar(
                radius: 21,
                backgroundColor: _lilas,
                child: Text(n.isEmpty ? '?' : n[0].toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 17)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(n.isEmpty ? 'Olá! 👋' : 'Olá, $n 👋',
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
              ),
            ]),
          ),
        ),
      ],
      footer: _PrimaryBtn(label: 'Continuar', enabled: n.length >= 2, onTap: _next),
    );
  }

  InputDecoration _dec(String hint, {Widget? suffix}) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white30, fontSize: 14),
        suffixIcon: suffix,
        filled: true,
        fillColor: _fill,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: _lilas, width: 1.4)),
      );

  Widget _credsStep() {
    final emailOk = RegExp(r'.+@.+\..+').hasMatch(_email.text.trim());
    final passOk = _pass.text.length >= 6;
    return _page(
      title: 'Crie seu acesso',
      sub: 'Seu e-mail e uma senha segura — é com eles que você entra.',
      children: [
        const Text('E-MAIL', style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1)),
        const SizedBox(height: 7),
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          autocorrect: false,
          style: const TextStyle(color: Colors.white),
          onChanged: (v) {
            setState(() {});
            _prefs?.setString('ob_email', v.trim());
          },
          decoration: _dec('exemplo@gmail.com'),
        ),
        const SizedBox(height: 16),
        const Text('SENHA', style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1)),
        const SizedBox(height: 7),
        TextField(
          controller: _pass,
          obscureText: !_showPass,
          style: const TextStyle(color: Colors.white),
          onChanged: (_) => setState(() {}),
          decoration: _dec('mínimo 6 caracteres',
              suffix: IconButton(
                icon: Icon(_showPass ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    size: 20, color: Colors.white38),
                onPressed: () => setState(() => _showPass = !_showPass),
              )),
        ),
      ],
      footer: _PrimaryBtn(label: 'Continuar', enabled: emailOk && passOk, onTap: _next),
    );
  }

  Widget _handleStep() {
    Widget status;
    switch (_hStatus) {
      case _HandleStatus.checking:
        status = const Row(children: [
          SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white38)),
          SizedBox(width: 8),
          Text('Verificando…', style: TextStyle(color: Colors.white38, fontSize: 13)),
        ]);
        break;
      case _HandleStatus.free:
        status = const Row(children: [
          Icon(Icons.check_circle, size: 16, color: Color(0xFF34C77B)),
          SizedBox(width: 6),
          Text('Disponível!', style: TextStyle(color: Color(0xFF34C77B), fontSize: 13, fontWeight: FontWeight.w700)),
        ]);
        break;
      case _HandleStatus.taken:
        status = const Row(children: [
          Icon(Icons.cancel, size: 16, color: Color(0xFFFF6B7A)),
          SizedBox(width: 6),
          Text('Esse @ já está em uso.', style: TextStyle(color: Color(0xFFFF6B7A), fontSize: 13, fontWeight: FontWeight.w700)),
        ]);
        break;
      default:
        status = const Text('Pelo menos 3 caracteres — letras, números e _',
            style: TextStyle(color: Colors.white38, fontSize: 13));
    }
    return _page(
      title: 'Escolha seu @',
      sub: 'É o seu endereço único na Monatiza.',
      children: [
        TextField(
          controller: _handle,
          autocorrect: false,
          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
          onChanged: _onHandleChanged,
          decoration: _dec('seunome').copyWith(
            prefixText: '@',
            prefixStyle: const TextStyle(color: _lilas, fontSize: 18, fontWeight: FontWeight.w800),
          ),
        ),
        const SizedBox(height: 10),
        status,
        if (_hSugs.isNotEmpty) ...[
          const SizedBox(height: 16),
          const Text('SUGESTÕES LIVRES',
              style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _hSugs
                .map((s) => GestureDetector(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        _handle.text = s;
                        _onHandleChanged(s);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: _lilas.withOpacity(0.6)),
                        ),
                        child: Text('@$s',
                            style: const TextStyle(color: _lilas, fontWeight: FontWeight.w700, fontSize: 13)),
                      ),
                    ))
                .toList(),
          ),
        ],
        if (_error != null) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFE0263B).withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(_error!, style: const TextStyle(color: Color(0xFFFF6B7A), fontSize: 13, height: 1.35)),
          ),
        ],
      ],
      footer: _PrimaryBtn(
        label: 'Criar conta',
        enabled: _hStatus == _HandleStatus.free,
        loading: _busy,
        onTap: _createAccount,
      ),
    );
  }

  Widget _photoStep() {
    return _page(
      title: 'Uma foto sua',
      sub: 'Perfis com foto recebem muito mais conexões. Você pode pular e adicionar depois.',
      children: [
        Center(
          child: Container(
            width: 148,
            height: 148,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: _lilas.withOpacity(0.6), width: 2),
              image: _photo != null
                  ? DecorationImage(image: FileImage(_photo!), fit: BoxFit.cover)
                  : null,
              color: _fill,
            ),
            child: _photo == null
                ? const Icon(Icons.person_outline, size: 56, color: Colors.white24)
                : null,
          ),
        ),
        const SizedBox(height: 24),
        Row(children: [
          Expanded(
            child: _GhostBtn(
              icon: Icons.photo_camera_outlined,
              label: 'Tirar foto',
              onTap: () => _pickPhoto(ImageSource.camera),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _GhostBtn(
              icon: Icons.image_outlined,
              label: 'Galeria',
              onTap: () => _pickPhoto(ImageSource.gallery),
            ),
          ),
        ]),
      ],
      footer: Column(children: [
        _PrimaryBtn(label: 'Continuar', loading: _busy, onTap: _savePhotoAndNext),
        TextButton(
          onPressed: _busy ? null : _next,
          child: const Text('Pular por enquanto', style: TextStyle(color: Colors.white54)),
        ),
      ]),
    );
  }

  Widget _interestsStep() {
    return _page(
      title: 'O que te interessa?',
      sub: 'Escolha quantos quiser — usamos para recomendar conteúdo e pessoas.',
      children: [
        Wrap(
          spacing: 9,
          runSpacing: 10,
          children: _allInterests.map((i) {
            final on = _interests.contains(i);
            return GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                setState(() => on ? _interests.remove(i) : _interests.add(i));
                _prefs?.setString('ob_interests', _interests.join(','));
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                decoration: BoxDecoration(
                  color: on ? _lilas : _fill,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: on ? _lilas : Colors.white12),
                ),
                child: Text(i,
                    style: TextStyle(
                        color: on ? Colors.white : Colors.white70,
                        fontWeight: FontWeight.w700,
                        fontSize: 13.5)),
              ),
            );
          }).toList(),
        ),
      ],
      footer: Column(children: [
        _PrimaryBtn(
          label: _interests.isEmpty ? 'Continuar' : 'Continuar (${_interests.length})',
          enabled: _interests.isNotEmpty,
          onTap: () {
            _loadRecs();
            _next();
          },
        ),
        TextButton(
          onPressed: () {
            _loadRecs();
            _next();
          },
          child: const Text('Pular', style: TextStyle(color: Colors.white54)),
        ),
      ]),
    );
  }

  Widget _recsStep() {
    _loadRecs();
    final recs = _recs;
    return _page(
      title: 'Pessoas para você',
      sub: 'Sugestões com base nos seus interesses. Siga quem fizer sentido.',
      children: [
        if (recs == null)
          // Skeleton loading
          Column(
            children: List.generate(
              4,
              (i) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                height: 64,
                decoration: BoxDecoration(color: _fill, borderRadius: BorderRadius.circular(16)),
              ),
            ),
          )
        else if (recs.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: _fill, borderRadius: BorderRadius.circular(16)),
            child: const Center(
                child: Text('Sem sugestões por enquanto — você encontra pessoas na busca. 🙂',
                    textAlign: TextAlign.center, style: TextStyle(color: Colors.white54))),
          )
        else
          Column(
            children: recs.map((p) {
              final uid = p['user_id'] as String;
              final on = _followed.contains(uid);
              final nm = (p['display_name'] ?? p['handle'] ?? 'Membro').toString();
              final bio = (p['bio'] ?? '').toString();
              final avatar = p['avatar_url'] as String?;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _fill,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Row(children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: _lilas,
                    backgroundImage: (avatar != null && avatar.isNotEmpty) ? NetworkImage(avatar) : null,
                    child: (avatar == null || avatar.isEmpty)
                        ? Text(nm[0].toUpperCase(),
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800))
                        : null,
                  ),
                  const SizedBox(width: 11),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Flexible(
                            child: Text(nm,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14))),
                        if (p['verified'] == true)
                          Padding(
                              padding: const EdgeInsets.only(left: 4),
                              child: VerifiedBadge(size: 12, tier: p['verified_tier'])),
                      ]),
                      if (bio.isNotEmpty)
                        Text(bio,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white54, fontSize: 12)),
                    ]),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    height: 32,
                    child: on
                        ? OutlinedButton(
                            onPressed: () {
                              setState(() => _followed.remove(uid));
                              follow(uid, false);
                            },
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.white24),
                              shape: const StadiumBorder(),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                            ),
                            child: const Text('Seguindo'),
                          )
                        : FilledButton(
                            onPressed: () {
                              HapticFeedback.selectionClick();
                              setState(() => _followed.add(uid));
                              follow(uid, true);
                            },
                            style: FilledButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.black,
                              shape: const StadiumBorder(),
                              padding: const EdgeInsets.symmetric(horizontal: 15),
                              textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
                            ),
                            child: const Text('Seguir'),
                          ),
                  ),
                ]),
              );
            }).toList(),
          ),
      ],
      footer: _PrimaryBtn(label: 'Continuar', onTap: _next),
    );
  }

  Widget _bigIconPage({
    required IconData icon,
    required String title,
    required String sub,
    required List<String> bullets,
    required String primary,
    required VoidCallback onPrimary,
    required VoidCallback onSkip,
  }) {
    return _page(
      title: title,
      sub: sub,
      children: [
        Center(
          child: Container(
            width: 108,
            height: 108,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(32),
              gradient: LinearGradient(
                colors: [_lilas.withOpacity(0.3), Colors.white.withOpacity(0.02)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border.all(color: _lilas.withOpacity(0.5), width: 1.2),
              boxShadow: [BoxShadow(color: _lilas.withOpacity(0.3), blurRadius: 50, spreadRadius: 4)],
            ),
            child: Icon(icon, size: 46, color: Colors.white),
          ),
        ),
        const SizedBox(height: 26),
        ...bullets.map((b) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                  margin: const EdgeInsets.only(top: 2),
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: _lilas.withOpacity(0.16), shape: BoxShape.circle),
                  child: const Icon(Icons.check, size: 12, color: _lilas),
                ),
                const SizedBox(width: 10),
                Expanded(child: Text(b, style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.4))),
              ]),
            )),
      ],
      footer: Column(children: [
        _PrimaryBtn(label: primary, onTap: onPrimary),
        TextButton(
          onPressed: onSkip,
          child: const Text('Agora não', style: TextStyle(color: Colors.white54)),
        ),
      ]),
    );
  }

  Widget _contactsStep() {
    return _bigIconPage(
      icon: Icons.group_add_outlined,
      title: 'Encontre quem\nvocê conhece',
      sub: 'Quando a sincronização de contatos estiver ativa, avisamos primeiro quem optar por ela.',
      bullets: const [
        'Descubra amigos que já estão na Monatiza',
        'Monte sua rede em segundos',
        'Seus contatos nunca são publicados',
      ],
      primary: 'Quero participar',
      onPrimary: () {
        _prefs?.setBool('ob_contacts_optin', true);
        HapticFeedback.selectionClick();
        _next();
      },
      onSkip: _next,
    );
  }

  Widget _notifStep() {
    return _bigIconPage(
      icon: Icons.notifications_active_outlined,
      title: 'Fique por dentro',
      sub: 'Ative as notificações para não perder o que importa.',
      bullets: const [
        'Saiba na hora quando alguém te mandar mensagem',
        'Novas publicações de quem você segue',
        'Sem spam: só o que é seu',
      ],
      primary: 'Ativar notificações',
      onPrimary: () async {
        await askNotificationPermission();
        startNotifications();
        HapticFeedback.mediumImpact();
        _next();
      },
      onSkip: _next,
    );
  }
}

enum _HandleStatus { idle, checking, free, taken }

/// Botão principal com microinteração (escala no toque + haptic).
class _PrimaryBtn extends StatefulWidget {
  final String label;
  final bool enabled;
  final bool loading;
  final bool dark; // fundo escuro (na tela lilás)
  final VoidCallback onTap;
  const _PrimaryBtn({
    required this.label,
    required this.onTap,
    this.enabled = true,
    this.loading = false,
    this.dark = false,
  });
  @override
  State<_PrimaryBtn> createState() => _PrimaryBtnState();
}

class _PrimaryBtnState extends State<_PrimaryBtn> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final active = widget.enabled && !widget.loading;
    return GestureDetector(
      onTapDown: active ? (_) => setState(() => _down = true) : null,
      onTapCancel: () => setState(() => _down = false),
      onTapUp: active
          ? (_) {
              setState(() => _down = false);
              HapticFeedback.lightImpact();
              widget.onTap();
            }
          : null,
      child: AnimatedScale(
        scale: _down ? 0.96 : 1,
        duration: const Duration(milliseconds: 110),
        child: AnimatedOpacity(
          duration: const Duration(milliseconds: 150),
          opacity: active ? 1 : 0.45,
          child: Container(
            width: double.infinity,
            height: 54,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: widget.dark ? const Color(0xFF0B0B10) : _lilas,
              borderRadius: BorderRadius.circular(30),
            ),
            child: widget.loading
                ? const SizedBox(
                    width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text(widget.label,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
          ),
        ),
      ),
    );
  }
}

/// Botão secundário translúcido (Tirar foto / Galeria).
class _GhostBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _GhostBtn({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: Container(
        height: 50,
        decoration: BoxDecoration(
          color: _fill,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 18, color: Colors.white70),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13.5)),
        ]),
      ),
    );
  }
}

/// Tela final: partículas comemorativas + boas-vindas → Home.
class _CelebrationView extends StatefulWidget {
  final String name;
  final Future<void> Function() onDone;
  const _CelebrationView({required this.name, required this.onDone});
  @override
  State<_CelebrationView> createState() => _CelebrationViewState();
}

class _CelebrationViewState extends State<_CelebrationView> with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1100));
  bool _fired = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Dispara quando a página realmente aparece
    if (!_fired && (ModalRoute.of(context)?.isCurrent ?? true)) {
      _fired = true;
      HapticFeedback.mediumImpact();
      _c.forward();
      Future.delayed(const Duration(milliseconds: 1900), () {
        if (mounted) widget.onDone();
      });
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final first = widget.name.isEmpty ? '' : widget.name.split(' ').first;
    return Stack(alignment: Alignment.center, children: [
      Positioned.fill(
        child: AnimatedBuilder(
          animation: _c,
          builder: (_, __) => CustomPaint(painter: _ConfettiPainter(_c.value)),
        ),
      ),
      Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        ScaleTransition(
          scale: CurvedAnimation(parent: _c, curve: const Interval(0, 0.5, curve: Curves.elasticOut)),
          child: Container(
            width: 92,
            height: 92,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: _lilas),
            child: const Icon(Icons.check_rounded, size: 48, color: Colors.white),
          ),
        ),
        const SizedBox(height: 26),
        Text(first.isEmpty ? 'Tudo pronto!' : 'Bem-vindo, $first!',
            style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
        const SizedBox(height: 8),
        const Text('Sua conta está pronta. Bora explorar 🚀',
            style: TextStyle(color: Colors.white54, fontSize: 14.5)),
      ]),
    ]);
  }
}

/// Partículas simples e leves (sem bibliotecas).
class _ConfettiPainter extends CustomPainter {
  final double t;
  _ConfettiPainter(this.t);

  static final _rnd = math.Random(7);
  static final List<List<double>> _parts = List.generate(26, (_) {
    final ang = _rnd.nextDouble() * math.pi * 2;
    final dist = 90 + _rnd.nextDouble() * 130;
    final size = 3.0 + _rnd.nextDouble() * 4;
    final hue = _rnd.nextInt(3).toDouble();
    return [ang, dist, size, hue];
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (t <= 0.05) return;
    final center = Offset(size.width / 2, size.height / 2 - 40);
    final e = Curves.easeOutCubic.transform(t);
    for (final p in _parts) {
      final pos = center + Offset(math.cos(p[0]), math.sin(p[0])) * (p[1] * e);
      final color = switch (p[3].toInt()) {
        0 => _lilas,
        1 => const Color(0xFFC9A24B),
        _ => Colors.white,
      };
      canvas.drawCircle(pos, p[2] * (1 - t * 0.5), Paint()..color = color.withOpacity((1 - t).clamp(0.0, 1.0)));
    }
  }

  @override
  bool shouldRepaint(covariant _ConfettiPainter old) => old.t != t;
}
