import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/home_shell.dart';
import 'screens/onboarding_wizard.dart';

/// Onboarding concluído? (null = ainda lendo do disco).
/// O assistente e o login atualizam este valor; o AuthGate reage.
final ValueNotifier<bool?> obDone = ValueNotifier<bool?>(null);

/// Decide a rota raiz: Splash → aqui → Home ou Onboarding (com retomada).
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});
  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  int _savedStep = 0;

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((p) {
      var done = p.getBool('ob_done');
      // Contas antigas já logadas não devem cair no cadastro
      if (done == null && Supabase.instance.client.auth.currentSession != null) {
        done = true;
        p.setBool('ob_done', true);
      }
      _savedStep = p.getInt('ob_step') ?? 0;
      obDone.value = done ?? false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, _) {
        return ValueListenableBuilder<bool?>(
          valueListenable: obDone,
          builder: (context, done, __) {
            final session = Supabase.instance.client.auth.currentSession;
            Widget child;
            if (done == null) {
              child = const Scaffold(backgroundColor: Colors.black, body: SizedBox.shrink());
            } else if (done && session != null) {
              child = const HomeShell();
            } else if (!done) {
              // Retoma de onde parou; com conta criada, começa da foto
              var s = _savedStep;
              if (session != null && s < 5) s = 5;
              if (session == null && s > 4) s = 0;
              child = OnboardingWizard(startStep: s);
            } else {
              // concluído mas deslogado → boas-vindas (com "Já tenho conta")
              child = const OnboardingWizard(startStep: 0);
            }
            return AnimatedSwitcher(
              duration: const Duration(milliseconds: 380),
              switchInCurve: Curves.easeOut,
              child: KeyedSubtree(
                key: ValueKey('${child.runtimeType}-${done == true && session != null}'),
                child: child,
              ),
            );
          },
        );
      },
    );
  }
}
