import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../db.dart';
import '../widgets/tone.dart';
import '../widgets/avatar.dart';

const _accent = Color(0xFF8B5CF6);

/// Compor publicação (aberto pela home) — texto + foto/vídeo.
class ComposeScreen extends StatefulWidget {
  const ComposeScreen({super.key});
  @override
  State<ComposeScreen> createState() => _ComposeScreenState();
}

class _ComposeScreenState extends State<ComposeScreen> {
  final _ctrl = TextEditingController();
  Map<String, dynamic>? _me;
  bool _posting = false;
  File? _file;
  bool _fileIsVideo = false;

  @override
  void initState() {
    super.initState();
    ensureProfile().then((p) {
      if (mounted) setState(() => _me = p);
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _pickMedia() async {
    final choice = await showModalBottomSheet<String>(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          ListTile(leading: const Icon(Icons.image_outlined), title: const Text('Foto'), onTap: () => Navigator.pop(context, 'img')),
          ListTile(leading: const Icon(Icons.videocam_outlined), title: const Text('Vídeo'), onTap: () => Navigator.pop(context, 'vid')),
        ]),
      ),
    );
    if (choice == null) return;
    final picker = ImagePicker();
    final XFile? x = choice == 'vid'
        ? await picker.pickVideo(source: ImageSource.gallery)
        : await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (x != null && mounted) setState(() { _file = File(x.path); _fileIsVideo = choice == 'vid'; });
  }

  Future<void> _publish() async {
    if (_ctrl.text.trim().isEmpty && _file == null) return;
    setState(() => _posting = true);
    String? url;
    if (_file != null) url = await uploadPostMedia(_file!);
    await createPost(_ctrl.text, imageUrl: url);
    if (mounted) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nova publicação', style: TextStyle(fontSize: 17)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: SizedBox(
                height: 34,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: _accent,
                    foregroundColor: Colors.white,
                    shape: const StadiumBorder(),
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                  ),
                  onPressed: _posting ? null : _publish,
                  child: _posting
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Publicar'),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                memberAvatar(_me, 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    TextField(
                      controller: _ctrl,
                      autofocus: true,
                      minLines: 3,
                      maxLines: 12,
                      maxLength: 500,
                      style: const TextStyle(fontSize: 17, height: 1.4),
                      decoration: InputDecoration(
                        hintText: 'O que está acontecendo?',
                        hintStyle: TextStyle(color: t38(context), fontSize: 17),
                        border: InputBorder.none,
                        filled: false,
                        counterText: '',
                      ),
                    ),
                    if (_file != null)
                      Stack(children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: _fileIsVideo
                              ? Container(height: 160, width: double.infinity, color: tFillC(context), alignment: Alignment.center, child: const Icon(Icons.play_circle_fill, color: Colors.white70, size: 44))
                              : Image.file(_file!, height: 200, width: double.infinity, fit: BoxFit.cover),
                        ),
                        Positioned(
                          right: 8, top: 8,
                          child: GestureDetector(
                            onTap: () => setState(() { _file = null; _fileIsVideo = false; }),
                            child: Container(padding: const EdgeInsets.all(5), decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle), child: const Icon(Icons.close, size: 16, color: Colors.white)),
                          ),
                        ),
                      ]),
                  ]),
                ),
              ]),
            ),
          ),
          Divider(height: 1, color: t12(context)),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: Row(children: [
                IconButton(onPressed: _pickMedia, icon: const Icon(Icons.image_outlined, color: _accent)),
                IconButton(onPressed: _pickMedia, icon: const Icon(Icons.videocam_outlined, color: _accent)),
              ]),
            ),
          ),
        ]),
      ),
    );
  }
}
