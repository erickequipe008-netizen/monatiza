import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../db.dart';
import '../widgets/tone.dart';

const _accent = Color(0xFF8B5CF6);

/// Upgrade — benefícios da assinatura Monatiza e checkout no site.
class UpgradeScreen extends StatefulWidget {
  const UpgradeScreen({super.key});
  @override
  State<UpgradeScreen> createState() => _UpgradeScreenState();
}

class _UpgradeScreenState extends State<UpgradeScreen> {
  bool _loading = true;
  bool _active = false;

  static const _benefits = [
    ('Matérias exclusivas', 'Conteúdo premium liberado no app e no site'),
    ('Revistas e edições especiais', 'Acervo completo para ler quando quiser'),
    ('Leitura sem anúncios no site', 'Experiência limpa no ambiente do assinante'),
    ('Biblioteca e histórico', 'Salve, curta e continue de onde parou'),
    ('Newsletter personalizada', 'Os temas que você escolher, no seu e-mail'),
  ];

  @override
  void initState() {
    super.initState();
    getSubscription().then((s) {
      if (mounted) {
        setState(() {
          _active = s?['status']?.toString() == 'active';
          _loading = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Monatiza Premium', style: TextStyle(fontSize: 17))),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Herói
                Container(
                  width: 88,
                  height: 88,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(26),
                    gradient: const LinearGradient(
                      colors: [Color(0xFFA78BFA), Color(0xFF7C3AED)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [BoxShadow(color: _accent.withOpacity(0.35), blurRadius: 40, spreadRadius: 2)],
                  ),
                  child: const Icon(Icons.auto_awesome, size: 40, color: Colors.white),
                ),
                const SizedBox(height: 18),
                const Text('Desbloqueie tudo\nda Monatiza',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, height: 1.15, letterSpacing: -0.6)),
                const SizedBox(height: 8),
                Text('Assine e tenha a experiência completa, no app e no site.',
                    textAlign: TextAlign.center, style: TextStyle(color: t54(context), fontSize: 14)),
                const SizedBox(height: 24),
                // Benefícios
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: tCardC(context),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: t12(context)),
                  ),
                  child: Column(
                    children: [
                      for (final b in _benefits)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Container(
                              margin: const EdgeInsets.only(top: 1),
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(color: _accent.withOpacity(0.15), shape: BoxShape.circle),
                              child: const Icon(Icons.check, size: 13, color: _accent),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(b.$1, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5)),
                                const SizedBox(height: 1),
                                Text(b.$2, style: TextStyle(color: t54(context), fontSize: 12.5, height: 1.3)),
                              ]),
                            ),
                          ]),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),
                if (_active)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _accent.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(Icons.verified, size: 18, color: _accent),
                      SizedBox(width: 8),
                      Text('Você já é assinante — obrigado! 💜',
                          style: TextStyle(fontWeight: FontWeight.w700, color: _accent)),
                    ]),
                  )
                else ...[
                  SizedBox(
                    height: 54,
                    child: FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: Colors.white,
                        shape: const StadiumBorder(),
                        textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                      onPressed: () => launchUrl(
                        Uri.parse('https://www.monatiza.com/assinantes'),
                        mode: LaunchMode.externalApplication,
                      ),
                      child: const Text('Assinar agora'),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.lock_outline, size: 12, color: t38(context)),
                    const SizedBox(width: 5),
                    Text('Pagamento seguro via Stripe • cancele quando quiser',
                        style: TextStyle(color: t38(context), fontSize: 11)),
                  ]),
                ],
                const SizedBox(height: 24),
              ],
            ),
    );
  }
}
