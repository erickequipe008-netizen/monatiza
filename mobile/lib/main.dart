import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'config.dart';
import 'screens/splash_screen.dart';

/// Tema atual do app (escuro por padrão; o usuário alterna na home).
final themeMode = ValueNotifier<ThemeMode>(ThemeMode.dark);

Future<void> toggleTheme() async {
  themeMode.value = themeMode.value == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool('lightMode', themeMode.value == ThemeMode.light);
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
  final prefs = await SharedPreferences.getInstance();
  if (prefs.getBool('lightMode') == true) themeMode.value = ThemeMode.light;
  runApp(const MonatizaApp());
}

/// Cliente Supabase compartilhado (mesmo banco/API do site).
final supabase = Supabase.instance.client;

/// Rolagem com "molinha" em todo o app (sensação iOS).
class _AppleScrollBehavior extends MaterialScrollBehavior {
  const _AppleScrollBehavior();
  @override
  ScrollPhysics getScrollPhysics(BuildContext context) =>
      const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics());
}

/// Transição de tela deslizando da direita (estilo iOS), sem depender
/// de classes que mudam entre versões do Flutter.
class _SlidePageTransitionsBuilder extends PageTransitionsBuilder {
  const _SlidePageTransitionsBuilder();
  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final slide = Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero)
        .chain(CurveTween(curve: Curves.easeOutCubic))
        .animate(animation);
    // A tela de trás desliza levemente para a esquerda, como no iOS.
    final back = Tween<Offset>(begin: Offset.zero, end: const Offset(-0.24, 0))
        .chain(CurveTween(curve: Curves.easeOutCubic))
        .animate(secondaryAnimation);
    return SlideTransition(
      position: back,
      child: SlideTransition(position: slide, child: child),
    );
  }
}

class MonatizaApp extends StatelessWidget {
  const MonatizaApp({super.key});

  ThemeData _theme(Brightness b) {
    final dark = b == Brightness.dark;
    final base = ThemeData(brightness: b);
    return ThemeData(
      useMaterial3: true,
      brightness: b,
      scaffoldBackgroundColor: dark ? const Color(kBg) : const Color(0xFFF7F7FA),
      pageTransitionsTheme: const PageTransitionsTheme(builders: {
        TargetPlatform.android: _SlidePageTransitionsBuilder(),
        TargetPlatform.iOS: _SlidePageTransitionsBuilder(),
      }),
      splashFactory: NoSplash.splashFactory,
      splashColor: Colors.transparent,
      highlightColor: dark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.05),
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(kAccent),
        brightness: b,
        surface: dark ? const Color(kBg) : Colors.white,
      ),
      // Tipografia de portal de notícias: Inter, com títulos fortes.
      textTheme: GoogleFonts.interTextTheme(base.textTheme),
      appBarTheme: AppBarTheme(
        backgroundColor: dark ? const Color(kBg) : const Color(0xFFF7F7FA),
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
            fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.4,
            color: dark ? Colors.white : const Color(0xFF0B0B10)),
        iconTheme: IconThemeData(color: dark ? Colors.white : const Color(0xFF0B0B10)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: dark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.045),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeMode,
      builder: (context, mode, _) => MaterialApp(
        title: 'Monatiza',
        debugShowCheckedModeBanner: false,
        scrollBehavior: const _AppleScrollBehavior(),
        theme: _theme(Brightness.light),
        darkTheme: _theme(Brightness.dark),
        themeMode: mode,
        home: const SplashScreen(),
      ),
    );
  }
}
