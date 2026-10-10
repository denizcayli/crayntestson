<?php
/**
 * Talep formu: "Talep" sayfasındaki tek eleman. Formun yazıları sekmelere (Genel, adımlar,
 * düğmeler) ayrılmış alanlardır; soruların seçenekleri " | " ile ayrılmış listelerdir, yeni
 * seçenek eklenebilir ya da çıkarılabilir. Formu uygulama çizer; eleman yalnızca değişenleri verir.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Elemanın alanları ve ilk değerleri. Yazıların alan adı m_ + metnin özeti, listelerinki l_ + adıdır.
function crayn_talep_alanlari() {
	static $sonuc = null;
	if ( null !== $sonuc ) {
		return $sonuc;
	}

	$alanlar = array();
	$onayli  = array();
	$metin   = array();
	$form    = crayn_veri_dosyasi( 'form-page' );
	$listeler = isset( $form['lists'] ) && is_array( $form['lists'] ) ? $form['lists'] : array();
	// Her yazının paneldeki alan adı; adı olmayan yazı kendi metniyle adlandırılır.
	$adlar = isset( $form['labels'] ) && is_array( $form['labels'] ) ? $form['labels'] : array();

	foreach ( crayn_veri_dosyasi( 'talep' ) as $sekme => $metinler ) {
		foreach ( $listeler as $ad => $liste ) {
			if ( $liste['tab'] === $sekme ) {
				$alanlar[ 'l_' . $ad ] = array( $liste['label'], 'metin', 'Seçenekleri | ile ayırın. Ekleyebilir, çıkarabilir, sırasını değiştirebilirsiniz.', $sekme );
				$onayli[ 'l_' . $ad ]  = $liste['items'];
			}
		}
		foreach ( ( is_array( $metinler ) ? $metinler : array() ) as $yazi ) {
			$alan             = 'm_' . md5( $yazi );
			$alanlar[ $alan ] = array( isset( $adlar[ $yazi ] ) ? $adlar[ $yazi ] : $yazi, 'metin', '', $sekme );
			$onayli[ $alan ]  = $yazi;
			$metin[ $alan ]   = $yazi;
		}
	}

	$alanlar['ek_sorular'] = array(
		'Ek sorular',
		'grup',
		array(
			'label'       => array( 'Soru', 'metin', '' ),
			'step'        => array(
				'Hangi adımda sorulsun',
				'secim',
				array(
					'1. adım' => '1',
					'2. adım' => '2',
					'3. adım' => '3',
					'4. adım' => '4',
				),
			),
			'type'        => array(
				'Cevap türü',
				'secim',
				array(
					'Kısa yazı'      => 'text',
					'Uzun yazı'      => 'textarea',
					'Seçim listesi' => 'select',
				),
			),
			'options'     => array( 'Seçenekler', 'metin', 'Yalnızca seçim listesi için; | ile ayırın.' ),
			'placeholder' => array( 'Kutunun içindeki ipucu', 'metin', 'Seçim listesinde, seçim yapılmadan görünen yazıdır.' ),
			'required'    => array(
				'Zorunlu mu',
				'secim',
				array(
					'Hayır' => '',
					'Evet'  => 'evet',
				),
			),
		),
		'Ek sorular',
	);

	$sonuc = array( $alanlar, $onayli, $metin );
	return $sonuc;
}

function crayn_talep_vc_elemani() {
	if ( ! function_exists( 'vc_map' ) ) {
		return;
	}
	list( $alanlar, $onayli ) = crayn_talep_alanlari();
	vc_map(
		array(
			'name'        => 'Crayn — Talep formu',
			'base'        => 'crayn_talep',
			'category'    => 'Crayn AI',
			'description' => 'Formun yazıları ve seçenekleri.',
			'params'      => crayn_vc_alanlari( $alanlar, $onayli ),
		)
	);
}
add_action( 'vc_before_init', 'crayn_talep_vc_elemani' );

function crayn_talep_kisa_kodu() {
	add_shortcode( 'crayn_talep', '__return_empty_string' );
}
add_action( 'init', 'crayn_talep_kisa_kodu' );

// "Talep" sayfasındaki elemanda girilenler:
// [ yazılar ( onaylı => yeni ), listeler ( ad => seçenekler ), ek sorular ( paneldeki sırasıyla ) ].
function crayn_talep_icerigi() {
	static $sonuc = null;
	if ( null !== $sonuc ) {
		return $sonuc;
	}
	$yazilar  = array();
	$listeler = array();
	$sorular  = array();
	$sonuc    = array( $yazilar, $listeler, $sorular );
	$sayfa    = get_page_by_path( 'talep' );
	if ( ! $sayfa || 'publish' !== $sayfa->post_status ) {
		return $sonuc;
	}

	list( $alanlar, , $metin ) = crayn_talep_alanlari();
	$tanim                     = array( 'crayn_talep' => array( 'Talep formu', 'talep_form', $alanlar ) );
	foreach ( crayn_icerik_bolumleri( $sayfa->post_content, $tanim ) as $bolum ) {
		foreach ( $bolum['props'] as $alan => $deger ) {
			if ( 'ek_sorular' === $alan ) {
				$sorular = is_array( $deger ) ? array_values( $deger ) : array();
			} elseif ( isset( $metin[ $alan ] ) ) {
				if ( $deger !== $metin[ $alan ] ) {
					$yazilar[ $metin[ $alan ] ] = $deger;
				}
			} else {
				$listeler[ substr( $alan, 2 ) ] = $deger;
			}
		}
	}
	$sonuc = array( $yazilar, $listeler, $sorular );
	return $sonuc;
}

// İlk kurulumda "Talep" sayfasını elemanıyla birlikte oluşturur.
function crayn_talep_sayfasi_olustur() {
	$kayitli = (int) get_option( 'crayn_talep_sayfa_id' );
	if ( ( $kayitli && get_post( $kayitli ) ) || get_page_by_path( 'talep' ) ) {
		return;
	}
	$sayfa = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Talep',
			'post_name'    => 'talep',
			'post_content' => '[vc_row][vc_column][crayn_talep][/vc_column][/vc_row]',
		)
	);
	if ( ! $sayfa || is_wp_error( $sayfa ) ) {
		return;
	}
	update_post_meta( $sayfa, '_wpb_vc_js_status', 'true' );
	update_option( 'crayn_talep_sayfa_id', $sayfa );
}
add_action( 'init', 'crayn_talep_sayfasi_olustur', 20 );
