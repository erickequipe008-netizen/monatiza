import 'package:flutter/material.dart';
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
        ),
      ),
      home: const AuthGate(),
    );
  }
}
