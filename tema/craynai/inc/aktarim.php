<?php
/**
 * İlk kurulumda onaylı hizmetleri ve yazıları panele aktarır ki oradan düzenlenebilsinler.
 * Bir kez çalışır.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Onaylı bir yazının gövdesi (paragraf, { h } ara başlık, { list } madde listesi) HTML olarak.
function crayn_govde_html( $bloklar ) {
	$html = '';
	foreach ( ( is_array( $bloklar ) ? $bloklar : array() ) as $blok ) {
		if ( is_string( $blok ) ) {
			$html .= '<p>' . esc_html( $blok ) . "</p>\n";
		} elseif ( isset( $blok['h'] ) ) {
			$html .= '<h2>' . esc_html( $blok['h'] ) . "</h2>\n";
		} elseif ( isset( $blok['list'] ) && is_array( $blok['list'] ) ) {
			$html .= "<ul>\n";
			foreach ( $blok['list'] as $madde ) {
				$html .= '<li>' . esc_html( $madde ) . "</li>\n";
			}
			$html .= "</ul>\n";
		}
	}
	return $html;
}

// İlk kurulumda onaylı hizmetleri ve yazıları panele aktarır. Bir kez çalışır.
function crayn_icerik_aktar() {
	if ( get_option( 'crayn_icerik_aktarildi' ) ) {
		return;
	}
	update_option( 'crayn_icerik_aktarildi', '1' );

	$tanimlar = crayn_hizmet_tanimlari();
	$sayfa    = crayn_veri_dosyasi( 'service-page' );

	foreach ( crayn_veri_dosyasi( 'services' ) as $sira => $hizmet ) {
		if ( empty( $hizmet['slug'] ) || get_page_by_path( $hizmet['slug'], OBJECT, 'crayn_hizmet' ) ) {
			continue;
		}
		$icerik = '';
		foreach ( $tanimlar as $etiket => $tanim ) {
			$onayli  = isset( $sayfa[ $tanim[1] ] ) ? $sayfa[ $tanim[1] ] : array();
			$deger   = 'service' === $tanim[1] ? array_merge( $onayli, $hizmet ) : $onayli;
			$icerik .= '[vc_row][vc_column]' . crayn_kisa_kod( $etiket, $tanim[2], $deger ) . '[/vc_column][/vc_row]';
		}
		$kayit = wp_insert_post(
			array(
				'post_type'    => 'crayn_hizmet',
				'post_status'  => 'publish',
				'post_title'   => $hizmet['title'],
				'post_name'    => $hizmet['slug'],
				'post_content' => wp_slash( $icerik ),
				'menu_order'   => $sira + 1,
			)
		);
		if ( $kayit && ! is_wp_error( $kayit ) ) {
			update_post_meta( $kayit, '_wpb_vc_js_status', 'true' );
		}
	}

	$aktarilan = 0;
	foreach ( crayn_veri_dosyasi( 'posts' ) as $yazi ) {
		if ( empty( $yazi['slug'] ) || get_page_by_path( $yazi['slug'], OBJECT, 'post' ) ) {
			continue;
		}
		$kategori = array();
		if ( ! empty( $yazi['category'] ) ) {
			$terim = term_exists( $yazi['category'], 'category' );
			if ( ! $terim ) {
				$terim = wp_insert_term( $yazi['category'], 'category' );
			}
			if ( is_array( $terim ) ) {
				$kategori[] = (int) $terim['term_id'];
			}
		}
		$kayit = wp_insert_post(
			array(
				'post_type'     => 'post',
				'post_status'   => 'publish',
				'post_title'    => $yazi['title'],
				'post_name'     => $yazi['slug'],
				'post_excerpt'  => isset( $yazi['excerpt'] ) ? $yazi['excerpt'] : '',
				'post_content'  => wp_slash( crayn_govde_html( isset( $yazi['body'] ) ? $yazi['body'] : array() ) ),
				'post_date'     => ( isset( $yazi['date'] ) ? $yazi['date'] : gmdate( 'Y-m-d' ) ) . ' 09:00:00',
				'post_category' => $kategori,
			)
		);
		if ( $kayit && ! is_wp_error( $kayit ) ) {
			update_post_meta( $kayit, 'crayn_okuma_suresi', isset( $yazi['readTime'] ) ? $yazi['readTime'] : '' );
			++$aktarilan;
		}
	}

	// WordPress'in örnek yazısı listede onaylı yazıların arasına karışmasın (çöpe gider, silinmez).
	$ornek = get_post( 1 );
	if ( $aktarilan && $ornek && 'post' === $ornek->post_type && 'merhaba-dunya' === $ornek->post_name ) {
		wp_trash_post( 1 );
	}
}
add_action( 'init', 'crayn_icerik_aktar', 25 );

// Onaylı yazılar ilk aktarıldığında "Görsel adresi" alanlarına dış bir adres yazılmıştı. Görseller
// artık temanın içinde; alan boşaltılır ki panelde kullanılmayan bir adres durmasın. Bir kez çalışır.
function crayn_eski_gorsel_adreslerini_temizle() {
	if ( get_option( 'crayn_gorsel_temizlendi' ) ) {
		return;
	}
	update_option( 'crayn_gorsel_temizlendi', '1' );

	foreach ( crayn_veri_dosyasi( 'posts' ) as $yazi ) {
		$kayit = empty( $yazi['slug'] ) ? null : get_page_by_path( $yazi['slug'], OBJECT, 'post' );
		if ( $kayit && false !== strpos( (string) get_post_meta( $kayit->ID, 'crayn_gorsel_adresi', true ), 'images.unsplash.com' ) ) {
			delete_post_meta( $kayit->ID, 'crayn_gorsel_adresi' );
		}
	}
}
add_action( 'init', 'crayn_eski_gorsel_adreslerini_temizle', 30 );
