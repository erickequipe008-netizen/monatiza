import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import '../auth_gate.dart';

/// Splash cinematográfica: a tela nasce preta e um único feixe de luz
/// percorre o traçado do "m", deixando o rastro branco que forma a
/// letra. No fim, um brilho fino atravessa a letra da esquerda para a
/// direita, o logo respira por ~700ms e a tela transiciona em fade.
/// Tudo em uma única CustomPaint (GPU/Impeller, 60fps).
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  // 0.00–0.58  feixe desenha o m (easeInOutCubic)
  // 0.62–0.82  brilho atravessa a letra
  // 0.82–1.00  pausa elegante (logo respira)
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1950))..forward();

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1950), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 450),
          pageBuilder: (_, __, ___) => const AuthGate(),
          transitionsBuilder: (_, anim, __, child) => FadeTransition(
            opacity: CurvedAnimation(parent: anim, curve: Curves.easeOut),
            child: child,
          ),
        ),
      );
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: Center(
        child: RepaintBoundary(
          child: AnimatedBuilder(
            animation: _c,
            builder: (_, __) {
              final v = _c.value;
              final draw = Curves.easeInOutCubic.transform((v / 0.58).clamp(0.0, 1.0));
              final shine = ((v - 0.62) / 0.20).clamp(0.0, 1.0);
              // Respiro sutil quando a letra fecha
              final settle = v <= 0.58
                  ? 1.0
                  : 1.0 + 0.035 * math.sin((((v - 0.58) / 0.18).clamp(0.0, 1.0)) * math.pi);
              return Transform.scale(
                scale: settle,
                child: CustomPaint(
                  size: const Size(150, 132),
                  painter: _BeamMPainter(draw: draw, shine: shine),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

/// Pinta o "m": rastro nítido + halos de glow/bloom, cometa com motion
/// blur na ponta do feixe e, ao final, a faixa de brilho varrendo.
class _BeamMPainter extends CustomPainter {
  final double draw;
  final double shine;
  _BeamMPainter({required this.draw, required this.shine});

  Path _mPath(Size size) {
    final bottom = size.height - 16;
    return Path()
      // haste esquerda + primeiro arco + haste do meio
      ..moveTo(20, bottom)
      ..lineTo(20, 52)
      ..cubicTo(20, 20, 73, 20, 73, 52)
      ..lineTo(73, bottom)
      // segundo arco + haste direita
      ..moveTo(73, 52)
      ..cubicTo(73, 20, 126, 20, 126, 52)
      ..lineTo(126, bottom);
  }

  @override
  void paint(Canvas canvas, Size size) {
    final path = _mPath(size);
    final metrics = path.computeMetrics().toList();
    final total = metrics.fold<double>(0, (s, m) => s + m.length);
    final target = total * draw;

    Paint stroke(double w, double opacity, [double blur = 0]) {
      final p = Paint()
        ..color = Colors.white.withOpacity(opacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = w
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;
      if (blur > 0) p.maskFilter = ui.MaskFilter.blur(ui.BlurStyle.normal, blur);
      return p;
    }

    // Monta o trecho já percorrido (rastro permanente)
    final done = Path();
    var remain = target;
    ui.Tangent? tip;
    for (final m in metrics) {
      if (remain <= 0) break;
      final len = remain > m.length ? m.length : remain;
      done.addPath(m.extractPath(0, len), Offset.zero);
      if (len < m.length || remain <= m.length) tip = m.getTangentForOffset(len);
      remain -= m.length;
    }

    // Bloom discreto + glow em camadas, do difuso ao nítido
    canvas.drawPath(done, stroke(42, 0.16, 18));
    canvas.drawPath(done, stroke(32, 0.38, 8));
    canvas.drawPath(done, stroke(25, 1.0));

    // Cometa do feixe: os últimos ~30px com blur (sensação de movimento)
    if (draw > 0 && draw < 1 && tip != null) {
      var tailStart = target - 30;
      if (tailStart < 0) tailStart = 0;
      final tail = Path();
      var acc = 0.0;
      for (final m in metrics) {
        final s0 = tailStart - acc;
        final s1 = target - acc;
        if (s1 > 0 && s0 < m.length) {
          tail.addPath(m.extractPath(s0.clamp(0, m.length), s1.clamp(0, m.length)), Offset.zero);
        }
        acc += m.length;
      }
      canvas.drawPath(tail, stroke(27, 0.85, 5));
      // Núcleo da luz + halo (glow intenso na ponta)
      final pos = tip.position;
      canvas.drawCircle(pos, 15, Paint()
        ..color = Colors.white.withOpacity(0.45)
        ..maskFilter = const ui.MaskFilter.blur(ui.BlurStyle.normal, 12));
      canvas.drawCircle(pos, 6.5, Paint()
        ..color = Colors.white
        ..maskFilter = const ui.MaskFilter.blur(ui.BlurStyle.normal, 1.5));
    }

    // Brilho fino atravessando a letra (esquerda → direita)
    if (shine > 0 && shine < 1 && draw >= 1) {
      final bandW = size.width * 0.5;
      final x0 = -bandW + shine * (size.width + bandW * 2);
      final band = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 25
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..blendMode = BlendMode.plus
        ..shader = ui.Gradient.linear(
          Offset(x0, 0),
          Offset(x0 + bandW, size.height),
          [
            Colors.white.withOpacity(0),
            Colors.white.withOpacity(0.75),
            Colors.white.withOpacity(0),
          ],
          [0.0, 0.5, 1.0],
        );
      canvas.drawPath(path, band);
    }
  }

  @override
  bool shouldRepaint(covariant _BeamMPainter old) =>
      old.draw != draw || old.shine != shine;
}
