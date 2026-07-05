import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'signup_screen.dart';

const _lilas = Color(0xFF8B5CF6);
const _ink = Color(0xFF14002E); // texto escuro sobre o lilás

/// Boas-vindas: fundo lilás cheio, cartões com emojis e o cartão do "m"
/// (estilo dos grandes apps sociais).
class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  void _open(BuildContext context, Widget screen) =>
      Navigator.push(context, MaterialPageRoute(builder: (_) => screen));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _lilas,
      body: SafeArea(
        child: Column(children: [
          const SizedBox(height: 18),
          const Text('monatiza',
              style: TextStyle(color: _ink, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          const Spacer(),
          // ---- Cartões com emojis + cartão do app ----
          SizedBox(
            height: 236,
            width: double.infinity,
            child: Stack(alignment: Alignment.topCenter, children: [
              Positioned(
                top: 34,
                left: 46,
                child: Transform.rotate(angle: -0.14, child: const _EmojiCard(emoji: '🙋‍♂️', size: 84)),
              ),
              Positioned(
                top: 34,
                right: 46,
                child: Transform.rotate(angle: 0.14, child: const _EmojiCard(emoji: '🙋‍♀️', size: 84)),
              ),
              const Positioned(top: 0, child: _EmojiCard(emoji: '😄', size: 110)),
              // Cartão preto do app com o "m"
              Positioned(
                top: 128,
                child: Container(
                  width: 84,
                  height: 84,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B0B10),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.35), blurRadius: 24, offset: const Offset(0, 10)),
                    ],
                  ),
                  child: const Text('m',
                      style: TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.w800)),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 26),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: Text('Comece sua nova\njornada social',
                textAlign: TextAlign.center,
                style: TextStyle(color: _ink, fontSize: 30, fontWeight: FontWeight.w800, height: 1.15, letterSpacing: -0.8)),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text('Publique, reaja e converse sobre o que importa — notícias e comunidade num só lugar.',
                textAlign: TextAlign.center,
                style: TextStyle(color: _ink.withOpacity(0.65), fontSize: 14.5, height: 1.45)),
          ),
          const Spacer(),
          // ---- Ações ----
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(children: [
              SizedBox(
                width: double.infinity,
                height: 54,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF0B0B10),
                    foregroundColor: Colors.white,
                    shape: const StadiumBorder(),
                    textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                  ),
                  onPressed: () => _open(context, const SignupScreen()),
                  child: const Text('Começar'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: _ink.withOpacity(0.4), width: 1.4),
                    foregroundColor: _ink,
                    shape: const StadiumBorder(),
                    textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                  ),
                  onPressed: () => _open(context, const LoginScreen()),
                  child: const Text('Já tenho uma conta'),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 14),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text('Ao continuar, você concorda com os Termos e a Política de Privacidade.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, color: _ink.withOpacity(0.5), height: 1.4)),
          ),
          const SizedBox(height: 12),
        ]),
      ),
    );
  }
}

/// Cartão branco arredondado com um emoji grande (estilo memoji).
class _EmojiCard extends StatelessWidget {
  final String emoji;
  final double size;
  const _EmojiCard({required this.emoji, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(size * 0.28),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.18), blurRadius: 18, offset: const Offset(0, 8)),
        ],
      ),
      child: Text(emoji, style: TextStyle(fontSize: size * 0.5)),
    );
  }
}
