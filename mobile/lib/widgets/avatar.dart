import 'package:flutter/material.dart';

Widget memberAvatar(Map<String, dynamic>? prof, double radius) {
  final url = prof?['avatar_url'] as String?;
  final name = (prof?['display_name'] ?? prof?['handle'] ?? '?').toString();
  if (url != null && url.isNotEmpty) {
    return CircleAvatar(radius: radius, backgroundImage: NetworkImage(url));
  }
  return CircleAvatar(
    radius: radius,
    backgroundColor: const Color(0xFF9B72CB),
    child: Text(
      name.isNotEmpty ? name[0].toUpperCase() : '?',
      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: radius * 0.8),
    ),
  );
}
