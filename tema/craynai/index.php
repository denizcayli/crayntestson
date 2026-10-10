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
	<div id="root"><?php crayn_duz_icerik(); ?></div>
	<?php wp_footer(); ?>
</body>
</html>
