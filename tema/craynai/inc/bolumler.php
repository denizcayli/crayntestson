<?php
/**
 * Elemanların işleyişi. Bir eleman sayfaya kendisi bir şey basmaz: panelde doldurulan alanlar
 * uygulamaya verilir ve bölümü uygulama çizer. Boş bırakılan alanda veri/ klasöründeki onaylı
 * içerik görünür; aynı dosyalar paneldeki alanların ilk değeridir. Tanımlar elemanlar.php'dedir.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// veri/ klasöründeki bir onaylı içerik dosyası (uygulamadaki src/data dosyalarının kopyası).
function crayn_veri_dosyasi( $ad ) {
	$dosya = get_template_directory() . '/veri/' . $ad . '.json';
	$veri  = file_exists( $dosya ) ? json_decode( file_get_contents( $dosya ), true ) : array();
	return is_array( $veri ) ? $veri : array();
}

function crayn_onayli_icerik() {
	static $veri = null;
	if ( null === $veri ) {
		$veri = array();
		foreach ( array( 'home', 'service-page', 'about-page' ) as $ad ) {
			$veri = array_merge( $veri, crayn_veri_dosyasi( $ad ) );
		}
	}
	return $veri;
}

// WPBakery çift tırnağı ve köşeli parantezi kısa kodun içinde bu işaretlerle saklar.
function crayn_metin( $deger ) {
	return trim( str_replace( array( '`{`', '`}`', '``' ), array( '[', ']', '"' ), (string) $deger ) );
}

// Onaylı içerikteki bir satırın panele yazılan hali. Görsel yazılmaz: panelde görsel seçilmeyen
// satırda uygulama aynı sıradaki onaylı görseli kullanır.
function crayn_grup_satiri( $alanlar, $oge ) {
	$satir = array();
	foreach ( $alanlar as $ad => $alan ) {
		if ( isset( $oge[ $ad ] ) && 'gorsel' !== $alan[1] ) {
			$satir[ $ad ] = $oge[ $ad ];
		}
	}
	return $satir;
}

// Bir bölümün alanlarını WPBakery'nin beklediği biçimde, onaylı içerik ilk değer olarak verir.
function crayn_vc_alanlari( $alanlar, $onayli ) {
	$turler       = array(
		'metin' => 'textfield',
		'uzun'  => 'textarea',
		'renk'  => 'colorpicker',
	);
	$parametreler = array();
	$ilk          = true;

	foreach ( $alanlar as $ad => $alan ) {
		$deger = isset( $onayli[ $ad ] ) ? $onayli[ $ad ] : '';

		if ( 'grup' === $alan[1] ) {
			$satirlar = array();
			foreach ( ( is_array( $deger ) ? $deger : array() ) as $oge ) {
				$satirlar[] = crayn_grup_satiri( $alan[2], $oge );
			}
			$parametre = array(
				'type'       => 'param_group',
				'heading'    => $alan[0],
				'param_name' => $ad,
				'value'      => rawurlencode( wp_json_encode( $satirlar, JSON_UNESCAPED_UNICODE ) ),
				'params'     => crayn_vc_alanlari( $alan[2], array() ),
			);
			if ( isset( $alan[3] ) ) {
				$parametre['group'] = $alan[3];
			}
			$parametreler[] = $parametre;
			continue;
		}

		if ( 'secim' === $alan[1] ) {
			$parametreler[] = array(
				'type'       => 'dropdown',
				'heading'    => $alan[0],
				'param_name' => $ad,
				'value'      => $alan[2],
			);
			continue;
		}

		if ( 'gorsel' === $alan[1] ) {
			$parametreler[] = array(
				'type'        => 'attach_image',
				'heading'     => $alan[0],
				'param_name'  => $ad,
				'description' => 'Boş bırakılırsa onaylı görsel kullanılır.',
			);
			continue;
		}

		$parametre = array(
			'type'        => $turler[ $alan[1] ],
			'heading'     => $alan[0],
			'param_name'  => $ad,
			'value'       => is_string( $deger ) ? $deger : '',
			'description' => is_string( $alan[2] ) ? $alan[2] : '',
			'admin_label' => $ilk,
		);
		// Dördüncü değer, alanın eleman penceresinde hangi sekmede duracağıdır.
		if ( isset( $alan[3] ) ) {
			$parametre['group'] = $alan[3];
		}
		$parametreler[] = $parametre;
		$ilk            = false;
	}

	return $parametreler;
}

function crayn_vc_elemanlari() {
	if ( ! function_exists( 'vc_map' ) ) {
		return;
	}
	$onayli = crayn_onayli_icerik();
	foreach ( crayn_tum_tanimlar() as $etiket => $tanim ) {
		vc_map(
			array(
				'name'        => 'Crayn — ' . $tanim[0],
				'base'        => $etiket,
				'category'    => 'Crayn AI',
				'description' => 'Boş bırakılan alanda onaylı içerik görünür.',
				'params'      => crayn_vc_alanlari( $tanim[2], isset( $onayli[ $tanim[1] ] ) ? $onayli[ $tanim[1] ] : array() ),
			)
		);
	}
}
add_action( 'vc_before_init', 'crayn_vc_elemanlari' );

// Elemanlar sayfaya yazı basmaz; kısa kodun kendisi de görünmesin.
function crayn_kisa_kodlar() {
	foreach ( array_keys( crayn_tum_tanimlar() ) as $etiket ) {
		add_shortcode( $etiket, '__return_empty_string' );
	}
}
add_action( 'init', 'crayn_kisa_kodlar' );

// Kısa kodda (ya da gruptaki bir satırda) doldurulmuş alanları uygulamanın beklediği adlarla verir.
function crayn_alan_degerleri( $alanlar, $nitelikler ) {
	$degerler = array();

	foreach ( $alanlar as $ad => $alan ) {
		if ( 'grup' === $alan[1] ) {
			$satirlar = isset( $nitelikler[ $ad ] ) ? json_decode( urldecode( $nitelikler[ $ad ] ), true ) : array();
			$liste    = array();
			foreach ( ( is_array( $satirlar ) ? $satirlar : array() ) as $satir ) {
				$oge = is_array( $satir ) ? crayn_alan_degerleri( $alan[2], $satir ) : array();
				if ( $oge ) {
					$liste[] = $oge;
				}
			}
			if ( $liste ) {
				$degerler[ $ad ] = $liste;
			}
			continue;
		}

		if ( 'gorsel' === $alan[1] ) {
			$adres = '';
			if ( ! empty( $nitelikler[ $ad ] ) ) {
				$adres = wp_get_attachment_image_url( (int) $nitelikler[ $ad ], 'full' );
			}
			if ( $adres ) {
				$degerler[ $ad ] = $adres;
			}
			continue;
		}

		if ( isset( $nitelikler[ $ad ] ) && '' !== crayn_metin( $nitelikler[ $ad ] ) ) {
			$degerler[ $ad ] = crayn_metin( $nitelikler[ $ad ] );
		}
	}

	return $degerler;
}

// Bir içerikteki elemanlar, paneldeki sırasıyla: her biri [ type, props ].
function crayn_icerik_bolumleri( $icerik, $tanimlar ) {
	if ( ! preg_match_all( '/' . get_shortcode_regex( array_keys( $tanimlar ) ) . '/', $icerik, $eslesmeler, PREG_SET_ORDER ) ) {
		return array();
	}

	$bolumler = array();
	foreach ( $eslesmeler as $eslesme ) {
		$tanim      = $tanimlar[ $eslesme[2] ];
		$nitelikler = shortcode_parse_atts( $eslesme[3] );
		$bolumler[] = array(
			'type'  => $tanim[1],
			'props' => crayn_alan_degerleri( $tanim[2], is_array( $nitelikler ) ? $nitelikler : array() ),
		);
	}
	return $bolumler;
}

// Açılan sayfanın bölümleri.
function crayn_sayfa_bolumleri() {
	// Uygulamanın kendi adreslerinde (/hakkimizda) aynı adlı sayfa varsa onun içeriği okunur.
	$sayfa = 0;
	if ( is_singular() ) {
		$sayfa = get_queried_object_id();
	} elseif ( get_query_var( 'crayn_rota' ) && ! get_query_var( 'crayn_alt' ) ) {
		$bulunan = get_page_by_path( sanitize_title( get_query_var( 'crayn_rota' ) ) );
		$sayfa   = $bulunan && 'publish' === $bulunan->post_status ? $bulunan->ID : 0;
	}
	if ( ! $sayfa ) {
		return array();
	}
	$bolumler = crayn_icerik_bolumleri( (string) get_post_field( 'post_content', $sayfa ), array_merge( crayn_bolum_tanimlari(), crayn_hakkimizda_tanimlari() ) );
	foreach ( $bolumler as $sira => $bolum ) {
		$bolumler[ $sira ]['props'] = (object) $bolum['props'];
	}
	return $bolumler;
}

// Bir elemanı, verilen değerlerle kısa kod olarak yazar (içe aktarımda kullanılır).
function crayn_kisa_kod( $etiket, $alanlar, $degerler ) {
	$kod = '[' . $etiket;
	foreach ( $alanlar as $ad => $alan ) {
		if ( ! isset( $degerler[ $ad ] ) || '' === $degerler[ $ad ] ) {
			continue;
		}
		if ( 'grup' === $alan[1] ) {
			$satirlar = array();
			foreach ( ( is_array( $degerler[ $ad ] ) ? $degerler[ $ad ] : array() ) as $oge ) {
				$satirlar[] = crayn_grup_satiri( $alan[2], $oge );
			}
			$kod .= ' ' . $ad . '="' . rawurlencode( wp_json_encode( $satirlar, JSON_UNESCAPED_UNICODE ) ) . '"';
			continue;
		}
		if ( 'gorsel' === $alan[1] ) {
			continue;
		}
		$deger = str_replace( array( '"', '[', ']' ), array( '``', '`{`', '`}`' ), (string) $degerler[ $ad ] );
		$kod  .= ' ' . $ad . '="' . $deger . '"';
	}
	return $kod . ']';
}
