import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'login_screen.dart';
import 'signup_screen.dart';

const _accent = Color(0xFF8B5CF6);

/// Boas-vindas em 3 páginas (estilo grandes jornais): logo no topo,
/// ilustração, título forte, texto de apoio, bolinhas e ações embaixo.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _ctrl = PageController();
  int _page = 0;

  static const _pages = [
    _PageData(
      icon: Icons.language,
      title: 'As principais notícias\nem um só lugar',
      text: 'Jornalismo direto e rápido, do Brasil e do mundo, sem enrolação.',
    ),
    _PageData(
      icon: Icons.chat_bubble_outline,
      title: 'Participe da conversa',
      text: 'Publique, responda e siga quem pensa grande — a comunidade é sua.',
    ),
    _PageData(
      icon: Icons.auto_awesome,
      title: 'Salve para ler\nquando quiser',
      text: 'Biblioteca, revistas e conteúdo exclusivo para assinantes.',
    ),
  ];

  bool get _last => _page == _pages.length - 1;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _next() {
    HapticFeedback.selectionClick();
    _ctrl.nextPage(duration: const Duration(milliseconds: 320), curve: Curves.easeOutCubic);
  }

  void _skip() {
    HapticFeedback.selectionClick();
    _ctrl.animateToPage(_pages.length - 1,
        duration: const Duration(milliseconds: 380), curve: Curves.easeOutCubic);
  }

  void _open(Widget screen) =>
      Navigator.push(context, MaterialPageRoute(builder: (_) => screen));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(children: [
          const SizedBox(height: 18),
          // Logo no topo, como nos grandes apps de notícia
          const Text('monatiza',
              style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          Expanded(
            child: PageView.builder(
              controller: _ctrl,
              itemCount: _pages.length,
              onPageChanged: (i) => setState(() => _page = i),
              itemBuilder: (_, i) => _Page(data: _pages[i]),
            ),
          ),
          // Bolinhas
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            for (var i = 0; i < _pages.length; i++)
              AnimatedContainer(
                duration: const Duration(milliseconds: 240),
                curve: Curves.easeOut,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: i == _page ? 22 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: i == _page ? _accent : Colors.white24,
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
          ]),
          const SizedBox(height: 22),
          // Ações
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(children: [
              SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: _accent,
                    foregroundColor: Colors.white,
                    shape: const StadiumBorder(),
                    textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                  ),
                  onPressed: _last ? () => _open(const SignupScreen()) : _next,
                  child: Text(_last ? 'Criar conta' : 'Próximo'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.white24),
                    foregroundColor: Colors.white,
                    shape: const StadiumBorder(),
                    textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                  ),
                  onPressed: _last ? () => _open(const LoginScreen()) : _skip,
                  child: Text(_last ? 'Entrar' : 'Pular'),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 14),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: Text('Ao continuar, você concorda com os Termos e a Política de Privacidade.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, color: Colors.white30, height: 1.4)),
          ),
          const SizedBox(height: 12),
        ]),
      ),
    );
  }
}

class _PageData {
  final IconData icon;
  final String title;
  final String text;
  const _PageData({required this.icon, required this.title, required this.text});
}

class _Page extends StatelessWidget {
  final _PageData data;
  const _Page({required this.data});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        // Ilustração futurista: brilho lilás + cartão com borda em gradiente
        Container(
          width: 132,
          height: 132,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(38),
            gradient: LinearGradient(
              colors: [_accent.withOpacity(0.35), Colors.white.withOpacity(0.02)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            border: Border.all(color: _accent.withOpacity(0.5), width: 1.2),
            boxShadow: [
              BoxShadow(color: _accent.withOpacity(0.35), blurRadius: 70, spreadRadius: 6),
            ],
          ),
          child: Icon(data.icon, size: 54, color: Colors.white),
        ),
        const SizedBox(height: 40),
        Text(data.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
                color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800, height: 1.2, letterSpacing: -0.4)),
        const SizedBox(height: 14),
        Text(data.text,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white54, fontSize: 15, height: 1.5)),
      ]),
    );
  }
}
