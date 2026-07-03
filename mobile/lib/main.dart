import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';

void main() {
  runApp(const MonatizaApp());
}

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
        scaffoldBackgroundColor: const Color(0xFF000000),
      ),
      home: const SplashScreen(),
    );
  }
}
