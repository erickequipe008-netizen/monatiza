import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../db.dart';

class ContaScreen extends StatefulWidget {
  const ContaScreen({super.key});
  @override
  State<ContaScreen> createState() => _ContaScreenState();
}

class _ContaScreenState extends State<ContaScreen> {
  Map<String, dynamic>? _sub;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final s = await getSubscription();
    if (mounted) setState(() { _sub = s; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    final status = _sub?['status']?.toString() ?? "—";
    final plan = _sub?['plan']?.toString();
    final email = Supabase.instance.client.auth.currentUser?.email ?? "";
    return Scaffold(
      appBar: AppBar(title: const Text("Minha conta")),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(18)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(email, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 10),
                      Row(children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: status == "active" ? Colors.green.withValues(alpha: 0.2) : Colors.amber.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(status == "active" ? "Ativa" : status,
                              style: TextStyle(color: status == "active" ? Colors.green : Colors.amber, fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                        if (plan != null) Padding(padding: const EdgeInsets.only(left: 10), child: Text("Plano $plan", style: const TextStyle(color: Colors.white54))),
                      ]),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: () => launchUrl(Uri.parse("https://www.monatiza.com/painel"), mode: LaunchMode.externalApplication),
                  icon: const Icon(Icons.open_in_new, size: 18),
                  label: const Text("Gerenciar assinatura no site"),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: () => Supabase.instance.client.auth.signOut(),
                  icon: const Icon(Icons.logout, size: 18),
                  label: const Text("Sair"),
                ),
              ],
            ),
    );
  }
}
