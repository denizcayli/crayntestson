<?php
/**
 * Görünüm → Tema Ayarları: sitenin her yerinde geçen bilgiler. Boş bırakılan alan için
 * kutuda soluk yazan onaylı değer kullanılır.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Alan => [ etiket, tür, onaylı değer ]. Tür: text, textarea, url ya da gorsel (ortam kütüphanesinden seçilir).
function crayn_ayar_alanlari() {
	return array(
		'baslik'       => array( 'Ana sayfa sekme başlığı', 'text', 'Crayn AI | Şirketlere Özel Üretken Yapay Zeka Yazılımları' ),
		'aciklama'     => array( 'Arama motoru açıklaması', 'textarea', "Crayn AI, modern işletmeler için özel AI agent'lar, otomasyon sistemleri ve ölçeklenebilir üretken yapay zeka yazılımları geliştiren yerli bir yazılım şirketidir." ),
		'logo_simge'   => array( 'Logo: simge', 'gorsel', 'Kare, saydam zeminli PNG. Tarayıcı sekmesindeki simge de budur. Boşsa onaylı simge kullanılır.' ),
		'logo_yazi'    => array( 'Logo: yazı', 'gorsel', 'Saydam zemin üzerine BEYAZ yazı olmalı; açık renkli bölümlerde site onu kendisi siyaha çevirir. Boşsa onaylı yazı kullanılır.' ),
		'email'        => array( 'E-posta', 'text', 'hello@crayn.ai' ),
		'telefon'      => array( 'Telefon', 'text', '0544 240 71 99' ),
		'bildirim_eposta' => array( 'Taleplerin bildirileceği e-posta', 'text', 'Boş bırakılırsa sitenin yönetici e-postası' ),
		'adres'        => array( 'Adres', 'text', 'Bilişim Vadisi, Teknoloji Geliştirme Bölgesi, Kocaeli / Türkiye' ),
		'instagram'    => array( 'Instagram adresi', 'url', '' ),
		'x'            => array( 'X (Twitter) adresi', 'url', '' ),
		'linkedin'     => array( 'LinkedIn adresi', 'url', '' ),
		'footer_metin' => array( 'Footer tanıtım metni', 'textarea', "Şirketlere özel AI agent'lar, otomasyon sistemleri ve üretken yapay zeka yazılımları geliştiriyoruz." ),
		'telif'        => array( 'Footer telif satırı', 'text', '© 2026 Crayn AI. Tüm hakları saklıdır.' ),
		'footer_not'   => array( 'Footer sağ alt satır', 'text', 'Bilişim Vadisi, Kocaeli · Yerli Yazılım Şirketi' ),
		'menu_not'     => array( 'Menü alt satırı', 'text', '© 2026 Crayn AI' ),
	);
}

function crayn_ayar( $anahtar ) {
	$ayarlar = get_option( 'crayn_ayar', array() );
	return isset( $ayarlar[ $anahtar ] ) ? $ayarlar[ $anahtar ] : '';
}

function crayn_ayar_temizle( $girdi ) {
	$temiz = array();
	foreach ( crayn_ayar_alanlari() as $anahtar => $alan ) {
		$deger = isset( $girdi[ $anahtar ] ) ? $girdi[ $anahtar ] : '';
		if ( 'url' === $alan[1] || 'gorsel' === $alan[1] ) {
			$temiz[ $anahtar ] = esc_url_raw( trim( $deger ) );
		} elseif ( 'textarea' === $alan[1] ) {
			$temiz[ $anahtar ] = sanitize_textarea_field( $deger );
		} else {
			$temiz[ $anahtar ] = sanitize_text_field( $deger );
		}
	}
	return $temiz;
}

function crayn_ayar_kaydet() {
	register_setting( 'crayn_ayar_grubu', 'crayn_ayar', array( 'sanitize_callback' => 'crayn_ayar_temizle' ) );
}
add_action( 'admin_init', 'crayn_ayar_kaydet' );

function crayn_ayar_menusu() {
	add_theme_page( 'Tema Ayarları', 'Tema Ayarları', 'manage_options', 'crayn-ayarlar', 'crayn_ayar_sayfasi' );
}
add_action( 'admin_menu', 'crayn_ayar_menusu' );

function crayn_ayar_sayfasi() {
	?>
	<div class="wrap">
		<h1>Tema Ayarları</h1>
		<p>Boş bırakılan alanlarda kutuda soluk yazan onaylı değer kullanılır.</p>
		<?php if ( get_option( 'crayn_son_hata' ) ) : ?>
			<div class="notice notice-warning inline"><p><strong>Son hata:</strong> <?php echo esc_html( get_option( 'crayn_son_hata' ) ); ?></p></div>
		<?php endif; ?>
		<form method="post" action="options.php">
			<?php settings_fields( 'crayn_ayar_grubu' ); ?>
			<table class="form-table" role="presentation">
				<?php foreach ( crayn_ayar_alanlari() as $anahtar => $alan ) : ?>
					<tr>
						<th scope="row"><label for="crayn-<?php echo esc_attr( $anahtar ); ?>"><?php echo esc_html( $alan[0] ); ?></label></th>
						<td>
							<?php if ( 'gorsel' === $alan[1] ) : ?>
								<input type="url" id="crayn-<?php echo esc_attr( $anahtar ); ?>" name="crayn_ayar[<?php echo esc_attr( $anahtar ); ?>]" value="<?php echo esc_attr( crayn_ayar( $anahtar ) ); ?>" class="regular-text" />
								<button type="button" class="button crayn-gorsel-sec" data-hedef="crayn-<?php echo esc_attr( $anahtar ); ?>">Görsel seç</button>
								<p class="description"><?php echo esc_html( $alan[2] ); ?></p>
							<?php elseif ( 'textarea' === $alan[1] ) : ?>
								<textarea id="crayn-<?php echo esc_attr( $anahtar ); ?>" name="crayn_ayar[<?php echo esc_attr( $anahtar ); ?>]" rows="3" class="large-text" placeholder="<?php echo esc_attr( $alan[2] ); ?>"><?php echo esc_textarea( crayn_ayar( $anahtar ) ); ?></textarea>
							<?php else : ?>
								<input type="<?php echo 'url' === $alan[1] ? 'url' : 'text'; ?>" id="crayn-<?php echo esc_attr( $anahtar ); ?>" name="crayn_ayar[<?php echo esc_attr( $anahtar ); ?>]" value="<?php echo esc_attr( crayn_ayar( $anahtar ) ); ?>" class="regular-text" placeholder="<?php echo esc_attr( $alan[2] ); ?>" />
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<script>
	document.querySelectorAll( '.crayn-gorsel-sec' ).forEach( function ( dugme ) {
		dugme.addEventListener( 'click', function () {
			var secici = wp.media( { title: 'Görsel seç', multiple: false, library: { type: 'image' } } );
			secici.on( 'select', function () {
				document.getElementById( dugme.dataset.hedef ).value = secici.state().get( 'selection' ).first().toJSON().url;
			} );
			secici.open();
		} );
	} );
	</script>
	<?php
}

// Ayar sayfasında ortam kütüphanesinin seçicisi kullanılır.
function crayn_ayar_dosyalari( $sayfa ) {
	if ( 'appearance_page_crayn-ayarlar' === $sayfa ) {
		wp_enqueue_media();
	}
}
add_action( 'admin_enqueue_scripts', 'crayn_ayar_dosyalari' );
