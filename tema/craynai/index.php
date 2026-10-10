<?php
/**
 * Tek şablon: bütün sayfalar uygulamanın bağlandığı aynı kabuğu kullanır.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<?php wp_head(); ?>
</head>
<body>
	<?php // Açılış ekranının zemini ve yazıları: uygulamanın kodu inmeden görünür, sonrasını uygulama devralır (Preloader.jsx). İlk ziyaret değilse hemen kaldırılır. ?>
	<div id="crayn-acilis" class="preloader" aria-hidden="true"><div class="preloader-screen"></div><div class="preloader-label preloader-label--left">©2026</div><div class="preloader-slot"></div><div class="preloader-label preloader-label--right">CraynAI</div></div>
	<script>try{if(sessionStorage.getItem('crayn-intro-seen'))document.getElementById('crayn-acilis').remove()}catch(e){}</script>
	<div id="root"><?php crayn_duz_icerik(); ?></div>
	<?php wp_footer(); ?>
</body>
</html>
