<?php
/**
 * İlk kurulumda sitenin sayfalarını elemanlarıyla birlikte oluşturur. Her biri bir kez çalışır;
 * sayfa sonradan silinirse yeniden oluşturulmaz.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// İlk kurulumda "Ana Sayfa"yı bütün bölümleriyle oluşturur ve ön sayfa yapar.
function crayn_anasayfa_olustur() {
	$kayitli = (int) get_option( 'crayn_anasayfa_id' );
	if ( $kayitli && get_post( $kayitli ) ) {
		return;
	}

	$icerik = '';
	foreach ( array_keys( crayn_bolum_tanimlari() ) as $etiket ) {
		$icerik .= '[vc_row][vc_column][' . $etiket . '][/vc_column][/vc_row]';
	}
	$sayfa = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Ana Sayfa',
			'post_name'    => 'ana-sayfa',
			'post_content' => $icerik,
		)
	);
	if ( ! $sayfa || is_wp_error( $sayfa ) ) {
		return;
	}

	update_post_meta( $sayfa, '_wpb_vc_js_status', 'true' );
	update_option( 'crayn_anasayfa_id', $sayfa );
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $sayfa );
}
add_action( 'init', 'crayn_anasayfa_olustur', 20 );

// İlk kurulumda "Hakkımızda" sayfasını elemanıyla birlikte oluşturur.
function crayn_hakkimizda_olustur() {
	$kayitli = (int) get_option( 'crayn_hakkimizda_id' );
	if ( ( $kayitli && get_post( $kayitli ) ) || get_page_by_path( 'hakkimizda' ) ) {
		return;
	}
	$sayfa = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Hakkımızda',
			'post_name'    => 'hakkimizda',
			'post_content' => '[vc_row][vc_column][crayn_hakkimizda][/vc_column][/vc_row]',
		)
	);
	if ( ! $sayfa || is_wp_error( $sayfa ) ) {
		return;
	}
	update_post_meta( $sayfa, '_wpb_vc_js_status', 'true' );
	update_option( 'crayn_hakkimizda_id', $sayfa );
}
add_action( 'init', 'crayn_hakkimizda_olustur', 20 );

// İlk kurulumda menüleri onaylı bağlantılarıyla oluşturur ve konumlarına atar ki panelden
// düzenlenebilsinler. Konumlardan birine menü atanmışsa hiçbir şey yapmaz. Footer'ın üçüncü
// sütunundaki #eposta ve #telefon bağlantılarını uygulama Tema Ayarları'ndaki e-posta ve
// telefonla değiştirir; böylece bu ikisi tek yerden yönetilir.
function crayn_menuleri_olustur() {
	if ( get_option( 'crayn_menuler_olusturuldu' ) ) {
		return;
	}
	update_option( 'crayn_menuler_olusturuldu', '1' );

	$konumlar = get_nav_menu_locations();
	if ( array_filter( $konumlar ) ) {
		return;
	}

	$menuler = array(
		'ana-menu' => array(
			'Ana Menü',
			array(
				'Ana Sayfa'       => '/#',
				'Hakkımızda'      => '/hakkimizda',
				'Hizmetler'       => '/#services',
				'Neler Yapıyoruz' => '/#solutions',
				'İletişim'        => '/talep',
			),
		),
		'footer-1' => array(
			'Crayn AI',
			array(
				'Hizmetler'       => '/#services',
				'Neler Yapıyoruz' => '/#solutions',
				'Hakkımızda'      => '/hakkimizda',
			),
		),
		'footer-2' => array(
			'Keşfet',
			array(
				'İçerikler'             => '/icerikler',
				'Sıkça Sorulan Sorular' => '/#cta',
			),
		),
		'footer-3' => array(
			'İletişim',
			array(
				'Bize Ulaşın' => '/talep',
				'E-posta'     => '#eposta',
				'Telefon'     => '#telefon',
			),
		),
	);

	foreach ( $menuler as $konum => $menu ) {
		if ( wp_get_nav_menu_object( $menu[0] ) ) {
			continue;
		}
		$kimlik = wp_create_nav_menu( $menu[0] );
		if ( ! $kimlik || is_wp_error( $kimlik ) ) {
			continue;
		}
		foreach ( $menu[1] as $yazi => $adres ) {
			wp_update_nav_menu_item(
				$kimlik,
				0,
				array(
					'menu-item-title'  => $yazi,
					'menu-item-url'    => '/' === $adres[0] ? home_url( $adres ) : $adres,
					'menu-item-type'   => 'custom',
					'menu-item-status' => 'publish',
				)
			);
		}
		$konumlar[ $konum ] = (int) $kimlik;
	}
	set_theme_mod( 'nav_menu_locations', $konumlar );
}
add_action( 'init', 'crayn_menuleri_olustur', 20 );

