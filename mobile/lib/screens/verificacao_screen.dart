import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../db.dart';
import '../widgets/tone.dart';
import '../widgets/verified_badge.dart';

const _accent = Color(0xFF8B5CF6);
const _gold = Color(0xFFC9A24B);

/// Verificação — igual ao site: escolha entre Selo Prata e Selo Ouro,
/// pagamento e envio de documento + selfie para análise.
class VerificacaoScreen extends StatefulWidget {
  const VerificacaoScreen({super.key});
  @override
  State<VerificacaoScreen> createState() => _VerificacaoScreenState();
}

class _VerificacaoScreenState extends State<VerificacaoScreen> {
  bool _loading = true;
  bool _verified = false;
  String? _status;
  String? _paying;
  bool _busy = false;
  String? _error;
  File? _doc;
  File? _selfie;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final v = await getVerification();
    if (mounted) {
      setState(() {
        _verified = v['verified'] == true;
        _status = v['status']?.toString();
        _loading = false;
      });
    }
  }

  Future<void> _buy(String tier) async {
    setState(() { _paying = tier; _error = null; });
    try {
      final token = Supabase.instance.client.auth.currentSession?.accessToken;
      if (token == null) throw Exception('sem sessão');
      await upsertVerificationRequest(tier);
      final res = await http.post(
        Uri.parse('https://www.monatiza.com/api/checkout/verificacao'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: jsonEncode({'tier': tier}),
      );
      final data = res.body.isNotEmpty ? jsonDecode(res.body) as Map<String, dynamic> : {};
      final url = data['url']?.toString();
      if (url == null || url.isEmpty) {
        throw Exception(data['error']?.toString() ?? 'sem url');
      }
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) setState(() => _error = 'Não foi possível abrir o pagamento. Tente novamente.');
    } finally {
      if (mounted) setState(() => _paying = null);
    }
  }

  Future<void> _pick(bool isDoc) async {
    final x = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 90);
    if (x != null && mounted) {
      setState(() => isDoc ? _doc = File(x.path) : _selfie = File(x.path));
    }
  }

  Future<void> _submitDocs() async {
    if (_doc == null || _selfie == null) {
      setState(() => _error = 'Envie o documento e a selfie.');
      return;
    }
    setState(() { _busy = true; _error = null; });
    final d = await uploadVerificationFile(_doc!, 'doc');
    final s = await uploadVerificationFile(_selfie!, 'selfie');
    if (d == null || s == null) {
      if (mounted) setState(() { _busy = false; _error = 'Falha ao enviar. Tente novamente.'; });
      return;
    }
    await submitVerificationDocs(d, s);
    if (mounted) setState(() { _busy = false; _status = 'review'; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verificação', style: TextStyle(fontSize: 17))),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                children: [_content()],
              ),
            ),
    );
  }

  Widget _content() {
    if (_verified) {
      return _stateBox(const VerifiedBadge(size: 52), 'Você é verificado',
          'O selo já aparece ao lado do seu nome.');
    }
    if (_status == 'review') {
      return _stateBox(const Icon(Icons.hourglass_top, color: _gold, size: 44), 'Em análise',
          'Confirmamos sua identidade em até 48h.');
    }
    if (_status == 'paid') return _uploadBox();

    // Oferta: dois selos (igual ao site)
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const SizedBox(height: 6),
      const Text('Escolha seu selo',
          textAlign: TextAlign.center, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
      const SizedBox(height: 6),
      Text('Autentique sua conta e ganhe mais credibilidade e alcance.',
          textAlign: TextAlign.center, style: TextStyle(color: t54(context), fontSize: 13.5)),
      if (_error != null)
        Padding(
          padding: const EdgeInsets.only(top: 12),
          child: Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFFFF6B7A), fontSize: 13)),
        ),
      const SizedBox(height: 18),
      _SeloCard(
        tier: 'silver',
        title: 'Selo Prata',
        desc: 'Autentica seu negócio e conta real',
        price: 'R\$ 29,90',
        benefits: const [
          'Selo prata ao lado do seu nome',
          'Conta autêntica e confiável',
          'Mais credibilidade na comunidade',
          '@ exclusivo protegido',
        ],
        loading: _paying == 'silver',
        onBuy: () => _buy('silver'),
      ),
      const SizedBox(height: 14),
      _SeloCard(
        tier: 'gold',
        title: 'Selo Ouro',
        desc: 'Autoridade e destaque máximo',
        price: 'R\$ 49,90',
        highlight: true,
        benefits: const [
          'Selo dourado ao lado do seu nome',
          'Mais alcance e destaque nas publicações',
          'Autoridade e validação avançada',
          '@ exclusivo protegido',
        ],
        loading: _paying == 'gold',
        onBuy: () => _buy('gold'),
      ),
      const SizedBox(height: 14),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.lock_outline, size: 12, color: t38(context)),
        const SizedBox(width: 5),
        Text('Assinatura mensal e segura • cancele quando quiser',
            style: TextStyle(color: t38(context), fontSize: 11)),
      ]),
    ]);
  }

  Widget _stateBox(Widget icon, String title, String sub) => Container(
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(color: tCardC(context), borderRadius: BorderRadius.circular(22), border: Border.all(color: t12(context))),
        child: Column(children: [
          icon,
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text(sub, textAlign: TextAlign.center, style: TextStyle(color: t54(context))),
        ]),
      );

  Widget _uploadBox() => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: tCardC(context), borderRadius: BorderRadius.circular(22), border: Border.all(color: t12(context))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Row(children: [
            const VerifiedBadge(size: 30),
            const SizedBox(width: 10),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Confirme sua identidade', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                Text('Pagamento confirmado · falta só verificar', style: TextStyle(color: t38(context), fontSize: 12)),
              ]),
            ),
          ]),
          const SizedBox(height: 16),
          _fileRow('Documento com foto', Icons.badge_outlined, _doc, () => _pick(true)),
          const SizedBox(height: 10),
          _fileRow('Selfie', Icons.camera_alt_outlined, _selfie, () => _pick(false)),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(_error!, style: const TextStyle(color: Color(0xFFFF6B7A), fontSize: 13)),
            ),
          const SizedBox(height: 18),
          SizedBox(
            height: 50,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: _accent,
                foregroundColor: Colors.white,
                shape: const StadiumBorder(),
                textStyle: const TextStyle(fontWeight: FontWeight.w800),
              ),
              onPressed: _busy ? null : _submitDocs,
              child: _busy
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Enviar para análise'),
            ),
          ),
          const SizedBox(height: 10),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.lock_outline, size: 11, color: t38(context)),
            const SizedBox(width: 5),
            Text('Envio privado e criptografado', style: TextStyle(color: t38(context), fontSize: 11)),
          ]),
        ]),
      );

  Widget _fileRow(String label, IconData icon, File? file, VoidCallback onPick) => InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onPick,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: file != null ? _accent : t24(context)),
          ),
          child: Row(children: [
            Icon(icon, size: 20, color: file != null ? _accent : t54(context)),
            const SizedBox(width: 10),
            Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600))),
            Icon(file != null ? Icons.check_circle : Icons.add_circle_outline,
                size: 20, color: file != null ? _accent : t38(context)),
          ]),
        ),
      );
}

class _SeloCard extends StatelessWidget {
  final String tier;
  final String title;
  final String desc;
  final String price;
  final List<String> benefits;
  final bool highlight;
  final bool loading;
  final VoidCallback onBuy;
  const _SeloCard({
    required this.tier,
    required this.title,
    required this.desc,
    required this.price,
    required this.benefits,
    required this.loading,
    required this.onBuy,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    final tint = tier == 'silver' ? const Color(0xFFC7CCD4) : _gold;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: tCardC(context),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: highlight ? _gold.withOpacity(0.5) : t12(context)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          VerifiedBadge(size: 34, tier: tier),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
                if (highlight)
                  Container(
                    margin: const EdgeInsets.only(left: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: _gold.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                    child: const Text('POPULAR', style: TextStyle(color: _gold, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                  ),
              ]),
              Text(desc, style: TextStyle(color: t54(context), fontSize: 12)),
            ]),
          ),
        ]),
        const SizedBox(height: 14),
        Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(price, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          Padding(
            padding: const EdgeInsets.only(bottom: 3, left: 4),
            child: Text('/mês', style: TextStyle(color: t38(context), fontSize: 12)),
          ),
        ]),
        const SizedBox(height: 12),
        ...benefits.map((b) => Padding(
              padding: const EdgeInsets.only(bottom: 7),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                  margin: const EdgeInsets.only(top: 2),
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(color: tint.withOpacity(0.15), shape: BoxShape.circle),
                  child: Icon(Icons.check, size: 11, color: tint),
                ),
                const SizedBox(width: 8),
                Expanded(child: Text(b, style: TextStyle(fontSize: 13, height: 1.35, color: t70(context)))),
              ]),
            )),
        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: highlight ? _gold : Colors.white,
              foregroundColor: Colors.black,
              shape: const StadiumBorder(),
              textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
            ),
            onPressed: loading ? null : onBuy,
            child: loading
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                : Text('Assinar ${tier == 'silver' ? 'Prata' : 'Ouro'}'),
          ),
        ),
      ]),
    );
  }
}
