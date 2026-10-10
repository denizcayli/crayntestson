<?php
/**
 * Uygulamanın kendi sayfaları (/talep, /hizmetler/…): WordPress'te karşılığı olmayan
 * adreslerin "bulunamadı" yerine uygulamaya ulaşmasını sağlar.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Kurallar değişince artır: kalıcı bağlantılar bir kez yeniden yazılır.
define( 'CRAYN_ROTA_SURUM', '2' );

function crayn_rotalar() {
	add_rewrite_rule( '^(talep|hakkimizda|hizmetler|icerikler)/?$', 'index.php?crayn_rota=$matches[1]', 'top' );
	add_rewrite_rule( '^(hizmetler|icerikler)/([^/]+)/?$', 'index.php?crayn_rota=$matches[1]&crayn_alt=$matches[2]', 'top' );

	if ( get_option( 'crayn_rota_surum' ) !== CRAYN_ROTA_SURUM ) {
		global $wp_rewrite;
		// Yazıların paneldeki adresi, uygulamadaki adresleriyle aynı olsun.
		$wp_rewrite->set_permalink_structure( '/icerikler/%postname%/' );
		flush_rewrite_rules();
		update_option( 'crayn_rota_surum', CRAYN_ROTA_SURUM );
	}
}
add_action( 'init', 'crayn_rotalar' );

function crayn_rota_degiskenleri( $degiskenler ) {
	$degiskenler[] = 'crayn_rota';
	$degiskenler[] = 'crayn_alt';
	return $degiskenler;
}
add_filter( 'query_vars', 'crayn_rota_degiskenleri' );

// Bu adresler WordPress'in gözünde ana sayfadır; oraya yönlendirmesin.
function crayn_rota_yonlendirme( $adres ) {
	return get_query_var( 'crayn_rota' ) ? false : $adres;
}
add_filter( 'redirect_canonical', 'crayn_rota_yonlendirme' );
