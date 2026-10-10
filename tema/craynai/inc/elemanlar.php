<?php
/**
 * WPBakery elemanlarının tanımları: hangi eleman, uygulamadaki hangi bölüm, hangi alanlar.
 * Yeni bir alan ya da eleman buraya eklenir; panele bağlanması ve okunması bolumler.php'dedir.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Kısa kod => [ panelde görünen ad, uygulamadaki bölüm, alanlar ].
 * Alan => [ etiket, tür, açıklama, sekme (isteğe bağlı) ]; tür: metin, uzun, renk, gorsel, secim ya da grup. Üçüncü
 * değer grupta her satırın alanları, secimde seçeneklerdir.
 */
function crayn_bolum_tanimlari() {
	$satir   = 'Satır kırmak için | kullanın.';
	$baglanti = 'Site içi adres / ile başlar (ör. /talep); dış adres tam yazılır.';

	return array(
		'crayn_hero'        => array(
			'Hero',
			'hero',
			array(
				'heading'         => array( 'Başlık', 'metin', $satir ),
				'strong'          => array( 'Kalın yazılan kelimeler', 'metin', 'Başlıktaki kelimeler, virgülle ayrılmış.' ),
				'kicker'          => array( 'Tanıtım metni', 'uzun', '' ),
				'primary_label'   => array( '1. düğme yazısı', 'metin', '' ),
				'primary_href'    => array( '1. düğme adresi', 'metin', $baglanti ),
				'secondary_label' => array( '2. düğme yazısı', 'metin', '' ),
				'secondary_href'  => array( '2. düğme adresi', 'metin', $baglanti ),
			),
		),
		'crayn_teshis'      => array(
			'Sistem Nerede Devreye Girer',
			'diagnostic',
			array(
				'heading' => array( 'Başlık', 'metin', $satir ),
				'text'    => array( 'Açıklama', 'uzun', '' ),
				'items'   => array(
					'Kartlar',
					'grup',
					array(
						'label' => array( 'Etiket', 'metin', '' ),
						'title' => array( 'Başlık', 'metin', '' ),
						'text'  => array( 'Metin', 'uzun', '' ),
						'image' => array( 'Görsel', 'gorsel', '' ),
					),
				),
			),
		),
		'crayn_hizmetler'   => array(
			'Hizmetler',
			'services',
			array(
				'heading' => array( 'Başlık', 'metin', 'Kartlar "Hizmetler" bölümündeki kayıtlardan, oradaki sırayla gelir.' ),
				'text'    => array( 'Açıklama', 'uzun', '' ),
			),
		),
		'crayn_cozumler'    => array(
			'Neler Yapıyoruz',
			'solutions',
			array(
				'heading' => array( 'Başlık', 'metin', '' ),
				'text'    => array( 'Açıklama', 'uzun', '' ),
				'items'   => array(
					'Kartlar',
					'grup',
					array(
						'title' => array( 'Başlık', 'metin', '' ),
						'text'  => array( 'Metin', 'uzun', '' ),
						'image' => array( 'Görsel', 'gorsel', '' ),
					),
				),
			),
		),
		'crayn_referanslar' => array(
			'Referanslar',
			'references',
			array(
				'heading'      => array( 'Başlık', 'metin', '' ),
				'text'         => array( 'Açıklama', 'uzun', '' ),
				'card_brand'   => array( 'Koyu kart: marka', 'metin', '' ),
				'card_title'   => array( 'Koyu kart: başlık', 'metin', '' ),
				'card_caption' => array( 'Koyu kart: yıldızların altı', 'metin', '' ),
				'items'        => array(
					'Yorumlar',
					'grup',
					array(
						'text'  => array( 'Yorum', 'uzun', '' ),
						'name'  => array( 'Ad soyad', 'metin', '' ),
						'role'  => array( 'Görev, şirket', 'metin', '' ),
						'image' => array( 'Fotoğraf', 'gorsel', '' ),
					),
				),
			),
		),
		'crayn_hakkinda'    => array(
			'Hakkında',
			'about',
			array(
				'slogans' => array(
					'Sırayla yazılan sloganlar',
					'grup',
					array(
						'text' => array( 'Slogan', 'metin', $satir ),
					),
				),
				'text_1'  => array( '1. paragraf', 'uzun', '' ),
				'text_2'  => array( '2. paragraf', 'uzun', '' ),
				'items'   => array(
					'Kutular',
					'grup',
					array(
						'title' => array( 'Başlık', 'metin', '' ),
						'text'  => array( 'Metin', 'uzun', '' ),
					),
				),
			),
		),
		'crayn_icerikler'   => array(
			'İçerikler',
			'blog',
			array(
				'heading'      => array( 'Başlık', 'metin', '' ),
				'text'         => array( 'Açıklama', 'uzun', '' ),
				'button_label' => array( 'Düğme yazısı', 'metin', '' ),
				'button_href'  => array( 'Düğme adresi', 'metin', $baglanti ),
			),
		),
		'crayn_sss'         => array(
			'Sıkça Sorulan Sorular',
			'cta',
			array(
				'heading' => array( 'Başlık', 'metin', '' ),
				'typed'   => array( 'Yazılan satır', 'metin', '' ),
				'items'   => array(
					'Sorular',
					'grup',
					array(
						'title' => array( 'Soru', 'metin', '' ),
						'text'  => array( 'Cevap', 'uzun', '' ),
					),
				),
				'note'    => array( 'Alt satır (e-postadan önce)', 'metin', '' ),
			),
		),
	);
}

// Hizmet sayfasının elemanları; "Hizmetler" içerik türündeki sayfalara konur.
function crayn_hizmet_tanimlari() {
	$simgeler = array( 'layout', 'window', 'server', 'search', 'target', 'chart', 'spark', 'video', 'pen', 'users', 'image', 'megaphone', 'bot', 'link', 'flow', 'code', 'monitor', 'database' );

	return array(
		'crayn_hizmet'       => array(
			'Hizmet',
			'service',
			array(
				'label'        => array( 'Etiket', 'metin', 'Başlığın üstündeki küçük yazı.' ),
				'lead'         => array( 'Tanıtım metni', 'uzun', '' ),
				'tags'         => array( 'Etiketler', 'metin', 'Virgülle ayırın.' ),
				'button_label' => array( 'Düğme yazısı', 'metin', '' ),
				'card_image'   => array( 'Ana sayfa kartı: görsel', 'gorsel', '' ),
				'card_color'   => array( 'Ana sayfa kartı: renk', 'renk', '' ),
				'eyebrow'      => array( 'Sekmeler: üst yazı', 'metin', '' ),
				'tabs_heading' => array( 'Sekmeler: başlık', 'metin', 'Boş bırakılırsa "… kapsamında neler yapıyoruz?" yazılır.' ),
				'tabs_text'    => array( 'Sekmeler: açıklama', 'uzun', '' ),
				'features'     => array(
					'Sekmeler',
					'grup',
					array(
						'title'   => array( 'Sekme adı', 'metin', '' ),
						'icon'    => array( 'Simge', 'secim', $simgeler ),
						'summary' => array( 'Sekmenin altındaki satır', 'metin', '' ),
						'heading' => array( 'Açılan panelin başlığı', 'metin', '' ),
						'points'  => array( 'Maddeler', 'uzun', 'Her satıra bir madde.' ),
						'image'   => array( 'Görsel', 'gorsel', '' ),
					),
				),
			),
		),
		'crayn_hizmet_surec' => array(
			'Hizmet: Süreç',
			'service_steps',
			array(
				'heading' => array( 'Başlık', 'metin', '' ),
				'eyebrow' => array( 'Üst yazı', 'metin', '' ),
				'text'    => array( 'Açıklama', 'uzun', '' ),
				'items'   => array(
					'Adımlar',
					'grup',
					array(
						'title' => array( 'Adım', 'metin', '' ),
						'text'  => array( 'Metin', 'uzun', '' ),
					),
				),
			),
		),
		'crayn_hizmet_diger' => array(
			'Hizmet: Diğer hizmetler',
			'service_others',
			array(
				'heading' => array( 'Başlık', 'metin', '' ),
				'text'    => array( 'Açıklama', 'uzun', '' ),
			),
		),
	);
}

// Hakkımızda sayfasının elemanı.
function crayn_hakkimizda_tanimlari() {
	return array(
		'crayn_hakkimizda' => array(
			'Hakkımızda sayfası',
			'about_page',
			array(
				'heading' => array( 'Sayfa başlığı', 'metin', 'Ekranda görünmez; arama motorları ve ekran okuyucular içindir.' ),
				'items'   => array(
					'Kartlar',
					'grup',
					array(
						'title'      => array( 'Başlık', 'metin', '' ),
						'text'       => array( 'Metin', 'uzun', 'Her satır ayrı bir paragraf olur.' ),
						'image'      => array( 'Görsel', 'gorsel', '' ),
						'contact'    => array(
							'İletişim bilgileri eklensin mi',
							'secim',
							array(
								'Hayır' => '',
								'Evet'  => 'evet',
							),
						),
						'link'       => array( 'Bağlantı adresi', 'metin', 'Doluysa karttaki ok bu adrese gider. Site içi adres / ile başlar.' ),
						'link_label' => array( 'Bağlantı yazısı', 'metin', 'Doluysa metnin altına bu yazıyla bir bağlantı eklenir.' ),
					),
				),
			),
		),
	);
}

function crayn_tum_tanimlar() {
	return array_merge( crayn_bolum_tanimlari(), crayn_hizmet_tanimlari(), crayn_hakkimizda_tanimlari() );
}
