import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../db.dart';
import '../widgets/verified_badge.dart';

class VerificacaoScreen extends StatefulWidget {
  const VerificacaoScreen({super.key});
  @override
  State<VerificacaoScreen> createState() => _VerificacaoScreenState();
}

class _VerificacaoScreenState extends State<VerificacaoScreen> {
  bool _loading = true;
  bool _verified = false;
  String? _status;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final v = await getVerification();
    if (mounted) setState(() { _verified = v['verified'] == true; _status = v['status']?.toString(); _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Verificação")),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: _verified
                    ? _box(const VerifiedBadge(size: 52), "Você é verificado", "O selo dourado aparece ao lado do seu nome.")
                    : (_status == "review" || _status == "paid")
                        ? _box(const Icon(Icons.hourglass_top, color: Color(0xFFC9A24B), size: 44), "Em análise", "Confirmamos sua identidade em até 48h.")
                        : Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const VerifiedBadge(size: 52),
                              const SizedBox(height: 16),
                              const Text("Selo de verificado", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                              const SizedBox(height: 8),
                              const Text("Ganhe o selo dourado ao lado do seu nome. Pagamento único de R\$ 39,90.",
                                  textAlign: TextAlign.center, style: TextStyle(color: Colors.white54)),
                              const SizedBox(height: 24),
                              FilledButton(
                                onPressed: () => launchUrl(Uri.parse("https://www.monatiza.com/app/verificacao"), mode: LaunchMode.externalApplication),
                                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF9B72CB), padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14)),
                                child: const Text("Continuar · R\$ 39,90"),
                              ),
                            ],
                          ),
              ),
            ),
    );
  }

  Widget _box(Widget icon, String title, String sub) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          icon,
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text(sub, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white54)),
        ],
      );
}
