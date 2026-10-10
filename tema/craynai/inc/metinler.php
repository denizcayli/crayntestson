<?php
/**
 * Sitedeki sabit yazılar (düğmeler, etiketler, form soruları). Liste veri/texts.json
 * dosyasından gelir, o da uygulamanın kaynağından derlenir. Her yazı ait olduğu yerden
 * düzenlenir:
 *  - Talep formu: "Talep" sayfasındaki eleman (inc/talep-formu.php)
 *  - Görüşme kartı: Görünüm → Görüşme Kartı
 *  - Geri kalan birkaç yazı: Görünüm → Site Metinleri
 * Kutuda soluk yazan, sitede şu an görünen onaylı metindir; kutuya yazılan onun yerine geçer.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Ayar sayfası => [ başlık, ayarın adı, gösterdiği gruplar ( boşsa: başka yerde düzenlenmeyenler ) ].
function crayn_metin_sayfalari() {
	return array(
		'crayn-kart'     => array( 'Görüşme Kartı', 'crayn_kart_metin', array( 'Görüşme kartı' ) ),
		'crayn-metinler' => array( 'Site Metinleri', 'crayn_metin', array() ),
	);
}

// Bir ayar sayfasının grupları: grup adı => metinler.
function crayn_metin_gruplari( $sayfa ) {
	$sayfalar = crayn_metin_sayfalari();
	$istenen  = $sayfalar[ $sayfa ][2];
	$gruplar  = array();
	foreach ( crayn_veri_dosyasi( 'texts' ) as $ad => $metinler ) {
		$baska_yerde = in_array( $ad, array( 'Talep formu', 'Görüşme kartı' ), true );
		if ( $istenen ? in_array( $ad, $istenen, true ) : ! $baska_yerde ) {
			$gruplar[ $ad ] = is_array( $metinler ) ? $metinler : array();
		}
	}
	return $gruplar;
}

// Bir ayar sayfasında değiştirilmiş metinler: onaylı metin => yerine geçen.
function crayn_metinler( $sayfa ) {
	$sayfalar = crayn_metin_sayfalari();
	$kayitli  = get_option( $sayfalar[ $sayfa ][1], array() );
	$metinler = array();
	foreach ( crayn_metin_gruplari( $sayfa ) as $grup ) {
		foreach ( $grup as $metin ) {
			$anahtar = md5( $metin );
			if ( isset( $kayitli[ $anahtar ] ) && '' !== $kayitli[ $anahtar ] ) {
				$metinler[ $metin ] = $kayitli[ $anahtar ];
			}
		}
	}
	return $metinler;
}

function crayn_metin_temizle( $girdi ) {
	$temiz = array();
	foreach ( ( is_array( $girdi ) ? $girdi : array() ) as $anahtar => $deger ) {
		$deger = sanitize_text_field( $deger );
		if ( '' !== $deger ) {
			$temiz[ sanitize_key( $anahtar ) ] = $deger;
		}
	}
	return $temiz;
}

function crayn_metin_kaydet() {
	foreach ( crayn_metin_sayfalari() as $sayfa => $bilgi ) {
		register_setting( $sayfa, $bilgi[1], array( 'sanitize_callback' => 'crayn_metin_temizle' ) );
	}
}
add_action( 'admin_init', 'crayn_metin_kaydet' );

function crayn_metin_menusu() {
	foreach ( crayn_metin_sayfalari() as $sayfa => $bilgi ) {
		add_theme_page( $bilgi[0], $bilgi[0], 'manage_options', $sayfa, 'crayn_metin_sayfasi' );
	}
}
add_action( 'admin_menu', 'crayn_metin_menusu' );

function crayn_metin_sayfasi() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- yalnızca hangi sayfanın açıldığını okur.
	$sayfa    = isset( $_GET['page'] ) ? sanitize_key( $_GET['page'] ) : '';
	$sayfalar = crayn_metin_sayfalari();
	if ( ! isset( $sayfalar[ $sayfa ] ) ) {
		return;
	}
	$ayar    = $sayfalar[ $sayfa ][1];
	$kayitli = get_option( $ayar, array() );
	$gruplar = crayn_metin_gruplari( $sayfa );
	?>
	<div class="wrap">
		<h1><?php echo esc_html( $sayfalar[ $sayfa ][0] ); ?></h1>
		<p>Her kutuda soluk yazan, sitede şu an görünen metindir. Değiştirmek istediğinizin kutusuna yenisini yazın; boş bırakılan aynı kalır.</p>
		<form method="post" action="options.php">
			<?php settings_fields( $sayfa ); ?>
			<?php foreach ( $gruplar as $grup_adi => $grup ) : ?>
				<?php if ( count( $gruplar ) > 1 ) : ?>
					<h2><?php echo esc_html( $grup_adi ); ?></h2>
				<?php endif; ?>
				<table class="form-table" role="presentation">
					<?php foreach ( $grup as $metin ) : ?>
						<?php $anahtar = md5( $metin ); ?>
						<tr>
							<th scope="row"><label for="crayn-metin-<?php echo esc_attr( $anahtar ); ?>"><?php echo esc_html( $metin ); ?></label></th>
							<td><input type="text" id="crayn-metin-<?php echo esc_attr( $anahtar ); ?>" name="<?php echo esc_attr( $ayar ); ?>[<?php echo esc_attr( $anahtar ); ?>]" value="<?php echo esc_attr( isset( $kayitli[ $anahtar ] ) ? $kayitli[ $anahtar ] : '' ); ?>" class="large-text" placeholder="<?php echo esc_attr( $metin ); ?>" /></td>
						</tr>
					<?php endforeach; ?>
				</table>
			<?php endforeach; ?>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

// Görüşme kartının yazıları önceleri Site Metinleri sayfasında düzenleniyordu. Orada girilmiş
// olanlar kartın kendi sayfasına taşınır; yeni sayfada girilmiş bir değerin üzerine yazılmaz.
// Bir kez çalışır.
function crayn_kart_metinlerini_tasi() {
	if ( get_option( 'crayn_kart_metni_tasindi' ) ) {
		return;
	}
	update_option( 'crayn_kart_metni_tasindi', '1' );

	$eski = get_option( 'crayn_metin', array() );
	$yeni = get_option( 'crayn_kart_metin', array() );
	if ( ! is_array( $eski ) || ! is_array( $yeni ) ) {
		return;
	}
	foreach ( crayn_metin_gruplari( 'crayn-kart' ) as $grup ) {
		foreach ( $grup as $metin ) {
			$anahtar = md5( $metin );
			if ( ! empty( $eski[ $anahtar ] ) && empty( $yeni[ $anahtar ] ) ) {
				$yeni[ $anahtar ] = $eski[ $anahtar ];
			}
		}
	}
	update_option( 'crayn_kart_metin', $yeni );
}
add_action( 'init', 'crayn_kart_metinlerini_tasi', 30 );

