import 'package:flutter/material.dart';
import '../widgets/ui.dart';
import '../auth_gate.dart';

/// Abertura do app: logo "M" animada + assinatura da marca, depois transição
/// suave para a autenticação/home.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..forward();
  late final Animation<double> _logo = CurvedAnimation(parent: _c, curve: Curves.easeOutBack);
  late final Animation<double> _fade =
      CurvedAnimation(parent: _c, curve: const Interval(0.0, 0.6, curve: Curves.easeOut));
  late final Animation<double> _word =
      CurvedAnimation(parent: _c, curve: const Interval(0.45, 1.0, curve: Curves.easeOut));

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 2200), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 550),
        pageBuilder: (_, __, ___) => const AuthGate(),
        transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
      ));
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
      backgroundColor: const Color(0xFF0A0A0C),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            FadeTransition(
              opacity: _fade,
              child: ScaleTransition(
                scale: Tween(begin: 0.7, end: 1.0).animate(_logo),
                child: Container(
                  height: 110,
                  width: 110,
                  decoration: BoxDecoration(
                    gradient: kProGradient,
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: const [BoxShadow(color: Color(0x669B72CB), blurRadius: 42, spreadRadius: 4)],
                  ),
                  child: const Center(
                    child: Text('m',
                        style: TextStyle(fontSize: 64, fontWeight: FontWeight.w800, color: Colors.white, height: 1)),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 26),
            FadeTransition(
              opacity: _word,
              child: const Text('monatiza',
                  style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5)),
            ),
            const SizedBox(height: 8),
            FadeTransition(
              opacity: _word,
              child: const Text('NOTÍCIAS · COMUNIDADE · NEGÓCIOS',
                  style: TextStyle(fontSize: 11, color: Colors.white38, letterSpacing: 1.6, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}
