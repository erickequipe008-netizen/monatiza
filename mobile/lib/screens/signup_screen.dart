import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config.dart';

const _accent = Color(kAccent);

/// Cadastro dentro do app (sem sair para o navegador).
class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});
  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _name = TextEditingController();
  final _handle = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  bool _show = false;
  bool _agree = false;
  String? _error;

  Future<void> _signup() async {
    final name = _name.text.trim();
    final handle = _handle.text.trim().toLowerCase();
    final email = _email.text.trim();
    final pass = _password.text;

    if (name.isEmpty) return setState(() => _error = 'Digite seu nome.');
    if (handle.length < 3) return setState(() => _error = 'Escolha um nome de usuário (mín. 3 caracteres).');
    if (pass.length < 6) return setState(() => _error = 'A senha deve ter no mínimo 6 caracteres.');
    if (!RegExp(r'.+@.+\..+').hasMatch(email)) return setState(() => _error = 'Digite um e-mail válido.');

    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final client = Supabase.instance.client;
      final res = await client.auth.signUp(
        email: email,
        password: pass,
        data: {'name': name, 'handle': handle},
      );
      if (res.session == null) {
        // confirmação de e-mail ligada → tenta entrar
        await client.auth.signInWithPassword(email: email, password: pass);
      }
      if (mounted) Navigator.of(context).popUntil((r) => r.isFirst);
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  InputDecoration _dec(String hint, {String? prefix, Widget? suffix}) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white30, fontSize: 14),
        prefixText: prefix,
        suffixIcon: suffix,
        filled: true,
        fillColor: const Color(0xFF101216),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: _accent, width: 1.4)),
      );

  Widget _label(String t) => Padding(
        padding: const EdgeInsets.only(bottom: 7),
        child: Text(t, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white70)),
      );

  void _soon() => ScaffoldMessenger.of(context)
      .showSnackBar(const SnackBar(content: Text('Cadastro social em breve. Use e-mail e senha.')));

  Widget _circle(Widget child) => GestureDetector(
        onTap: _soon,
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white.withOpacity(0.05),
            border: Border.all(color: Colors.white12),
          ),
          child: Center(child: child),
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(backgroundColor: Colors.black),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(26, 4, 26, 26),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Center(
                child: Text('Criar conta',
                    style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, letterSpacing: -0.6)),
              ),
              const SizedBox(height: 8),
              const Center(
                child: Text('Preencha seus dados abaixo. Leva menos de um minuto.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white54, fontSize: 14)),
              ),
              const SizedBox(height: 28),
              _label('Nome'),
              TextField(
                controller: _name,
                textCapitalization: TextCapitalization.words,
                decoration: _dec('Ex.: João Silva'),
              ),
              const SizedBox(height: 16),
              _label('Nome de usuário'),
              TextField(
                controller: _handle,
                onChanged: (v) {
                  final clean = v.replaceAll(RegExp(r'[^a-zA-Z0-9_]'), '').toLowerCase();
                  if (clean != v) {
                    _handle.value = TextEditingValue(text: clean, selection: TextSelection.collapsed(offset: clean.length));
                  }
                },
                decoration: _dec('seunome', prefix: '@'),
              ),
              const SizedBox(height: 16),
              _label('E-mail'),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                decoration: _dec('exemplo@gmail.com'),
              ),
              const SizedBox(height: 16),
              _label('Senha'),
              TextField(
                controller: _password,
                obscureText: !_show,
                decoration: _dec('mínimo 6 caracteres',
                    suffix: IconButton(
                      icon: Icon(_show ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          size: 20, color: Colors.white38),
                      onPressed: () => setState(() => _show = !_show),
                    )),
              ),
              const SizedBox(height: 14),
              // Aceite dos termos (obrigatório, como no modelo)
              Row(children: [
                SizedBox(
                  width: 24,
                  height: 24,
                  child: Checkbox(
                    value: _agree,
                    activeColor: _accent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    side: const BorderSide(color: Colors.white38, width: 1.4),
                    onChanged: (v) => setState(() => _agree = v ?? false),
                  ),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Text.rich(TextSpan(children: [
                    TextSpan(text: 'Concordo com os ', style: TextStyle(color: Colors.white54, fontSize: 12.5)),
                    TextSpan(text: 'Termos e a Política de Privacidade', style: TextStyle(color: _accent, fontSize: 12.5, fontWeight: FontWeight.w700)),
                  ])),
                ),
              ]),
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
              const SizedBox(height: 20),
              SizedBox(
                height: 54,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: _accent,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: _accent.withOpacity(0.35),
                    shape: const StadiumBorder(),
                    textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                  ),
                  onPressed: (_busy || !_agree) ? null : _signup,
                  child: _busy
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Criar conta'),
                ),
              ),
              const SizedBox(height: 24),
              Row(children: [
                const Expanded(child: Divider(color: Colors.white12)),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12),
                  child: Text('ou cadastre-se com', style: TextStyle(color: Colors.white38, fontSize: 12)),
                ),
                const Expanded(child: Divider(color: Colors.white12)),
              ]),
              const SizedBox(height: 18),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                _circle(const Icon(Icons.apple, size: 26, color: Colors.white)),
                const SizedBox(width: 16),
                _circle(const Text('G', style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: Colors.white))),
                const SizedBox(width: 16),
                _circle(const Icon(Icons.facebook, size: 25, color: Colors.white)),
              ]),
              const SizedBox(height: 20),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text.rich(TextSpan(children: [
                    TextSpan(text: 'Já tem conta?  ', style: TextStyle(color: Colors.white54)),
                    TextSpan(text: 'Entrar', style: TextStyle(color: _accent, fontWeight: FontWeight.w700)),
                  ])),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
