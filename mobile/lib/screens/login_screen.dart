import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config.dart';
import 'signup_screen.dart';

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

  InputDecoration _dec(String hint, IconData icon, {Widget? suffix}) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white38),
        prefixIcon: Icon(icon, size: 20, color: Colors.white38),
        suffixIcon: suffix,
        filled: true,
        fillColor: const Color(0xFF101216),
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 17),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: Color(kAccent), width: 1.4)),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(backgroundColor: Colors.black),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(28, 8, 28, 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Que bom te ver\nde novo.',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, height: 1.15, letterSpacing: -0.8)),
              const SizedBox(height: 10),
              const Text('Entre com seu e-mail e senha.',
                  style: TextStyle(color: Colors.white54, fontSize: 15)),
              const SizedBox(height: 32),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                decoration: _dec('E-mail', Icons.alternate_email),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _password,
                obscureText: !_show,
                decoration: _dec('Senha', Icons.lock_outline,
                    suffix: IconButton(
                      icon: Icon(_show ? Icons.visibility_off : Icons.visibility, size: 20, color: Colors.white38),
                      onPressed: () => setState(() => _show = !_show),
                    )),
              ),
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
              const SizedBox(height: 26),
              SizedBox(
                height: 54,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(kAccent),
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
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pushReplacement(
                      context, MaterialPageRoute(builder: (_) => const SignupScreen())),
                  child: const Text.rich(TextSpan(children: [
                    TextSpan(text: 'Não tem conta?  ', style: TextStyle(color: Colors.white54)),
                    TextSpan(text: 'Criar conta', style: TextStyle(color: Color(0xFF1D9BF0), fontWeight: FontWeight.w700)),
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
