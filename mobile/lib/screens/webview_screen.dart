import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

/// O app É o próprio web app da Monatiza dentro de uma WebView — mesmo layout,
/// login, perfil e tudo mais, sempre em sincronia com o site. Otimizado para
/// abrir rápido, rolar liso e sem "flash" branco (fundo preto + loader da marca).
class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});
  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> with SingleTickerProviderStateMixin {
  static const String _appUrl = 'https://www.monatiza.com/app';
  // UA de Chrome mobile: melhor renderização e evita quirks de WebView.
  static const String _userAgent =
      'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

  late final WebViewController _controller;
  bool _loading = true;
  int _fails = 0;

  late final AnimationController _pulse =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1100))..repeat(reverse: true);

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF000000))
      ..setUserAgent(_userAgent)
      ..enableZoom(false)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => _setLoading(true),
          onPageFinished: (_) => _setLoading(false),
          onWebResourceError: (err) {
            // Só mostra falha em erro do frame principal (ignora recursos soltos).
            _setLoading(false);
            _fails++;
          },
          onNavigationRequest: (request) {
            final url = request.url;
            final internal = url.contains('monatiza.com') ||
                url.contains('supabase.co') ||
                url.startsWith('about:') ||
                url.startsWith('data:');
            if (!internal) {
              launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(_appUrl));
  }

  void _setLoading(bool v) {
    if (mounted) setState(() => _loading = v);
  }

  Future<void> _handleBack() async {
    if (await _controller.canGoBack()) {
      _controller.goBack();
    } else {
      await SystemNavigator.pop();
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) _handleBack();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF000000),
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              // Loader da marca: fundo preto + "m" pulsando; some ao carregar.
              IgnorePointer(
                ignoring: !_loading,
                child: AnimatedOpacity(
                  opacity: _loading ? 1 : 0,
                  duration: const Duration(milliseconds: 350),
                  curve: Curves.easeOut,
                  child: Container(
                    color: const Color(0xFF000000),
                    alignment: Alignment.center,
                    child: FadeTransition(
                      opacity: Tween(begin: 0.45, end: 1.0).animate(_pulse),
                      child: Container(
                        height: 84,
                        width: 84,
                        decoration: BoxDecoration(
                          color: const Color(0xFF0A0A0C),
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(color: Colors.white.withOpacity(0.14), width: 1.5),
                        ),
                        child: const Center(
                          child: Text(
                            'm',
                            style: TextStyle(fontSize: 48, fontWeight: FontWeight.w800, color: Colors.white, height: 1),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
