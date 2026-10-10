<?php
/**
 * Derlenmiş uygulamayı sayfaya yükler ve panelden gelen veriyi ona verir.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Derlemenin dosya listesi: karma adlı JS ve CSS dosyalarının yolları buradan okunur.
function crayn_derleme_listesi() {
	static $liste = null;
	if ( null === $liste ) {
		$dosya = get_template_directory() . '/app/manifest.json';
		$liste = file_exists( $dosya ) ? json_decode( file_get_contents( $dosya ), true ) : array();
		if ( ! is_array( $liste ) ) {
			$liste = array();
		}
	}
	return $liste;
}

// Uygulamanın giriş dosyası.
function crayn_giris_dosyasi() {
	foreach ( crayn_derleme_listesi() as $kayit ) {
		if ( ! empty( $kayit['isEntry'] ) ) {
			return $kayit;
		}
	}
	return array();
}

function crayn_menu_ogeleri( $konum ) {
	$konumlar = get_nav_menu_locations();
	if ( empty( $konumlar[ $konum ] ) ) {
		return array();
	}
	$ogeler = wp_get_nav_menu_items( $konumlar[ $konum ] );
	if ( ! $ogeler ) {
		return array();
	}
	$liste = array();
	foreach ( $ogeler as $oge ) {
		$liste[] = array(
			'label' => wp_specialchars_decode( $oge->title, ENT_QUOTES ),
			'href'  => $oge->url,
		);
	}
	return $liste;
}

// Footer sütunları: sütun başlığı, o konuma atanan menünün adıdır.
function crayn_footer_menuleri() {
	$konumlar = get_nav_menu_locations();
	$sutunlar = array();
	foreach ( array( 'footer-1', 'footer-2', 'footer-3' ) as $konum ) {
		$ogeler = crayn_menu_ogeleri( $konum );
		if ( ! $ogeler ) {
			continue;
		}
		$menu       = wp_get_nav_menu_object( $konumlar[ $konum ] );
		$sutunlar[] = array(
			'title' => $menu ? $menu->name : '',
			'links' => $ogeler,
		);
	}
	return $sutunlar;
}

function crayn_veri() {
	$yol = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
	list( $talep_yazilari, $talep_listeleri, $talep_sorulari ) = crayn_talep_icerigi();

	return array(
		'base'   => untrailingslashit( $yol ? $yol : '' ),
		'assets' => get_template_directory_uri() . '/app',
		'site'   => array(
			'email'      => crayn_ayar( 'email' ),
			'phone'      => crayn_ayar( 'telefon' ),
			'address'    => crayn_ayar( 'adres' ),
			'footerText' => crayn_ayar( 'footer_metin' ),
			'copyright'  => crayn_ayar( 'telif' ),
			'footerNote' => crayn_ayar( 'footer_not' ),
			'menuNote'   => crayn_ayar( 'menu_not' ),
			'instagram'  => crayn_ayar( 'instagram' ),
			'x'          => crayn_ayar( 'x' ),
			'linkedin'   => crayn_ayar( 'linkedin' ),
			'icon'       => crayn_ayar( 'logo_simge' ),
			'wordmark'   => crayn_ayar( 'logo_yazi' ),
		),
		'menus'  => array(
			'main'   => crayn_menu_ogeleri( 'ana-menu' ),
			'footer' => crayn_footer_menuleri(),
		),
		'sections' => crayn_sayfa_bolumleri(),
		'services' => crayn_hizmetler(),
		'posts'    => crayn_yazilar(),
		'form'     => admin_url( 'admin-ajax.php' ),
		'texts'    => (object) crayn_metinler( 'crayn-metinler' ),
		'scopes'   => array(
			'talep' => (object) $talep_yazilari,
			'kart'  => (object) crayn_metinler( 'crayn-kart' ),
		),
		'lists'    => (object) $talep_listeleri,
		'questions' => $talep_sorulari,
	);
}

// Listedeki bir kaydın dosyasını ve onun gerektirdiklerini toplar.
function crayn_gereken_dosyalar( $anahtar, &$dosyalar ) {
	$liste = crayn_derleme_listesi();
	if ( empty( $liste[ $anahtar ]['file'] ) || isset( $dosyalar[ $liste[ $anahtar ]['file'] ] ) ) {
		return;
	}
	$dosyalar[ $liste[ $anahtar ]['file'] ] = true;
	foreach ( ( isset( $liste[ $anahtar ]['imports'] ) ? $liste[ $anahtar ]['imports'] : array() ) as $alt ) {
		crayn_gereken_dosyalar( $alt, $dosyalar );
	}
}

// Uygulama her sayfanın kodunu ayrı dosyada tutar. Açılan sayfanınki ve ortak parçalar baştan
// istenir ki tarayıcı onları sırayla keşfetmek zorunda kalmasın.
function crayn_on_yukleme() {
	$sayfalar = array(
		'ana'        => 'Home',
		'talep'      => 'Talep',
		'hakkimizda' => 'Hakkimizda',
		'hizmetler'  => 'Hizmetler',
		'hizmet'     => 'Hizmet',
		'icerikler'  => 'Icerikler',
		'yazi'       => 'IcerikDetay',
	);
	$gorunum  = crayn_gorunum();
	$dosyalar = array();
	foreach ( crayn_derleme_listesi() as $anahtar => $kayit ) {
		if ( ! empty( $kayit['isEntry'] ) ) {
			crayn_gereken_dosyalar( $anahtar, $dosyalar );
		}
	}
	crayn_gereken_dosyalar( 'src/pages/' . ( isset( $sayfalar[ $gorunum[0] ] ) ? $sayfalar[ $gorunum[0] ] : 'NotFound' ) . '.jsx', $dosyalar );

	$uygulama = get_template_directory_uri() . '/app/';
	foreach ( array_keys( $dosyalar ) as $dosya ) {
		echo '<link rel="modulepreload" href="' . esc_url( $uygulama . $dosya ) . '" />' . "\n";
	}
}

function crayn_basa_ekle() {
	$uygulama = get_template_directory_uri() . '/app';
	crayn_seo_etiketleri();
	?>
	<link rel="icon" href="<?php echo esc_url( crayn_ayar( 'logo_simge' ) ? crayn_ayar( 'logo_simge' ) : $uygulama . '/assets/brand/crayn-icon-192.png' ); ?>" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<?php crayn_on_yukleme(); ?>
	<script>window.CRAYN = <?php echo wp_json_encode( crayn_veri(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE ); ?>;</script>
	<?php
}
add_action( 'wp_head', 'crayn_basa_ekle', 1 );

function crayn_dosyalari_yukle() {
	// Blok editörünün ön yüz stilleri tasarıma karışmasın.
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'classic-theme-styles' );
	// Bölümleri uygulama çizer; WPBakery'nin ön yüz stilleri de gerekmez.
	wp_dequeue_style( 'js_composer_front' );
	wp_dequeue_style( 'js_composer_custom_css' );

	wp_enqueue_style( 'crayn-font', 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap', array(), null );

	$giris    = crayn_giris_dosyasi();
	$uygulama = get_template_directory_uri() . '/app/';
	if ( empty( $giris['file'] ) ) {
		return;
	}
	if ( ! empty( $giris['css'] ) ) {
		foreach ( $giris['css'] as $sira => $css ) {
			wp_enqueue_style( 'crayn-app-' . $sira, $uygulama . $css, array(), null );
		}
	}
	wp_enqueue_script_module( 'crayn-app', $uygulama . $giris['file'], array(), null );
}
add_action( 'wp_enqueue_scripts', 'crayn_dosyalari_yukle', 100 );
