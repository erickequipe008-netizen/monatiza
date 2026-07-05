import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../db.dart';

const _accent = Color(0xFF8B5CF6);
const _danger = Color(0xFFE0263B);
const _base = 'https://www.monatiza.com/api/account';

/// Central da conta (igual ao site): alterar nome/e-mail/senha com código de
/// verificação de 6 dígitos, assinatura, sair e excluir conta.
class ContaScreen extends StatefulWidget {
  const ContaScreen({super.key});
  @override
  State<ContaScreen> createState() => _ContaScreenState();
}

class _ContaScreenState extends State<ContaScreen> {
  Map<String, dynamic>? _sub;
  bool _loading = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final s = await getSubscription();
    if (mounted) setState(() { _sub = s; _loading = false; });
  }

  String get _email => Supabase.instance.client.auth.currentUser?.email ?? '';

  void _snack(String msg) {
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  /// POST para /api/account/<path> com o token do usuário. Retorna o JSON ou null (mostra o erro).
  Future<Map<String, dynamic>?> _api(String path, Map<String, dynamic> body) async {
    final token = Supabase.instance.client.auth.currentSession?.accessToken;
    if (token == null) {
      _snack('Sessão expirada. Entre novamente.');
      return null;
    }
    try {
      final res = await http.post(
        Uri.parse('$_base/$path'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: jsonEncode(body),
      );
      final data = res.body.isNotEmpty ? jsonDecode(res.body) as Map<String, dynamic> : <String, dynamic>{};
      if (res.statusCode >= 200 && res.statusCode < 300) return data;
      _snack(data['error']?.toString() ?? 'Não foi possível concluir (${res.statusCode}).');
      return null;
    } catch (_) {
      _snack('Falha de conexão. Tente novamente.');
      return null;
    }
  }

  /// Fluxo completo: pede o novo valor → envia código → confirma código → aplica.
  Future<void> _change(String purpose, String title, String fieldLabel, {bool obscure = false}) async {
    final value = await _promptText(title, fieldLabel, obscure: obscure);
    if (value == null || value.trim().isEmpty) return;

    setState(() => _busy = true);
    final sent = await _api('send-code', {'purpose': purpose});
    if (!mounted) { return; }
    setState(() => _busy = false);
    if (sent == null) return;
    _snack('Enviamos um código para ${sent['sentTo'] ?? _email}.');

    final code = await _promptText(
      'Confirme com o código',
      'Código de 6 dígitos enviado ao seu e-mail',
      keyboardType: TextInputType.number,
    );
    if (code == null || code.trim().isEmpty) return;

    final payloadKey = purpose == 'name' ? 'name' : (purpose == 'email' ? 'email' : 'password');
    setState(() => _busy = true);
    final ok = await _api('verify-code', {
      'purpose': purpose,
      'code': code.trim(),
      'payload': {payloadKey: value.trim()},
    });
    if (!mounted) return;
    setState(() => _busy = false);
    if (ok != null) {
      _snack('$title concluído.');
      try { await Supabase.instance.client.auth.refreshSession(); } catch (_) {}
      _load();
    }
  }

  Future<void> _deleteAccount() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF16181C),
        title: const Text('Excluir conta'),
        content: const Text('Esta ação é permanente. Todos os seus dados serão apagados. Deseja continuar?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Excluir', style: TextStyle(color: _danger))),
        ],
      ),
    );
    if (ok != true) return;
    setState(() => _busy = true);
    final res = await _api('delete', {});
    if (!mounted) return;
    setState(() => _busy = false);
    if (res != null) {
      await Supabase.instance.client.auth.signOut();
    }
  }

  Future<String?> _promptText(String title, String label,
      {bool obscure = false, TextInputType? keyboardType}) {
    final ctrl = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF16181C),
        title: Text(title),
        content: TextField(
          controller: ctrl,
          obscureText: obscure,
          keyboardType: keyboardType,
          autofocus: true,
          decoration: InputDecoration(labelText: label),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          TextButton(onPressed: () => Navigator.pop(ctx, ctrl.text), child: const Text('Continuar')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final status = _sub?['status']?.toString() ?? '—';
    final plan = _sub?['plan']?.toString();
    final active = status == 'active';
    return Scaffold(
      appBar: AppBar(title: const Text('Central da conta')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Stack(children: [
              ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // ---- Cartão da conta ----
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(18)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('CONTA', style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
                      const SizedBox(height: 8),
                      Text(_email, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 10),
                      Row(children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: (active ? const Color(0xFF8B5CF6) : Colors.amber).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(active ? 'Assinatura ativa' : status,
                              style: TextStyle(color: active ? const Color(0xFF8B5CF6) : Colors.amber, fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                        if (plan != null)
                          Padding(padding: const EdgeInsets.only(left: 10), child: Text('Plano $plan', style: const TextStyle(color: Colors.white54))),
                      ]),
                    ]),
                  ),
                  const SizedBox(height: 18),
                  // ---- Login e segurança ----
                  const _SectionTitle('LOGIN E SEGURANÇA'),
                  _ActionTile(icon: Icons.badge_outlined, label: 'Alterar nome', onTap: () => _change('name', 'Alterar nome', 'Novo nome')),
                  _ActionTile(icon: Icons.alternate_email, label: 'Alterar e-mail', onTap: () => _change('email', 'Alterar e-mail', 'Novo e-mail')),
                  _ActionTile(icon: Icons.lock_outline, label: 'Alterar senha', onTap: () => _change('password', 'Alterar senha', 'Nova senha', obscure: true)),
                  const SizedBox(height: 18),
                  // ---- Assinatura ----
                  const _SectionTitle('ASSINATURA'),
                  _ActionTile(
                    icon: Icons.open_in_new,
                    label: 'Gerenciar assinatura no site',
                    onTap: () => launchUrl(Uri.parse('https://www.monatiza.com/painel'), mode: LaunchMode.externalApplication),
                  ),
                  const SizedBox(height: 18),
                  // ---- Sessão ----
                  const _SectionTitle('SESSÃO'),
                  _ActionTile(icon: Icons.logout, label: 'Sair', onTap: () => Supabase.instance.client.auth.signOut()),
                  _ActionTile(icon: Icons.delete_outline, label: 'Excluir conta', danger: true, onTap: _deleteAccount),
                  const SizedBox(height: 24),
                  const Center(child: Text('Monatiza', style: TextStyle(color: Colors.white24, fontWeight: FontWeight.w800, letterSpacing: 1))),
                ],
              ),
              if (_busy)
                Container(
                  color: Colors.black45,
                  child: const Center(child: CircularProgressIndicator()),
                ),
            ]),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 8),
        child: Text(text, style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
      );
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool danger;
  const _ActionTile({required this.icon, required this.label, required this.onTap, this.danger = false});
  @override
  Widget build(BuildContext context) {
    final color = danger ? _danger : Colors.white;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(14)),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        leading: Icon(icon, color: danger ? _danger : _accent, size: 22),
        title: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
        trailing: Icon(Icons.chevron_right, color: danger ? _danger.withOpacity(0.6) : Colors.white24),
        onTap: onTap,
      ),
    );
  }
}
