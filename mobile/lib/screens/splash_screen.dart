import 'package:flutter/material.dart';
import '../auth_gate.dart';

/// Intro minimalista: só o "m" branco no preto, com animação de entrada.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1600))..forward();

  late final Animation<double> _fade =
      CurvedAnimation(parent: _c, curve: const Interval(0.0, 0.5, curve: Curves.easeOut));
  late final Animation<double> _scale =
      Tween(begin: 0.62, end: 1.0).animate(CurvedAnimation(parent: _c, curve: const Interval(0.0, 0.72, curve: Curves.easeOutBack)));
  late final Animation<Offset> _slide =
      Tween(begin: const Offset(0, 0.14), end: Offset.zero).animate(CurvedAnimation(parent: _c, curve: const Interval(0.0, 0.6, curve: Curves.easeOutCubic)));

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1150), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 500),
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
        child: FadeTransition(
          opacity: _fade,
          child: SlideTransition(
            position: _slide,
            child: ScaleTransition(
              scale: _scale,
              child: const Text(
                'm',
                style: TextStyle(fontSize: 96, fontWeight: FontWeight.w800, color: Colors.white, height: 1, letterSpacing: -1),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
