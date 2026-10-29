import 'package:flutter/material.dart';
import '../db.dart';
import 'article_list_screen.dart';

class BibliotecaScreen extends StatelessWidget {
  const BibliotecaScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text("Biblioteca"),
          bottom: const TabBar(tabs: [
            Tab(text: "Salvos"),
            Tab(text: "Curtidos"),
            Tab(text: "Histórico"),
          ]),
        ),
        body: TabBarView(children: [
          ArticleListView(load: getSavedArticles, emptyText: "Você ainda não salvou matérias."),
          ArticleListView(load: getLikedArticles, emptyText: "Você ainda não curtiu matérias."),
          ArticleListView(load: getHistory, emptyText: "Seu histórico aparece aqui."),
        ]),
      ),
    );
  }
}
