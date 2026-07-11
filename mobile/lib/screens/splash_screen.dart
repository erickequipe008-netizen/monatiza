import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../auth_gate.dart';

/// Splash cinematográfica: um feixe de luz percorre o traçado do "m"
/// deixando o rastro; quando fecha, o esqueleto se transforma no logo
/// serifado oficial com um glint atravessando a letra. Fade para o app.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  // 0.00–0.50  feixe desenha o esqueleto do m
  // 0.50–0.66  esqueleto vira o logo serifado (crossfade + leve escala)
  // 0.68–0.88  glint atravessa a letra
  // 0.88–1.00  pausa elegante
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
    final logoStyle = GoogleFonts.robotoSlab(
      fontSize: 118,
      fontWeight: FontWeight.w800,
      color: Colors.white,
      height: 1,
    );
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: Center(
        child: RepaintBoundary(
          child: AnimatedBuilder(
            animation: _c,
            builder: (_, __) {
              final v = _c.value;
              final draw = Curves.easeInOutCubic.transform((v / 0.50).clamp(0.0, 1.0));
              final reveal = Curves.easeOut.transform(((v - 0.50) / 0.16).clamp(0.0, 1.0));
              final glint = ((v - 0.68) / 0.20).clamp(0.0, 1.0);
              final settle = v <= 0.50
                  ? 1.0
                  : 1.0 + 0.03 * math.sin((((v - 0.50) / 0.22).clamp(0.0, 1.0)) * math.pi);
              return Transform.scale(
                scale: settle,
                child: SizedBox(
                  width: 170,
                  height: 150,
                  child: Stack(alignment: Alignment.center, children: [
                    // Esqueleto sendo desenhado pelo feixe
                    Opacity(
                      opacity: (1 - reveal).clamp(0.0, 1.0),
                      child: CustomPaint(
                        size: const Size(150, 132),
                        painter: _BeamMPainter(draw: draw),
                      ),
                    ),
                    // Logo serifado oficial com glint varrendo
                    Opacity(
                      opacity: reveal,
                      child: Transform.scale(
                        scale: 0.94 + 0.06 * reveal,
                        child: ShaderMask(
                          blendMode: BlendMode.srcIn,
                          shaderCallback: (rect) {
                            final x0 = -rect.width + glint * rect.width * 2.4;
                            return ui.Gradient.linear(
                              Offset(x0, 0),
                              Offset(x0 + rect.width * 0.7, rect.height),
                              [Colors.white, const Color(0xFFD9C6FF), Colors.white],
                              [0.25, 0.5, 0.75],
                            );
                          },
                          child: Text('m', style: logoStyle),
                        ),
                      ),
                    ),
                  ]),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

/// Feixe de luz: rastro nítido + glow/bloom em camadas e cometa com
/// motion blur na ponta enquanto percorre o traçado.
class _BeamMPainter extends CustomPainter {
  final double draw;
  _BeamMPainter({required this.draw});

  Path _mPath(Size size) {
    final bottom = size.height - 16;
    return Path()
      ..moveTo(20, bottom)
      ..lineTo(20, 52)
      ..cubicTo(20, 20, 73, 20, 73, 52)
      ..lineTo(73, bottom)
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

    canvas.drawPath(done, stroke(42, 0.16, 18));
    canvas.drawPath(done, stroke(32, 0.38, 8));
    canvas.drawPath(done, stroke(25, 1.0));

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
      final pos = tip.position;
      canvas.drawCircle(pos, 15, Paint()
        ..color = Colors.white.withOpacity(0.45)
        ..maskFilter = const ui.MaskFilter.blur(ui.BlurStyle.normal, 12));
      canvas.drawCircle(pos, 6.5, Paint()
        ..color = Colors.white
        ..maskFilter = const ui.MaskFilter.blur(ui.BlurStyle.normal, 1.5));
    }
  }

  @override
  bool shouldRepaint(covariant _BeamMPainter old) => old.draw != draw;
}
