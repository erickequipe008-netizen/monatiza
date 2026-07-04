import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'config.dart';
import 'screens/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
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

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Monatiza',
      debugShowCheckedModeBanner: false,
      scrollBehavior: const _AppleScrollBehavior(),
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(kBg),
        // Transições de tela deslizando (estilo iOS) e toque sem "tinta"
        pageTransitionsTheme: const PageTransitionsTheme(builders: {
          TargetPlatform.android: _SlidePageTransitionsBuilder(),
          TargetPlatform.iOS: _SlidePageTransitionsBuilder(),
        }),
        splashFactory: NoSplash.splashFactory,
        splashColor: Colors.transparent,
        highlightColor: Colors.white.withOpacity(0.06),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(kAccent),
          brightness: Brightness.dark,
          surface: const Color(kBg),
        ),
        textTheme: GoogleFonts.manropeTextTheme(ThemeData(brightness: Brightness.dark).textTheme),
        appBarTheme: AppBarTheme(
          backgroundColor: const Color(kBg),
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
          titleTextStyle: GoogleFonts.manrope(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: const Color(0xFF000000),
          elevation: 0,
          height: 64,
          indicatorColor: const Color(0xFF1D9BF0).withOpacity(0.22),
          labelTextStyle: WidgetStatePropertyAll(
            GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w600),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withOpacity(0.05),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
