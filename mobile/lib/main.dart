import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'config.dart';
import 'auth_gate.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
  runApp(const MonatizaApp());
}

/// Cliente Supabase compartilhado (mesmo banco/API do site).
final supabase = Supabase.instance.client;

class MonatizaApp extends StatelessWidget {
  const MonatizaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Monatiza',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(kBg),
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
          backgroundColor: const Color(0xFF111114),
          elevation: 0,
          height: 64,
          indicatorColor: const Color(0xFF9B72CB).withValues(alpha: 0.25),
          labelTextStyle: WidgetStatePropertyAll(
            GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w600),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withValues(alpha: 0.05),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        ),
      ),
      home: const AuthGate(),
    );
  }
}
