<?php
/**
 * Arama motorları ve bağlantı paylaşımı için: her sayfanın kendi başlığı, açıklaması ve
 * paylaşım kartı; olmayan adreslerde "bulunamadı" kodu; ve sayfadaki yazıların düz bir
 * kopyası. Sayfayı uygulama çizdiği için, programı çalıştırmayan botlar yazıları ancak bu
 * kopyadan okuyabilir. Kopya ekranda görünmez ve uygulama açılınca yerini ona bırakır.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function crayn_dolu( $deger ) {
	if ( is_array( $deger ) || is_object( $deger ) ) {
		return (bool) (array) $deger;
	}
	return '' !== (string) $deger;
}

// Site içi adres ( /talep ) tam adrese çevrilir; tam adres olduğu gibi kalır.
function crayn_adres( $adres ) {
	$adres = (string) $adres;
	return ( '' !== $adres && '/' === $adres[0] && 0 !== strpos( $adres, '//' ) ) ? home_url( $adres ) : $adres;
}

// Hizmetler, uygulamanın gördüğü haliyle: paneldekiler, boş alanlarında onaylı içerikle.
function crayn_tam_hizmetler() {
	static $liste = null;
	if ( null !== $liste ) {
		return $liste;
	}

	$onayli = array();
	foreach ( crayn_veri_dosyasi( 'services' ) as $hizmet ) {
		$onayli[ $hizmet['slug'] ] = $hizmet;
	}
	$sayfa  = crayn_veri_dosyasi( 'service-page' );
	$panel  = crayn_hizmetler();
	$kaynak = $panel ? $panel : array_values( $onayli );

	$liste = array();
	foreach ( $kaynak as $hizmet ) {
		$hizmet = (array) $hizmet;
		$taban  = isset( $onayli[ $hizmet['slug'] ] ) ? $onayli[ $hizmet['slug'] ] : array();
		$tam    = array_merge( isset( $sayfa['service'] ) ? $sayfa['service'] : array(), $taban, array_filter( $hizmet, 'crayn_dolu' ) );

		$tam['steps']  = array_merge( isset( $sayfa['service_steps'] ) ? $sayfa['service_steps'] : array(), array_filter( isset( $hizmet['steps'] ) ? (array) $hizmet['steps'] : array(), 'crayn_dolu' ) );
		$tam['others'] = array_merge( isset( $sayfa['service_others'] ) ? $sayfa['service_others'] : array(), array_filter( isset( $hizmet['others'] ) ? (array) $hizmet['others'] : array(), 'crayn_dolu' ) );
		if ( empty( $tam['features'] ) || ! is_array( $tam['features'] ) ) {
			$tam['features'] = array();
		}
		// Panelde görsel seçilmeyen sekmede aynı sıradaki onaylı görsel kullanılır.
		foreach ( $tam['features'] as $sira => $sekme ) {
			if ( empty( $sekme['image'] ) && ! empty( $taban['features'][ $sira ]['image'] ) ) {
				$sekme['image'] = $taban['features'][ $sira ]['image'];
			}
			$tam['features'][ $sira ]['image'] = crayn_gorsel_tam( isset( $sekme['image'] ) ? $sekme['image'] : '' );
		}
		$liste[] = $tam;
	}
	return $liste;
}

// Yazılar, uygulamanın gördüğü haliyle: paneldekiler, panel boşsa onaylı yazılar.
function crayn_tam_yazilar() {
	static $liste = null;
	if ( null !== $liste ) {
		return $liste;
	}
	$liste = crayn_yazilar();
	if ( ! $liste ) {
		foreach ( crayn_veri_dosyasi( 'posts' ) as $yazi ) {
			$yazi['bodyHtml'] = crayn_govde_html( isset( $yazi['body'] ) ? $yazi['body'] : array() );
			$liste[]          = $yazi;
		}
	}
	// Görseli olmayan onaylı yazıda onaylı görsel; temanın içindeki görseller tam adresiyle.
	foreach ( $liste as $sira => $yazi ) {
		$onayli = crayn_onayli_yazi( $yazi['slug'] );
		if ( empty( $yazi['image'] ) && $onayli && ! empty( $onayli['image'] ) ) {
			$yazi['image'] = $onayli['image'];
		}
		$liste[ $sira ]['image'] = crayn_gorsel_tam( isset( $yazi['image'] ) ? $yazi['image'] : '' );
	}
	return $liste;
}

// Açılan sayfa: [ tür, kayıt ]. Tür: ana, talep, hakkimizda, hizmetler, hizmet, icerikler, yazi, yok, diger.
function crayn_gorunum() {
	static $gorunum = null;
	if ( null !== $gorunum ) {
		return $gorunum;
	}

	$rota    = (string) get_query_var( 'crayn_rota' );
	$alt     = (string) get_query_var( 'crayn_alt' );
	$gorunum = array( 'diger', null );

	if ( is_404() ) {
		$gorunum = array( 'yok', null );
	} elseif ( $rota && $alt ) {
		$gorunum = array( 'yok', null );
		$liste   = 'hizmetler' === $rota ? crayn_tam_hizmetler() : crayn_tam_yazilar();
		foreach ( $liste as $kayit ) {
			if ( $kayit['slug'] === $alt ) {
				$gorunum = array( 'hizmetler' === $rota ? 'hizmet' : 'yazi', $kayit );
				break;
			}
		}
	} elseif ( $rota ) {
		$gorunum = array( $rota, null );
	} elseif ( is_front_page() ) {
		$gorunum = array( 'ana', null );
	}
	return $gorunum;
}

// Olmayan bir hizmet ya da yazı adresi "bulunamadı" koduyla yanıtlanır.
function crayn_bulunamadi_kodu() {
	$gorunum = crayn_gorunum();
	if ( 'yok' === $gorunum[0] && ! is_404() ) {
		status_header( 404 );
		nocache_headers();
	}
}
add_action( 'wp', 'crayn_bulunamadi_kodu' );

// Açılan sayfanın başlığı, açıklaması, görseli ve adresi.
function crayn_seo() {
	static $seo = null;
	if ( null !== $seo ) {
		return $seo;
	}
	global $wp;

	list( $tur, $kayit ) = crayn_gorunum();
	$site                = get_bloginfo( 'name' );
	$aciklama            = crayn_ayar( 'aciklama' );
	if ( ! $aciklama ) {
		$aciklama = "Crayn AI, modern işletmeler için özel AI agent'lar, otomasyon sistemleri ve ölçeklenebilir üretken yapay zeka yazılımları geliştiren yerli bir yazılım şirketidir.";
	}

	$seo = array(
		'baslik'   => '',
		'aciklama' => $aciklama,
		'gorsel'   => '',
		'tur'      => 'website',
		'adres'    => home_url( $wp->request ? '/' . $wp->request : '/' ),
	);

	$adlar = array(
		'talep'      => 'Talep Formu',
		'hakkimizda' => 'Hakkımızda',
		'hizmetler'  => 'Hizmetler',
		'icerikler'  => 'İçerikler',
		'yok'        => 'Sayfa bulunamadı',
	);

	if ( 'ana' === $tur ) {
		$ayar          = crayn_ayar( 'baslik' );
		$seo['baslik'] = $ayar ? $ayar : 'Crayn AI | Şirketlere Özel Üretken Yapay Zeka Yazılımları';
	} elseif ( 'hizmet' === $tur ) {
		$seo['baslik']   = $kayit['title'] . ' | ' . $site;
		$seo['aciklama'] = ! empty( $kayit['lead'] ) ? $kayit['lead'] : $aciklama;
		$seo['gorsel']   = ! empty( $kayit['features'][0]['image'] ) ? $kayit['features'][0]['image'] : '';
	} elseif ( 'yazi' === $tur ) {
		$seo['baslik']   = $kayit['title'] . ' | ' . $site;
		$seo['aciklama'] = ! empty( $kayit['excerpt'] ) ? $kayit['excerpt'] : $aciklama;
		$seo['gorsel']   = ! empty( $kayit['image'] ) ? $kayit['image'] : '';
		$seo['tur']      = 'article';
	} elseif ( isset( $adlar[ $tur ] ) ) {
		$seo['baslik'] = $adlar[ $tur ] . ' | ' . $site;
	}
	return $seo;
}

function crayn_sayfa_basligi( $baslik ) {
	$seo = crayn_seo();
	return $seo['baslik'] ? $seo['baslik'] : $baslik;
}
add_filter( 'pre_get_document_title', 'crayn_sayfa_basligi' );

// <head> içine: açıklama, asıl adres ve paylaşım kartı.
function crayn_seo_etiketleri() {
	$seo    = crayn_seo();
	$baslik = $seo['baslik'] ? $seo['baslik'] : wp_get_document_title();
	?>
	<meta name="description" content="<?php echo esc_attr( $seo['aciklama'] ); ?>" />
	<meta property="og:site_name" content="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" />
	<meta property="og:type" content="<?php echo esc_attr( $seo['tur'] ); ?>" />
	<meta property="og:title" content="<?php echo esc_attr( $baslik ); ?>" />
	<meta property="og:description" content="<?php echo esc_attr( $seo['aciklama'] ); ?>" />
	<meta property="og:url" content="<?php echo esc_url( $seo['adres'] ); ?>" />
	<meta name="twitter:card" content="<?php echo $seo['gorsel'] ? 'summary_large_image' : 'summary'; ?>" />
	<?php if ( $seo['gorsel'] ) : ?>
		<meta property="og:image" content="<?php echo esc_url( $seo['gorsel'] ); ?>" />
	<?php endif; ?>
	<?php if ( ! is_singular() ) : ?>
		<link rel="canonical" href="<?php echo esc_url( $seo['adres'] ); ?>" />
	<?php endif; ?>
	<?php
}

// Bir elemanın alanlarını düz yazıya çevirir: başlıklar başlık, gerisi paragraf.
function crayn_duz_alanlar( $alanlar, $degerler, $seviye ) {
	$html = '';
	foreach ( $alanlar as $ad => $alan ) {
		if ( ! isset( $degerler[ $ad ] ) || ! crayn_dolu( $degerler[ $ad ] ) ) {
			continue;
		}
		if ( in_array( $alan[1], array( 'gorsel', 'renk', 'secim' ), true ) || preg_match( '/(href|link|strong|contact)$/', $ad ) ) {
			continue;
		}
		$deger = $degerler[ $ad ];

		if ( 'grup' === $alan[1] ) {
			foreach ( ( is_array( $deger ) ? $deger : array() ) as $oge ) {
				if ( is_array( $oge ) ) {
					$html .= crayn_duz_alanlar( $alan[2], $oge, min( 6, $seviye + 1 ) );
				}
			}
			continue;
		}

		$metin = esc_html( str_replace( '|', ' ', (string) $deger ) );
		if ( in_array( $ad, array( 'heading', 'title' ), true ) ) {
			$bag   = isset( $degerler['href'] ) ? $degerler['href'] : ( isset( $degerler['link'] ) ? $degerler['link'] : '' );
			$metin = $bag ? '<a href="' . esc_url( crayn_adres( $bag ) ) . '">' . $metin . '</a>' : $metin;
			$html .= '<h' . $seviye . '>' . $metin . '</h' . $seviye . ">\n";
		} else {
			$html .= '<p>' . nl2br( $metin ) . "</p>\n";
		}
	}
	return $html;
}

// Bir sayfanın bölümleri düz yazı olarak. $bolumler boşsa $varsayilan türleri onaylı içerikle yazılır.
function crayn_duz_bolumler( $bolumler, $varsayilan ) {
	$tanimlar = array();
	foreach ( array_merge( crayn_bolum_tanimlari(), crayn_hakkimizda_tanimlari() ) as $tanim ) {
		$tanimlar[ $tanim[1] ] = $tanim[2];
	}
	if ( ! $bolumler ) {
		foreach ( $varsayilan as $tur ) {
			$bolumler[] = array(
				'type'  => $tur,
				'props' => array(),
			);
		}
	}

	$onayli = crayn_onayli_icerik();
	$html   = '';
	foreach ( $bolumler as $bolum ) {
		$tur = $bolum['type'];
		if ( ! isset( $tanimlar[ $tur ] ) ) {
			continue;
		}
		$degerler = array_merge( isset( $onayli[ $tur ] ) ? $onayli[ $tur ] : array(), array_filter( (array) $bolum['props'], 'crayn_dolu' ) );
		$html    .= '<section>' . crayn_duz_alanlar( $tanimlar[ $tur ], $degerler, in_array( $tur, array( 'hero', 'about_page' ), true ) ? 1 : 2 ) . "</section>\n";
		if ( 'blog' === $tur ) {
			$html .= crayn_duz_yazi_listesi( array_slice( crayn_tam_yazilar(), 0, 3 ) );
		} elseif ( 'services' === $tur ) {
			$html .= crayn_duz_hizmet_listesi( crayn_tam_hizmetler() );
		}
	}
	return $html;
}

function crayn_duz_yazi_listesi( $yazilar ) {
	$html = "<ul>\n";
	foreach ( $yazilar as $yazi ) {
		$html .= '<li><a href="' . esc_url( home_url( '/icerikler/' . $yazi['slug'] ) ) . '">' . esc_html( $yazi['title'] ) . '</a> ' . esc_html( isset( $yazi['excerpt'] ) ? $yazi['excerpt'] : '' ) . "</li>\n";
	}
	return $html . "</ul>\n";
}

function crayn_duz_hizmet_listesi( $hizmetler ) {
	$html = "<ul>\n";
	foreach ( $hizmetler as $hizmet ) {
		$html .= '<li><a href="' . esc_url( home_url( '/hizmetler/' . $hizmet['slug'] ) ) . '">' . esc_html( $hizmet['title'] ) . '</a> ' . esc_html( isset( $hizmet['lead'] ) ? $hizmet['lead'] : '' ) . "</li>\n";
	}
	return $html . "</ul>\n";
}

function crayn_duz_hizmet( $hizmet ) {
	$html  = '<h1>' . esc_html( $hizmet['title'] ) . "</h1>\n";
	$html .= '<p>' . esc_html( isset( $hizmet['lead'] ) ? $hizmet['lead'] : '' ) . "</p>\n";
	$html .= '<p>' . esc_html( isset( $hizmet['tags'] ) ? $hizmet['tags'] : '' ) . "</p>\n";
	foreach ( $hizmet['features'] as $sekme ) {
		$html .= '<h2>' . esc_html( isset( $sekme['title'] ) ? $sekme['title'] : '' ) . "</h2>\n";
		$html .= '<p>' . esc_html( isset( $sekme['summary'] ) ? $sekme['summary'] : '' ) . "</p>\n";
		$html .= '<h3>' . esc_html( isset( $sekme['heading'] ) ? $sekme['heading'] : '' ) . "</h3>\n<ul>\n";
		foreach ( preg_split( '/\r?\n/', isset( $sekme['points'] ) ? (string) $sekme['points'] : '' ) as $madde ) {
			if ( '' !== trim( $madde ) ) {
				$html .= '<li>' . esc_html( trim( $madde ) ) . "</li>\n";
			}
		}
		$html .= "</ul>\n";
	}

	$adimlar = $hizmet['steps'];
	$html   .= '<h2>' . esc_html( isset( $adimlar['heading'] ) ? $adimlar['heading'] : '' ) . "</h2>\n";
	$html   .= '<p>' . esc_html( isset( $adimlar['text'] ) ? $adimlar['text'] : '' ) . "</p>\n<ol>\n";
	foreach ( ( isset( $adimlar['items'] ) && is_array( $adimlar['items'] ) ? $adimlar['items'] : array() ) as $adim ) {
		$html .= '<li>' . esc_html( ( isset( $adim['title'] ) ? $adim['title'] : '' ) . ': ' . ( isset( $adim['text'] ) ? $adim['text'] : '' ) ) . "</li>\n";
	}
	$html .= "</ol>\n";

	$digerleri = array();
	foreach ( crayn_tam_hizmetler() as $diger ) {
		if ( $diger['slug'] !== $hizmet['slug'] ) {
			$digerleri[] = $diger;
		}
	}
	$html .= '<h2>' . esc_html( isset( $hizmet['others']['heading'] ) ? $hizmet['others']['heading'] : '' ) . "</h2>\n";
	return $html . crayn_duz_hizmet_listesi( $digerleri );
}

// Sayfadaki yazıların botlar için düz kopyası; #root içine basılır, uygulama açılınca silinir.
// Kopya yazılırken bir şey ters giderse sayfa onsuz açılır; site bundan etkilenmez.
function crayn_duz_icerik() {
	try {
		crayn_duz_icerik_yaz();
	} catch ( \Throwable $hata ) {
		crayn_hata_kaydet( 'Düz kopya', $hata );
	}
}

function crayn_duz_icerik_yaz() {
	list( $tur, $kayit ) = crayn_gorunum();
	$html                = '';

	if ( 'ana' === $tur ) {
		$bolumler = array();
		foreach ( crayn_sayfa_bolumleri() as $bolum ) {
			$bolumler[] = array(
				'type'  => $bolum['type'],
				'props' => (array) $bolum['props'],
			);
		}
		$html = crayn_duz_bolumler( $bolumler, array( 'hero', 'diagnostic', 'services', 'solutions', 'references', 'about', 'blog', 'cta' ) );
	} elseif ( 'hakkimizda' === $tur ) {
		$bolumler = array();
		foreach ( crayn_sayfa_bolumleri() as $bolum ) {
			$bolumler[] = array(
				'type'  => $bolum['type'],
				'props' => (array) $bolum['props'],
			);
		}
		$html = crayn_duz_bolumler( $bolumler, array( 'about_page' ) );
	} elseif ( 'hizmetler' === $tur ) {
		$html = "<h1>Hizmetler</h1>\n" . crayn_duz_hizmet_listesi( crayn_tam_hizmetler() );
	} elseif ( 'hizmet' === $tur ) {
		$html = crayn_duz_hizmet( $kayit );
	} elseif ( 'icerikler' === $tur ) {
		$html = "<h1>İçerikler</h1>\n" . crayn_duz_yazi_listesi( crayn_tam_yazilar() );
	} elseif ( 'yazi' === $tur ) {
		$html  = '<article><h1>' . esc_html( $kayit['title'] ) . "</h1>\n";
		$html .= '<p>' . esc_html( ( isset( $kayit['category'] ) ? $kayit['category'] : '' ) . ' · ' . ( isset( $kayit['dateLabel'] ) ? $kayit['dateLabel'] : '' ) ) . "</p>\n";
		$html .= '<p>' . esc_html( isset( $kayit['excerpt'] ) ? $kayit['excerpt'] : '' ) . "</p>\n";
		$html .= ( isset( $kayit['bodyHtml'] ) ? wp_kses_post( $kayit['bodyHtml'] ) : '' ) . "</article>\n";
	} elseif ( 'talep' === $tur ) {
		$seo  = crayn_seo();
		$html = "<h1>Talep Formu</h1>\n<p>" . esc_html( $seo['aciklama'] ) . "</p>\n";
	} elseif ( 'yok' === $tur ) {
		$html = "<h1>Sayfa bulunamadı</h1>\n";
	}

	$menu = crayn_menu_ogeleri( 'ana-menu' );
	if ( ! $menu ) {
		$menu = array(
			array( 'label' => 'Ana Sayfa', 'href' => home_url( '/' ) ),
			array( 'label' => 'Hakkımızda', 'href' => home_url( '/hakkimizda' ) ),
			array( 'label' => 'Hizmetler', 'href' => home_url( '/hizmetler' ) ),
			array( 'label' => 'İçerikler', 'href' => home_url( '/icerikler' ) ),
			array( 'label' => 'İletişim', 'href' => home_url( '/talep' ) ),
		);
	}
	$gezinme = '<nav>';
	foreach ( $menu as $oge ) {
		$gezinme .= '<a href="' . esc_url( $oge['href'] ) . '">' . esc_html( $oge['label'] ) . '</a> ';
	}
	$gezinme .= '</nav>';

	// Ekranda görünmez: uygulama açılana kadar geçen kısa sürede biçimsiz yazı parlamasın.
	echo '<div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">' . $gezinme . "\n" . $html . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- parçalar yukarıda tek tek kaçırıldı.
}
