<?php
/**
 * Talepler: sitedeki talep formundan ve görüşme kartından gelen başvurular. Her biri panelde
 * "Talepler" altında saklanır ve Tema Ayarları'ndaki adrese e-postayla bildirilir.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function crayn_talep_turu() {
	register_post_type(
		'crayn_talep',
		array(
			'labels'       => array(
				'name'          => 'Talepler',
				'singular_name' => 'Talep',
				'edit_item'     => 'Talep',
				'all_items'     => 'Tüm talepler',
				'not_found'     => 'Henüz talep yok.',
			),
			'public'       => false,
			'show_ui'      => true,
			'menu_icon'    => 'dashicons-email-alt',
			'supports'     => array( 'title' ),
			'capabilities' => array( 'create_posts' => 'do_not_allow' ),
			'map_meta_cap' => true,
		)
	);
}
add_action( 'init', 'crayn_talep_turu' );

// Formlardaki alan adlarının panelde ve e-postada görünen karşılıkları.
function crayn_talep_etiketleri() {
	$etiketler = array(
		'ad_soyad'  => 'Ad soyad',
		'name'      => 'Ad soyad',
		'eposta'    => 'E-posta',
		'email'     => 'E-posta',
		'telefon'   => 'Telefon',
		'phone'     => 'Telefon',
		'firma'     => 'Şirket',
		'company'   => 'Şirket',
		'website'   => 'Web sitesi',
		'sektor'    => 'Sektör',
		'business'  => 'Ne iş yapıyor',
		'olcek'     => 'Şirket ölçeği',
		'team'      => 'Ekip büyüklüğü',
		'hizmet'    => 'İlgilendiği hizmet',
		'service'   => 'İlgilendiği hizmet',
		'butce'     => 'Bütçe',
		'zaman'     => 'Zamanlama',
		'aciklama'  => 'Açıklama',
		'note'      => 'Not',
		'kvkk_onay' => 'KVKK onayı',
	);
	// Talep formuna panelden eklenen sorular: cevapları ek_1, ek_2… adıyla gelir.
	$icerik = crayn_talep_icerigi();
	foreach ( $icerik[2] as $sira => $soru ) {
		if ( ! empty( $soru['label'] ) ) {
			$etiketler[ 'ek_' . ( $sira + 1 ) ] = $soru['label'];
		}
	}
	return $etiketler;
}

// Bir hatayı Tema Ayarları ekranında görülebilsin diye saklar.
function crayn_hata_kaydet( $nerede, $hata ) {
	update_option( 'crayn_son_hata', wp_date( 'j M Y H:i' ) . ' — ' . $nerede . ': ' . $hata->getMessage() . ' (' . basename( $hata->getFile() ) . ':' . $hata->getLine() . ')', false );
}

function crayn_talep_al() {
	try {
		crayn_talep_kaydet();
	} catch ( \Throwable $hata ) {
		crayn_hata_kaydet( 'Talep kaydı', $hata );
		wp_send_json_error( null, 500 );
	}
}

function crayn_talep_kaydet() {
	// Aynı adresten kısa sürede gelen çok sayıda başvuru kabul edilmez. Sınır geniş tutulur:
	// sunucu ziyaretçilerin hepsini aynı adresten geliyormuş gibi gösterebiliyor.
	$adres    = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$anahtar  = 'crayn_talep_sayisi_' . md5( $adres );
	$gonderim = (int) get_transient( $anahtar );
	if ( $gonderim >= 30 ) {
		wp_send_json_error( null, 429 );
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Missing -- herkese açık form; oturumsuz ziyaretçide nonce koruma sağlamaz.
	$gelen   = isset( $_POST['alan'] ) && is_array( $_POST['alan'] ) ? wp_unslash( $_POST['alan'] ) : array();
	$alanlar = array();
	foreach ( array_slice( $gelen, 0, 30, true ) as $ad => $deger ) {
		$ad    = sanitize_key( $ad );
		$deger = is_scalar( $deger ) ? sanitize_textarea_field( (string) $deger ) : '';
		$deger = function_exists( 'mb_substr' ) ? mb_substr( $deger, 0, 2000 ) : substr( $deger, 0, 6000 );
		if ( $ad && '' !== $deger ) {
			$alanlar[ $ad ] = $deger;
		}
	}
	if ( ! $alanlar ) {
		wp_send_json_error( null, 400 );
	}

	// Geçerli bir e-posta adresi olmayan başvuru alınmaz: iki formda da zorunlu alandır.
	$eposta = isset( $alanlar['eposta'] ) ? $alanlar['eposta'] : ( isset( $alanlar['email'] ) ? $alanlar['email'] : '' );
	if ( ! is_email( $eposta ) ) {
		wp_send_json_error( null, 400 );
	}

	// Sayfa açıldıktan birkaç saniye içinde gelen başvuruyu bir insan doldurmuş olamaz. Bota
	// başarılı yanıtı verilir ki yöntemini değiştirmesin; kayıt açılmaz.
	// phpcs:ignore WordPress.Security.NonceVerification.Missing
	$sure = isset( $_POST['sure'] ) ? (int) $_POST['sure'] : 0;
	if ( $sure < 3 ) {
		wp_send_json_success();
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Missing
	$kaynak = isset( $_POST['kaynak'] ) ? sanitize_text_field( wp_unslash( $_POST['kaynak'] ) ) : '';
	// phpcs:ignore WordPress.Security.NonceVerification.Missing
	$sayfa = isset( $_POST['sayfa'] ) ? esc_url_raw( wp_unslash( $_POST['sayfa'] ) ) : '';

	$kimden = '';
	foreach ( array( 'ad_soyad', 'name', 'firma', 'company', 'eposta', 'email' ) as $ad ) {
		if ( ! empty( $alanlar[ $ad ] ) ) {
			$kimden = $alanlar[ $ad ];
			break;
		}
	}

	$kayit = wp_insert_post(
		array(
			'post_type'   => 'crayn_talep',
			'post_status' => 'private',
			'post_title'  => wp_slash( ( $kimden ? $kimden : 'Talep' ) . ' — ' . wp_date( 'j M Y H:i' ) ),
		)
	);
	if ( ! $kayit || is_wp_error( $kayit ) ) {
		wp_send_json_error( null, 500 );
	}
	update_post_meta( $kayit, 'crayn_alanlar', wp_slash( $alanlar ) );
	update_post_meta( $kayit, 'crayn_kaynak', wp_slash( $kaynak ) );
	update_post_meta( $kayit, 'crayn_sayfa', $sayfa );
	set_transient( $anahtar, $gonderim + 1, 10 * MINUTE_IN_SECONDS );

	$etiketler = crayn_talep_etiketleri();
	$satirlar  = array( 'Kaynak: ' . $kaynak, 'Sayfa: ' . $sayfa, '' );
	foreach ( $alanlar as $ad => $deger ) {
		$satirlar[] = ( isset( $etiketler[ $ad ] ) ? $etiketler[ $ad ] : $ad ) . ': ' . $deger;
	}
	$satirlar[] = '';
	$satirlar[] = 'Panelde: ' . admin_url( 'post.php?post=' . $kayit . '&action=edit' );

	// Talep kaydedildi; e-posta gönderilemese de ziyaretçi için başvuru alınmıştır. Sunucuda
	// e-posta gönderimi kapalıysa wp_mail hata fırlatabilir.
	$alici = crayn_ayar( 'bildirim_eposta' );
	try {
		$gitti = wp_mail( $alici ? $alici : get_option( 'admin_email' ), 'Yeni talep: ' . ( $kimden ? $kimden : $kaynak ), implode( "\n", $satirlar ) );
		update_post_meta( $kayit, 'crayn_eposta', $gitti ? 'Gönderildi' : 'Gönderilemedi' );
	} catch ( \Throwable $hata ) {
		crayn_hata_kaydet( 'Talep e-postası', $hata );
		update_post_meta( $kayit, 'crayn_eposta', 'Gönderilemedi' );
	}

	wp_send_json_success();
}
add_action( 'wp_ajax_crayn_talep', 'crayn_talep_al' );
add_action( 'wp_ajax_nopriv_crayn_talep', 'crayn_talep_al' );

// Talebin panelde açılan ekranı: verilen cevaplar.
function crayn_talep_kutusu() {
	add_meta_box( 'crayn-talep', 'Talep', 'crayn_talep_kutusu_icerik', 'crayn_talep', 'normal', 'high' );
}
add_action( 'add_meta_boxes', 'crayn_talep_kutusu' );

function crayn_talep_kutusu_icerik( $talep ) {
	$etiketler = crayn_talep_etiketleri();
	$alanlar   = get_post_meta( $talep->ID, 'crayn_alanlar', true );
	?>
	<table class="widefat striped">
		<tbody>
			<tr>
				<th scope="row" style="width:200px">Kaynak</th>
				<td><?php echo esc_html( get_post_meta( $talep->ID, 'crayn_kaynak', true ) ); ?></td>
			</tr>
			<tr>
				<th scope="row">Bildirim e-postası</th>
				<td><?php echo esc_html( get_post_meta( $talep->ID, 'crayn_eposta', true ) ); ?></td>
			</tr>
			<tr>
				<th scope="row">Gönderildiği sayfa</th>
				<td><?php echo esc_html( get_post_meta( $talep->ID, 'crayn_sayfa', true ) ); ?></td>
			</tr>
			<?php foreach ( ( is_array( $alanlar ) ? $alanlar : array() ) as $ad => $deger ) : ?>
				<tr>
					<th scope="row"><?php echo esc_html( isset( $etiketler[ $ad ] ) ? $etiketler[ $ad ] : $ad ); ?></th>
					<td><?php echo nl2br( esc_html( $deger ) ); ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
	<?php
}
