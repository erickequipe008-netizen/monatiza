import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/ui.dart';

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

  InputDecoration _dec(String label, {String? prefix, Widget? suffix}) => InputDecoration(
        labelText: label,
        prefixText: prefix,
        suffixIcon: suffix,
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.05),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Criar conta')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Bem-vindo à Monatiza',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
              const SizedBox(height: 6),
              const Text('Leva menos de um minuto.', style: TextStyle(color: Colors.white54)),
              const SizedBox(height: 22),
              TextField(controller: _name, textCapitalization: TextCapitalization.words, decoration: _dec('Nome completo')),
              const SizedBox(height: 12),
              TextField(
                controller: _handle,
                onChanged: (v) {
                  final clean = v.replaceAll(RegExp(r'[^a-zA-Z0-9_]'), '').toLowerCase();
                  if (clean != v) {
                    _handle.value = TextEditingValue(text: clean, selection: TextSelection.collapsed(offset: clean.length));
                  }
                },
                decoration: _dec('Nome de usuário', prefix: '@'),
              ),
              const SizedBox(height: 12),
              TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: _dec('E-mail')),
              const SizedBox(height: 12),
              TextField(
                controller: _password,
                obscureText: !_show,
                decoration: _dec('Senha',
                    suffix: IconButton(
                      icon: Icon(_show ? Icons.visibility_off : Icons.visibility, color: Colors.white38),
                      onPressed: () => setState(() => _show = !_show),
                    )),
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: Colors.redAccent)),
              ],
              const SizedBox(height: 22),
              GradientButton(label: 'Criar conta', loading: _busy, onPressed: _busy ? null : _signup),
              const SizedBox(height: 14),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Já tenho conta · Entrar', style: TextStyle(color: Colors.white70)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
