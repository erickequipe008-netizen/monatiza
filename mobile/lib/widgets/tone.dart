import 'package:flutter/material.dart';

/// Tons que se adaptam ao tema (escuro = branco translúcido; claro = preto).
/// Mantém o contraste certo nos dois modos.
bool isDarkC(BuildContext c) => Theme.of(c).brightness == Brightness.dark;

Color tInk(BuildContext c) => isDarkC(c) ? Colors.white : const Color(0xFF0B0B10);
Color t70(BuildContext c) => isDarkC(c) ? Colors.white70 : Colors.black87;
Color t60(BuildContext c) => isDarkC(c) ? Colors.white60 : Colors.black54;
Color t54(BuildContext c) => isDarkC(c) ? Colors.white54 : Colors.black54;
Color t38(BuildContext c) => isDarkC(c) ? Colors.white38 : Colors.black45;
Color t24(BuildContext c) => isDarkC(c) ? Colors.white24 : Colors.black26;
Color t12(BuildContext c) => isDarkC(c) ? Colors.white12 : Colors.black12;
Color t10(BuildContext c) => isDarkC(c) ? Colors.white10 : const Color(0x14000000);
Color tCardC(BuildContext c) => isDarkC(c) ? Colors.white.withOpacity(0.05) : Colors.white;
Color tFillC(BuildContext c) => isDarkC(c) ? const Color(0xFF101216) : const Color(0xFFECECF1);
Color tBody(BuildContext c) => isDarkC(c) ? const Color(0xFFD4D4D8) : const Color(0xFF26262B);
