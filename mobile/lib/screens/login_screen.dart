import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../auth_gate.dart';
import '../config.dart';
import 'signup_screen.dart';

const _accent = Color(kAccent);

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  bool _show = false;
  String? _error;

  Future<void> _login() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await Supabase.instance.client.auth
          .signInWithPassword(email: _email.text.trim(), password: _password.text);
      // Quem já tem conta não passa pelo cadastro guiado
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('ob_done', true);
      obDone.value = true;
      if (mounted) Navigator.of(context).popUntil((r) => r.isFirst);
    } on AuthException catch (e) {
      final m = e.message;
      final network = m.contains('SocketException') ||
          m.contains('Failed host lookup') ||
          m.contains('Failed to fetch');
      setState(() => _error = network
          ? 'Sem conexão com a internet. Verifique sua rede e tente novamente.'
          : m);
    } catch (e) {
      final s = e.toString();
      final network = s.contains('SocketException') || s.contains('Failed host lookup');
      setState(() => _error = network
          ? 'Sem conexão com a internet. Verifique sua rede.'
          : 'Não foi possível entrar.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _forgot() async {
    final email = _email.text.trim();
    if (email.isEmpty) {
      _snack('Digite seu e-mail acima e toque de novo em "Esqueceu a senha?".');
      return;
    }
    try {
      await Supabase.instance.client.auth.resetPasswordForEmail(email);
      _snack('Enviamos um link de redefinição para $email.');
    } catch (_) {
      _snack('Não foi possível enviar. Confira o e-mail digitado.');
    }
  }

  void _snack(String m) {
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m)));
  }

  InputDecoration _dec(String hint, {Widget? suffix}) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white30, fontSize: 14),
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
                child: Text('Entrar',
                    style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, letterSpacing: -0.6)),
              ),
              const SizedBox(height: 8),
              const Center(
                child: Text('Olá! Que bom te ver de novo por aqui.',
                    style: TextStyle(color: Colors.white54, fontSize: 14)),
              ),
              const SizedBox(height: 30),
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
                decoration: _dec('••••••••••••',
                    suffix: IconButton(
                      icon: Icon(_show ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          size: 20, color: Colors.white38),
                      onPressed: () => setState(() => _show = !_show),
                    )),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: _forgot,
                  child: const Text('Esqueceu a senha?',
                      style: TextStyle(color: _accent, fontSize: 13, fontWeight: FontWeight.w700)),
                ),
              ),
              if (_error != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0263B).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(_error!, style: const TextStyle(color: Color(0xFFFF6B7A), fontSize: 13, height: 1.35)),
                ),
                const SizedBox(height: 14),
              ],
              SizedBox(
                height: 54,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: _accent,
                    foregroundColor: Colors.white,
                    shape: const StadiumBorder(),
                    textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                  ),
                  onPressed: _busy ? null : _login,
                  child: _busy
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Entrar'),
                ),
              ),
              const SizedBox(height: 24),
              const _OrDivider(label: 'ou entre com'),
              const SizedBox(height: 18),
              const _SocialRow(),
              const SizedBox(height: 22),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pushReplacement(
                      context, MaterialPageRoute(builder: (_) => const SignupScreen())),
                  child: const Text.rich(TextSpan(children: [
                    TextSpan(text: 'Não tem conta?  ', style: TextStyle(color: Colors.white54)),
                    TextSpan(text: 'Criar conta', style: TextStyle(color: _accent, fontWeight: FontWeight.w700)),
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

/// Divisor "ou entre com".
class _OrDivider extends StatelessWidget {
  final String label;
  const _OrDivider({required this.label});
  @override
  Widget build(BuildContext context) => Row(children: [
        const Expanded(child: Divider(color: Colors.white12)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12)),
        ),
        const Expanded(child: Divider(color: Colors.white12)),
      ]);
}

/// Botões sociais (Apple, Google, Facebook) — por enquanto só visual.
class _SocialRow extends StatelessWidget {
  const _SocialRow();

  void _soon(BuildContext c) => ScaffoldMessenger.of(c)
      .showSnackBar(const SnackBar(content: Text('Login social em breve. Use e-mail e senha.')));

  Widget _circle(BuildContext c, Widget child) => GestureDetector(
        onTap: () => _soon(c),
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
    return Row(mainAxisAlignment: MainAxisAlignment.center, children: [
      _circle(context, const Icon(Icons.apple, size: 26, color: Colors.white)),
      const SizedBox(width: 16),
      _circle(context, const Text('G', style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: Colors.white))),
      const SizedBox(width: 16),
      _circle(context, const Icon(Icons.facebook, size: 25, color: Colors.white)),
    ]);
  }
}
