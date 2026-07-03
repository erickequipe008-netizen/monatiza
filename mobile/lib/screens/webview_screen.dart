import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:file_picker/file_picker.dart';

/// O app é o próprio web app da Monatiza dentro de uma WebView —
/// mesmo layout, login, perfil e tudo mais, sempre em sincronia com o site.
class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});
  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  static const String _appUrl = 'https://www.monatiza.com/app';
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();

    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => _setLoading(true),
          onPageFinished: (_) => _setLoading(false),
          onWebResourceError: (_) => _setLoading(false),
          onNavigationRequest: (request) {
            final url = request.url;
            final internal = url.contains('monatiza.com') ||
                url.contains('supabase.co') ||
                url.contains('accounts.google.com') ||
                url.startsWith('about:');
            if (!internal) {
              launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(_appUrl));

    // Android: seletor de arquivos (postar foto/vídeo) + autoplay de vídeo.
    final platform = controller.platform;
    if (platform is AndroidWebViewController) {
      platform.setMediaPlaybackRequiresUserGesture(false);
      platform.setOnShowFileSelector(_pickFiles);
    }

    _controller = controller;
  }

  void _setLoading(bool v) {
    if (mounted) setState(() => _loading = v);
  }

  Future<List<String>> _pickFiles(FileSelectorParams params) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.media,
      allowMultiple: params.mode == FileSelectorMode.openMultiple,
    );
    if (result == null) return const <String>[];
    return result.files
        .where((f) => f.path != null)
        .map((f) => Uri.file(f.path!).toString())
        .toList();
  }

  Future<void> _onBack() async {
    if (await _controller.canGoBack()) {
      _controller.goBack();
    } else {
      await SystemNavigator.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (!didPop) _onBack();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF000000),
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_loading)
                const Center(
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
