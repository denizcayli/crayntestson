<?php
/**
 * Crayn AI teması.
 *
 * Tasarımın tamamı app/ klasöründeki derlenmiş uygulamadır (`npm run build:wp`). Tema onu
 * sayfaya yükler ve panelden girilen içeriği window.CRAYN olarak ona verir; panelde boş
 * bırakılan her alan için uygulama onaylı içeriği gösterir.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require get_template_directory() . '/inc/tema-ayarlari.php';
require get_template_directory() . '/inc/rotalar.php';
require get_template_directory() . '/inc/elemanlar.php';
require get_template_directory() . '/inc/bolumler.php';
require get_template_directory() . '/inc/sayfalar.php';
require get_template_directory() . '/inc/icerik.php';
require get_template_directory() . '/inc/aktarim.php';
require get_template_directory() . '/inc/talepler.php';
require get_template_directory() . '/inc/metinler.php';
require get_template_directory() . '/inc/talep-formu.php';
require get_template_directory() . '/inc/seo.php';
require get_template_directory() . '/inc/uygulama.php';

function crayn_kurulum() {
	add_theme_support( 'title-tag' );
	register_nav_menus(
		array(
			'ana-menu' => 'Ana Menü (tam ekran menü)',
			'footer-1' => 'Footer — 1. sütun',
			'footer-2' => 'Footer — 2. sütun',
			'footer-3' => 'Footer — 3. sütun',
		)
	);
}
add_action( 'after_setup_theme', 'crayn_kurulum' );

// Yönetim çubuğu üstte sabit duran menünün yerini kaydırır.
add_filter( 'show_admin_bar', '__return_false' );

// WordPress'in kendi ön yüz stilleri (emoji, blok editörü genel stilleri) tasarıma karışmasın.
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
