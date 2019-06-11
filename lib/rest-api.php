<?php
/**
 * PHP and WordPress configuration compatibility functions for the Gutenberg
 * editor plugin changes related to REST API.
 *
 * @package gutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Silence is golden.' );
}

/**
 * Handle a failing oEmbed proxy request to try embedding as a shortcode.
 *
 * @see https://core.trac.wordpress.org/ticket/45447
 *
 * @since 2.3.0
 *
 * @param  WP_HTTP_Response|WP_Error $response The REST Request response.
 * @param  WP_REST_Server            $handler  ResponseHandler instance (usually WP_REST_Server).
 * @param  WP_REST_Request           $request  Request used to generate the response.
 * @return WP_HTTP_Response|object|WP_Error    The REST Request response.
 */
function gutenberg_filter_oembed_result( $response, $handler, $request ) {
	if ( ! is_wp_error( $response ) || 'oembed_invalid_url' !== $response->get_error_code() ||
			'/oembed/1.0/proxy' !== $request->get_route() ) {
		return $response;
	}

	// Try using a classic embed instead.
	global $wp_embed;
	$html = $wp_embed->shortcode( array(), $_GET['url'] );
	if ( ! $html ) {
		return $response;
	}

	global $wp_scripts;

	// Check if any scripts were enqueued by the shortcode, and include them in
	// the response.
	$enqueued_scripts = array();
	foreach ( $wp_scripts->queue as $script ) {
		$enqueued_scripts[] = $wp_scripts->registered[ $script ]->src;
	}

	return array(
		'provider_name' => __( 'Embed Handler', 'gutenberg' ),
		'html'          => $html,
		'scripts'       => $enqueued_scripts,
	);
}
add_filter( 'rest_request_after_callbacks', 'gutenberg_filter_oembed_result', 10, 3 );



/**
 * Start: Include for phase 2
 */
/**
 * Registers the REST API routes needed by the legacy widget block.
 *
 * @since 5.0.0
 */
function gutenberg_register_rest_widget_updater_routes() {
	$widget_forms = new WP_REST_Widget_Forms();
	$widget_forms->register_routes();
}
add_action( 'rest_api_init', 'gutenberg_register_rest_widget_updater_routes' );

/**
 * Registers the widget area REST API routes.
 *
 * @since 5.7.0
 */
function gutenberg_register_rest_widget_areas() {
	$widget_areas_controller = new WP_REST_Widget_Areas_Controller();
	$widget_areas_controller->register_routes();
}
add_action( 'rest_api_init', 'gutenberg_register_rest_widget_areas' );

/**
 * Registers the block directory.
 *
 * @since 6.5.0
 */
function gutenberg_register_rest_block_directory() {
	if ( ! gutenberg_is_experiment_enabled( 'gutenberg-block-directory' ) ) {
		return;
	}

	$block_directory_controller = new WP_REST_Block_Directory_Controller();
	$block_directory_controller->register_routes();
}
add_filter( 'rest_api_init', 'gutenberg_register_rest_block_directory' );

/**
 * Shim for get_sample_permalink() to add support for auto-draft status.
 *
 * This function filters the return from get_sample_permalink() and essentially
 * re-runs the same logic minus the filters, but pretends a status of auto-save
 * is actually publish in order to return the future permalink format.
 *
 * This is a temporary fix until we can patch get_sample_permalink()
 *
 * @see https://core.trac.wordpress.org/ticket/46266
 *
 * @param array  $permalink Array containing the sample permalink with placeholder for the post name, and the post name.
 * @param int    $id        ID of the post.
 * @param string $title     Title of the post.
 * @param string $name      Slug of the post.
 * @param object $post      WP_Post object.
 *
 * @return array Array containing the sample permalink with placeholder for the post name, and the post name.
 */
function gutenberg_auto_draft_get_sample_permalink( $permalink, $id, $title, $name, $post ) {
	if ( 'auto-draft' !== $post->post_status ) {
		return $permalink;
	}
	$ptype = get_post_type_object( $post->post_type );

	$original_status = $post->post_status;
	$original_date   = $post->post_date;
	$original_name   = $post->post_name;

	// Hack: get_permalink() would return ugly permalink for drafts, so we will fake that our post is published.
	$post->post_status = 'publish';
	$post->post_name   = sanitize_title( $post->post_name ? $post->post_name : $post->post_title, $post->ID );

	// If the user wants to set a new name -- override the current one.
	// Note: if empty name is supplied -- use the title instead, see #6072.
	if ( ! is_null( $name ) ) {
		$post->post_name = sanitize_title( $name ? $name : $title, $post->ID );
	}

	$post->post_name = wp_unique_post_slug( $post->post_name, $post->ID, $post->post_status, $post->post_type, $post->post_parent );

	$post->filter = 'sample';

	$permalink = get_permalink( $post, true );

	// Replace custom post_type Token with generic pagename token for ease of use.
	$permalink = str_replace( "%$post->post_type%", '%pagename%', $permalink );

	// Handle page hierarchy.
	if ( $ptype->hierarchical ) {
		$uri = get_page_uri( $post );
		if ( $uri ) {
			$uri = untrailingslashit( $uri );
			$uri = strrev( stristr( strrev( $uri ), '/' ) );
			$uri = untrailingslashit( $uri );
		}

		if ( ! empty( $uri ) ) {
			$uri .= '/';
		}
		$permalink = str_replace( '%pagename%', "{$uri}%pagename%", $permalink );
	}

	$permalink         = array( $permalink, $post->post_name );
	$post->post_status = $original_status;
	$post->post_date   = $original_date;
	$post->post_name   = $original_name;
	unset( $post->filter );

	return $permalink;
}
add_filter( 'get_sample_permalink', 'gutenberg_auto_draft_get_sample_permalink', 10, 5 );

/**
 * Add generated slug to posts in the autosaves REST API response.
 *
 * @see https://core.trac.wordpress.org/ticket/46267
 *
 * @param WP_REST_Response $response WP REST API response of a post.
 * @param WP_Post          $post The post being returned.
 * @param WP_REST_Request  $request WP REST API request.
 * @return WP_REST_Response Response containing the generated_slug.
 */
function gutenberg_add_generated_slug_to_autosaves( $response, $post, $request ) {
	if ( 'edit' !== $request['context'] ) {
		return $response;
	}
	$post_type_obj = get_post_type_object( $post->post_type );
	if ( ! is_post_type_viewable( $post_type_obj ) || ! $post_type_obj->public ) {
		return $response;
	}
	if ( ! function_exists( 'get_sample_permalink' ) ) {
		require_once ABSPATH . '/wp-admin/includes/post.php';
	}

	$params           = $request->get_json_params();
	$sample_permalink = get_sample_permalink( $post->ID, $post->post_title, $params['slug'] );

	$response->data['generated_slug'] = $sample_permalink[1];
	return $response;
}
add_filter( 'rest_prepare_autosave', 'gutenberg_add_generated_slug_to_autosaves', 10, 3 );
