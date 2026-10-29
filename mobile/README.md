# Monatiza — App (Flutter)

Esqueleto do app **Android + iOS** da Monatiza. Usa o **mesmo backend do site**
(Supabase): quem assina no site entra no app já Premium, e histórico/favoritos/
preferências ficam sincronizados (são as mesmas tabelas). As regras de Premium
são aplicadas no banco (RLS), então o app não consegue burlar o paywall.

## O que já vem pronto
- Login com a conta de assinante (mesma do site) — `lib/screens/login_screen.dart`
- Feed de notícias (tabela `articles`) — `lib/screens/feed_screen.dart`
- Leitor com paywall (usa a função `get_article_body`) — `lib/screens/reader_screen.dart`
- Conexão Supabase compartilhada — `lib/config.dart`, `lib/main.dart`

## Como rodar (1ª vez)
Pré-requisito: [Flutter SDK](https://docs.flutter.dev/get-started/install) instalado.

```bash
cd mobile
flutter create .        # gera as pastas android/ e ios/ (mantém lib/ e pubspec.yaml)
flutter pub get
flutter run             # roda em um emulador/aparelho conectado
```

## Publicar nas lojas
- **Android (Google Play):**
  ```bash
  flutter build appbundle   # gera build/app/outputs/bundle/release/app-release.aab
  ```
  Suba o `.aab` no [Google Play Console](https://play.google.com/console).

- **iOS (App Store):** precisa de Mac + Xcode + conta Apple Developer.
  ```bash
  flutter build ipa
  ```
  Envie pelo Xcode/Transporter para o [App Store Connect](https://appstoreconnect.apple.com).

## Próximos passos sugeridos
- Telas de Comunidade, Perfil e Revistas (reaproveitam as mesmas tabelas/RPCs)
- Notificações push (Firebase Cloud Messaging / APNs)
- Assinatura: levar para o checkout web (ou in-app purchase, exigido pelas lojas
  para conteúdo digital — avaliar regras de cada loja)

> Observação: a chave em `lib/config.dart` é a *publishable key* do Supabase —
> pública por design (igual à do site). A segurança real está no RLS do banco.
