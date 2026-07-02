import 'package:flutter/material.dart';
import '../widgets/ui.dart';
import 'login_screen.dart';
import 'signup_screen.dart';

/// Ponto de acesso do app: Entrar ou Criar conta (tudo dentro do app).
class AuthLanding extends StatelessWidget {
  const AuthLanding({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0C),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(flex: 3),
              Center(
                child: Container(
                  height: 84,
                  width: 84,
                  decoration: BoxDecoration(gradient: kProGradient, borderRadius: BorderRadius.circular(24)),
                  child: const Center(
                    child: Text('m', style: TextStyle(fontSize: 48, fontWeight: FontWeight.w800, color: Colors.white)),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text('Sua voz.\nSua comunidade.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white, height: 1.15)),
              const SizedBox(height: 12),
              const Text('Notícias que importam e uma rede para debater com quem pensa grande.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14.5, color: Colors.white54, height: 1.45)),
              const Spacer(flex: 4),
              GradientButton(
                label: 'Criar conta',
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SignupScreen())),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  side: const BorderSide(color: Colors.white24),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                ),
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                child: const Text('Entrar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
              ),
              const SizedBox(height: 18),
              const Text('Ao continuar, você concorda com os Termos e a Política de Privacidade.',
                  textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: Colors.white30, height: 1.4)),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
