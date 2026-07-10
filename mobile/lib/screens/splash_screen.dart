import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../auth_gate.dart';

/// Intro: o "m" branco se desenhando no preto (traço se formando),
/// com um leve "pop" no final — e segue para o app.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..forward();

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1350), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 380),
          pageBuilder: (_, __, ___) => const AuthGate(),
          transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
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
        child: AnimatedBuilder(
          animation: _c,
          builder: (_, __) {
            final v = _c.value;
            // 0–78%: o traço se forma; 78–100%: pop suave de escala.
            final draw = Curves.easeInOutCubic.transform((v / 0.78).clamp(0.0, 1.0));
            final pop = v <= 0.78 ? 1.0 : 1.0 + 0.06 * math.sin(((v - 0.78) / 0.22) * math.pi);
            return Transform.scale(
              scale: pop,
              child: CustomPaint(size: const Size(126, 122), painter: _MPainter(draw)),
            );
          },
        ),
      ),
    );
  }
}

/// Desenha o "m" como um traço contínuo que vai se formando.
class _MPainter extends CustomPainter {
  final double progress;
  _MPainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 26
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final bottom = size.height - 14;
    final path = Path()
      // haste esquerda + primeiro arco + haste do meio
      ..moveTo(16, bottom)
      ..lineTo(16, 46)
      ..cubicTo(16, 16, 63, 16, 63, 46)
      ..lineTo(63, bottom)
      // segundo arco + haste direita
      ..moveTo(63, 46)
      ..cubicTo(63, 16, 110, 16, 110, 46)
      ..lineTo(110, bottom);

    if (progress >= 1.0) {
      canvas.drawPath(path, paint);
      return;
    }
    final metrics = path.computeMetrics().toList();
    final total = metrics.fold<double>(0, (s, m) => s + m.length);
    var remain = total * progress;
    for (final m in metrics) {
      if (remain <= 0) break;
      final len = remain > m.length ? m.length : remain;
      canvas.drawPath(m.extractPath(0, len), paint);
      remain -= m.length;
    }
  }

  @override
  bool shouldRepaint(covariant _MPainter old) => old.progress != progress;
}
