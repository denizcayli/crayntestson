<?php
/**
 * Hizmetler ve yazılar: panelde girilenleri uygulamaya verir. Onaylı içeriğin panele ilk
 * aktarımı aktarim.php'dedir.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function crayn_icerik_turleri() {
	register_post_type(
		'crayn_hizmet',
		array(
			'labels'       => array(
				'name'          => 'Hizmetler',
				'singular_name' => 'Hizmet',
				'add_new_item'  => 'Yeni hizmet ekle',
				'edit_item'     => 'Hizmeti düzenle',
				'all_items'     => 'Tüm hizmetler',
			),
			'public'       => true,
			'show_in_rest' => false,
			'menu_icon'    => 'dashicons-screenoptions',
			'supports'     => array( 'title', 'editor', 'page-attributes' ),
			'rewrite'      => array(
				'slug'       => 'hizmetler',
				'with_front' => false,
			),
		)
	);
}
add_action( 'init', 'crayn_icerik_turleri' );

// WPBakery, hizmet sayfalarında da açılsın.
function crayn_vc_icerik_turleri() {
	if ( function_exists( 'vc_set_default_editor_post_types' ) ) {
		vc_set_default_editor_post_types( array( 'page', 'crayn_hizmet' ) );
	}
}
add_action( 'vc_before_init', 'crayn_vc_icerik_turleri' );

// Role Manager'daki seçim ne olursa olsun WPBakery hizmet sayfalarını düzenleyebilsin.
function crayn_vc_hizmet_gecerli( $gecerli, $tur ) {
	return 'crayn_hizmet' === $tur ? true : $gecerli;
}
add_filter( 'vc_check_post_type_validation', 'crayn_vc_hizmet_gecerli', 10, 2 );

// Paneldeki hizmetler, sıra numarasına göre; her biri kendi sayfasındaki elemanlardan okunur.
function crayn_hizmetler() {
	static $bellek = null;
	if ( null !== $bellek ) {
		return $bellek;
	}
	$kayitlar = get_posts(
		array(
			'post_type'   => 'crayn_hizmet',
			'post_status' => 'publish',
			'numberposts' => 50,
			'orderby'     => array(
				'menu_order' => 'ASC',
				'date'       => 'ASC',
			),
		)
	);

	$hizmetler = array();
	foreach ( $kayitlar as $kayit ) {
		$hizmet = array(
			'slug'  => $kayit->post_name,
			'title' => wp_specialchars_decode( $kayit->post_title, ENT_QUOTES ),
		);
		foreach ( crayn_icerik_bolumleri( $kayit->post_content, crayn_hizmet_tanimlari() ) as $bolum ) {
			if ( 'service' === $bolum['type'] ) {
				$hizmet = array_merge( $bolum['props'], $hizmet );
			} elseif ( 'service_steps' === $bolum['type'] ) {
				$hizmet['steps'] = (object) $bolum['props'];
			} else {
				$hizmet['others'] = (object) $bolum['props'];
			}
		}
		$hizmetler[] = $hizmet;
	}
	$bellek = $hizmetler;
	return $bellek;
}

// Yayındaki yazılar, yeniden eskiye. Açılan yazının gövdesi de eklenir.
function crayn_yazilar() {
	static $bellek = null;
	if ( null !== $bellek ) {
		return $bellek;
	}
	$acilan   = 'icerikler' === get_query_var( 'crayn_rota' ) ? (string) get_query_var( 'crayn_alt' ) : '';
	$kayitlar = get_posts(
		array(
			'post_type'   => 'post',
			'post_status' => 'publish',
			'numberposts' => 60,
		)
	);

	$yazilar = array();
	foreach ( $kayitlar as $kayit ) {
		$kategoriler = get_the_category( $kayit->ID );
		$gorsel      = get_the_post_thumbnail_url( $kayit->ID, 'large' );
		if ( ! $gorsel ) {
			$gorsel = (string) get_post_meta( $kayit->ID, 'crayn_gorsel_adresi', true );
			// Onaylı yazılar ilk aktarıldığında görselleri dış bir adresten geliyordu; artık temanın
			// içindeler ve görseli boş olan onaylı yazıda uygulama oradakini kullanır.
			if ( false !== strpos( $gorsel, 'images.unsplash.com' ) && crayn_onayli_yazi( $kayit->post_name ) ) {
				$gorsel = '';
			}
		}
		$sure = (string) get_post_meta( $kayit->ID, 'crayn_okuma_suresi', true );
		if ( ! $sure ) {
			$kelime = count( preg_split( '/\s+/u', trim( wp_strip_all_tags( $kayit->post_content ) ) ) );
			$sure   = max( 1, (int) ceil( $kelime / 200 ) ) . ' dk okuma';
		}
		$ozet = $kayit->post_excerpt ? $kayit->post_excerpt : wp_trim_words( wp_strip_all_tags( strip_shortcodes( $kayit->post_content ) ), 30 );

		$yazi = array(
			'slug'      => $kayit->post_name,
			'title'     => wp_specialchars_decode( $kayit->post_title, ENT_QUOTES ),
			'category'  => $kategoriler ? wp_specialchars_decode( $kategoriler[0]->name, ENT_QUOTES ) : '',
			'date'      => mysql2date( 'Y-m-d', $kayit->post_date ),
			'dateLabel' => mysql2date( 'j M Y', $kayit->post_date ),
			'readTime'  => $sure,
			'image'     => $gorsel,
			'excerpt'   => wp_specialchars_decode( $ozet, ENT_QUOTES ),
		);
		if ( $acilan && $acilan === $kayit->post_name ) {
			$yazi['bodyHtml'] = apply_filters( 'the_content', $kayit->post_content );
		}
		$yazilar[] = $yazi;
	}
	$bellek = $yazilar;
	return $bellek;
}

// Verilen adresteki onaylı yazı; yoksa null.
function crayn_onayli_yazi( $adres ) {
	foreach ( crayn_veri_dosyasi( 'posts' ) as $yazi ) {
		if ( isset( $yazi['slug'] ) && $yazi['slug'] === $adres ) {
			return $yazi;
		}
	}
	return null;
}

// Temanın içindeki bir görselin ( /assets/photos/… ) tam adresi; başka adresler olduğu gibi kalır.
function crayn_gorsel_tam( $adres ) {
	$adres = (string) $adres;
	return 0 === strpos( $adres, '/assets/' ) ? get_template_directory_uri() . '/app' . $adres : $adres;
}

// Yazı düzenleme ekranındaki ek alanlar.
function crayn_yazi_kutusu() {
	add_meta_box( 'crayn-yazi', 'Crayn — yazı ayrıntıları', 'crayn_yazi_kutusu_icerik', 'post', 'side' );
}
add_action( 'add_meta_boxes', 'crayn_yazi_kutusu' );

function crayn_yazi_kutusu_icerik( $yazi ) {
	wp_nonce_field( 'crayn_yazi', 'crayn_yazi_nonce' );
	?>
	<p>
		<label for="crayn-gorsel-adresi">Görsel adresi</label>
		<input type="url" id="crayn-gorsel-adresi" name="crayn_gorsel_adresi" class="widefat" value="<?php echo esc_attr( get_post_meta( $yazi->ID, 'crayn_gorsel_adresi', true ) ); ?>" />
		<span class="description">Öne çıkan görsel seçilirse o kullanılır. İkisi de boşsa, onaylı yazılarda temadaki görsel gösterilir.</span>
	</p>
	<p>
		<label for="crayn-okuma-suresi">Okuma süresi</label>
		<input type="text" id="crayn-okuma-suresi" name="crayn_okuma_suresi" class="widefat" placeholder="5 dk okuma" value="<?php echo esc_attr( get_post_meta( $yazi->ID, 'crayn_okuma_suresi', true ) ); ?>" />
		<span class="description">Boş bırakılırsa metnin uzunluğundan hesaplanır.</span>
	</p>
	<?php
}

function crayn_yazi_kutusu_kaydet( $yazi_id ) {
	if ( ! isset( $_POST['crayn_yazi_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['crayn_yazi_nonce'] ), 'crayn_yazi' ) ) {
		return;
	}
	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $yazi_id ) ) {
		return;
	}
	if ( isset( $_POST['crayn_gorsel_adresi'] ) ) {
		update_post_meta( $yazi_id, 'crayn_gorsel_adresi', esc_url_raw( wp_unslash( $_POST['crayn_gorsel_adresi'] ) ) );
	}
	if ( isset( $_POST['crayn_okuma_suresi'] ) ) {
		update_post_meta( $yazi_id, 'crayn_okuma_suresi', sanitize_text_field( wp_unslash( $_POST['crayn_okuma_suresi'] ) ) );
	}
}
add_action( 'save_post_post', 'crayn_yazi_kutusu_kaydet' );
