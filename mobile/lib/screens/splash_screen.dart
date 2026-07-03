import 'package:flutter/material.dart';
import 'webview_screen.dart';

/// Abertura minimalista: apenas a logo "m" (sem texto), depois entra no app.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..forward();
  late final Animation<double> _fade = CurvedAnimation(parent: _c, curve: Curves.easeOut);
  late final Animation<double> _scale =
      Tween(begin: 0.86, end: 1.0).animate(CurvedAnimation(parent: _c, curve: Curves.easeOutBack));

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 450),
          pageBuilder: (_, __, ___) => const WebViewScreen(),
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
        child: FadeTransition(
          opacity: _fade,
          child: ScaleTransition(
            scale: _scale,
            child: Container(
              height: 96,
              width: 96,
              decoration: BoxDecoration(
                color: const Color(0xFF0A0A0C),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: Colors.white.withValues(alpha: 0.16), width: 1.5),
              ),
              child: const Center(
                child: Text(
                  'm',
                  style: TextStyle(fontSize: 56, fontWeight: FontWeight.w800, color: Colors.white, height: 1),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
