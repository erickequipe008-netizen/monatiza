import 'package:flutter/material.dart';

// Gradiente "Gemini" (azul → roxo → rosa)
const kProGradient = LinearGradient(
  colors: [Color(0xFF4285F4), Color(0xFF9B72CB), Color(0xFFFF5C8A)],
  begin: Alignment.centerLeft,
  end: Alignment.centerRight,
);

class GradientButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icon;
  final bool expand;
  const GradientButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.expand = true,
  });

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: (onPressed == null || loading) ? 0.55 : 1,
      child: DecoratedBox(
        decoration: BoxDecoration(gradient: kProGradient, borderRadius: BorderRadius.circular(30)),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(30),
            onTap: loading ? null : onPressed,
            child: Container(
              width: expand ? double.infinity : null,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 13),
              child: Row(
                mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (loading)
                    const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  else if (icon != null)
                    Icon(icon, color: Colors.white, size: 18),
                  if (loading || icon != null) const SizedBox(width: 8),
                  Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Avatar com anel em gradiente (estilo stories).
class GradientAvatarRing extends StatelessWidget {
  final Widget child;
  final double padding;
  const GradientAvatarRing({super.key, required this.child, this.padding = 2.5});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(padding),
      decoration: const BoxDecoration(shape: BoxShape.circle, gradient: kProGradient),
      child: Container(
        padding: const EdgeInsets.all(2),
        decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF0A0A0C)),
        child: child,
      ),
    );
  }
}
