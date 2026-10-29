import 'package:flutter/material.dart';

/// Selo de verificado — idêntico ao do site: borda serrilhada (estilo
/// Instagram) com gradiente dourado (padrão) ou prata (tier 'silver').
class VerifiedBadge extends StatelessWidget {
  final double size;
  final Object? tier; // 'gold' | 'silver' (vem direto do banco)
  const VerifiedBadge({super.key, this.size = 14, this.tier});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _BadgePainter(silver: tier == 'silver'),
    );
  }
}

class _BadgePainter extends CustomPainter {
  final bool silver;
  _BadgePainter({required this.silver});

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 24.0;
    canvas.scale(s, s);

    // Mesma forma do SVG do site (viewBox 24x24).
    final star = Path()
      ..moveTo(23, 12)
      ..lineTo(20.56, 9.22)
      ..lineTo(20.90, 5.54)
      ..lineTo(17.29, 4.72)
      ..lineTo(15.40, 1.54)
      ..lineTo(12, 3)
      ..lineTo(8.6, 1.54)
      ..lineTo(6.71, 4.72)
      ..lineTo(3.10, 5.53)
      ..lineTo(3.44, 9.21)
      ..lineTo(1, 12)
      ..lineTo(3.44, 14.78)
      ..lineTo(3.10, 18.47)
      ..lineTo(6.71, 19.29)
      ..lineTo(8.60, 22.47)
      ..lineTo(12, 21)
      ..lineTo(15.40, 22.46)
      ..lineTo(17.29, 19.28)
      ..lineTo(20.90, 18.46)
      ..lineTo(20.56, 14.78)
      ..close();

    final colors = silver
        ? const [Color(0xFFF4F5F7), Color(0xFFC7CCD4), Color(0xFF9AA1AC)]
        : const [Color(0xFFE8CE8E), Color(0xFFC6A052), Color(0xFFA87B30)];
    final fill = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: colors,
        stops: const [0.0, 0.55, 1.0],
      ).createShader(const Rect.fromLTWH(0, 0, 24, 24));
    canvas.drawPath(star, fill);

    final check = Path()
      ..moveTo(8.3, 12.4)
      ..lineTo(11.0, 15.1)
      ..lineTo(16.1, 9.7);
    canvas.drawPath(
      check,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.3
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..color = silver ? const Color(0xFF3F4650) : Colors.white,
    );
  }

  @override
  bool shouldRepaint(covariant _BadgePainter old) => old.silver != silver;
}
