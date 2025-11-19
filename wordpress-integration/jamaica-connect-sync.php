<?php
/**
 * Plugin Name: Jamaica Connect - Supabase Sync
 * Description: Syncs WordPress content (Amelia bookings, ACF forms) with Supabase
 * Version: 1.0.0
 * Author: Jamaica Connect
 */

defined('ABSPATH') or die('No script kiddies please!');

class Jamaica_Connect_Supabase_Sync {

    private $supabase_url;
    private $supabase_key;

    public function __construct() {
        // Get Supabase credentials from WordPress options
        $this->supabase_url = get_option('jc_supabase_url');
        $this->supabase_key = get_option('jc_supabase_key');

        // Hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));

        // Amelia booking hooks
        add_action('AmeliaBookingAdded', array($this, 'sync_amelia_booking'), 10, 3);
        add_action('AmeliaBookingUpdated', array($this, 'update_amelia_booking'), 10, 3);

        // ACF form submission hook
        add_action('acf/save_post', array($this, 'sync_acf_submission'), 20);

        // Custom post type hooks for businesses and news
        add_action('save_post', array($this, 'sync_post_to_supabase'), 10, 3);
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'Jamaica Connect Sync',
            'Jamaica Connect',
            'manage_options',
            'jamaica-connect-sync',
            array($this, 'settings_page')
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('jc_sync_settings', 'jc_supabase_url');
        register_setting('jc_sync_settings', 'jc_supabase_key');
        register_setting('jc_sync_settings', 'jc_sync_enabled');
    }

    /**
     * Settings page
     */
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>Jamaica Connect - Supabase Sync Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('jc_sync_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">Supabase URL</th>
                        <td>
                            <input type="text" name="jc_supabase_url"
                                   value="<?php echo esc_attr(get_option('jc_supabase_url')); ?>"
                                   class="regular-text" />
                            <p class="description">Your Supabase project URL (e.g., https://xxxxx.supabase.co)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Supabase Service Role Key</th>
                        <td>
                            <input type="password" name="jc_supabase_key"
                                   value="<?php echo esc_attr(get_option('jc_supabase_key')); ?>"
                                   class="regular-text" />
                            <p class="description">Your Supabase service role key</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Enable Sync</th>
                        <td>
                            <input type="checkbox" name="jc_sync_enabled" value="1"
                                   <?php checked(get_option('jc_sync_enabled'), 1); ?> />
                            <p class="description">Enable automatic syncing to Supabase</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    /**
     * Make request to Supabase
     */
    private function supabase_request($table, $data, $method = 'POST', $id = null) {
        if (!get_option('jc_sync_enabled') || !$this->supabase_url || !$this->supabase_key) {
            return false;
        }

        $url = trailingslashit($this->supabase_url) . 'rest/v1/' . $table;
        if ($id) {
            $url .= '?id=eq.' . $id;
        }

        $args = array(
            'method'  => $method,
            'headers' => array(
                'apikey'        => $this->supabase_key,
                'Authorization' => 'Bearer ' . $this->supabase_key,
                'Content-Type'  => 'application/json',
                'Prefer'        => 'return=representation'
            ),
            'body'    => json_encode($data),
            'timeout' => 30,
        );

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            error_log('Jamaica Connect Sync Error: ' . $response->get_error_message());
            return false;
        }

        return json_decode(wp_remote_retrieve_body($response), true);
    }

    /**
     * Sync Amelia booking to Supabase
     */
    public function sync_amelia_booking($booking, $appointment, $customer) {
        $booking_data = array(
            'amelia_booking_id' => $booking['id'],
            'customer_name'     => $customer['firstName'] . ' ' . $customer['lastName'],
            'customer_email'    => $customer['email'],
            'customer_phone'    => $customer['phone'],
            'service_name'      => $appointment['serviceName'] ?? '',
            'booking_date'      => $appointment['bookingStart'],
            'duration_minutes'  => $appointment['duration'] ?? null,
            'status'            => 'confirmed',
            'price'             => $appointment['price'] ?? null,
            'currency'          => 'USD',
        );

        // Find business by service or location
        if (!empty($appointment['providerId'])) {
            $business_id = get_post_meta($appointment['providerId'], 'supabase_business_id', true);
            if ($business_id) {
                $booking_data['business_id'] = $business_id;
            }
        }

        $this->supabase_request('bookings', $booking_data);
    }

    /**
     * Update Amelia booking in Supabase
     */
    public function update_amelia_booking($booking, $appointment, $customer) {
        // Similar to sync, but use PATCH method
        $this->sync_amelia_booking($booking, $appointment, $customer);
    }

    /**
     * Sync ACF form submission to Supabase
     */
    public function sync_acf_submission($post_id) {
        // Only sync contact form submissions
        if (get_post_type($post_id) !== 'acf_contact_form') {
            return;
        }

        $submission_data = array(
            'acf_form_id'       => get_field('form_id', $post_id),
            'wp_post_id'        => $post_id,
            'name'              => get_field('name', $post_id),
            'email'             => get_field('email', $post_id),
            'subject'           => get_field('subject', $post_id),
            'message'           => get_field('message', $post_id),
            'business_listing'  => (bool) get_field('business_listing', $post_id),
            'status'            => 'new',
            'ip_address'        => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent'        => $_SERVER['HTTP_USER_AGENT'] ?? null,
        );

        $this->supabase_request('contact_submissions', $submission_data);
    }

    /**
     * Sync WordPress post to Supabase
     */
    public function sync_post_to_supabase($post_id, $post, $update) {
        // Avoid autosaves and revisions
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (wp_is_post_revision($post_id)) return;

        // Only sync published posts
        if ($post->post_status !== 'publish') return;

        // Sync businesses
        if ($post->post_type === 'business') {
            $this->sync_business($post_id, $post);
        }

        // Sync news articles
        if ($post->post_type === 'post' && has_category('news', $post_id)) {
            $this->sync_news($post_id, $post);
        }
    }

    /**
     * Sync business to Supabase
     */
    private function sync_business($post_id, $post) {
        $business_data = array(
            'wp_post_id'    => $post_id,
            'name'          => $post->post_title,
            'slug'          => $post->post_name,
            'description'   => $post->post_content,
            'category'      => get_field('business_category', $post_id),
            'address'       => get_field('address', $post_id),
            'phone'         => get_field('phone', $post_id),
            'email'         => get_field('email', $post_id),
            'website'       => get_field('website', $post_id),
            'featured'      => (bool) get_field('featured', $post_id),
        );

        // Get featured image
        if (has_post_thumbnail($post_id)) {
            $business_data['image_url'] = get_the_post_thumbnail_url($post_id, 'large');
        }

        // Check if business already exists in Supabase
        $supabase_id = get_post_meta($post_id, 'supabase_business_id', true);

        if ($supabase_id) {
            // Update existing
            $this->supabase_request('businesses', $business_data, 'PATCH', $supabase_id);
        } else {
            // Create new
            $result = $this->supabase_request('businesses', $business_data);
            if ($result && isset($result[0]['id'])) {
                update_post_meta($post_id, 'supabase_business_id', $result[0]['id']);
            }
        }
    }

    /**
     * Sync news article to Supabase
     */
    private function sync_news($post_id, $post) {
        $news_data = array(
            'wp_post_id'      => $post_id,
            'title'           => $post->post_title,
            'slug'            => $post->post_name,
            'excerpt'         => $post->post_excerpt ?: wp_trim_words($post->post_content, 55),
            'content'         => $post->post_content,
            'author'          => get_the_author_meta('display_name', $post->post_author),
            'published_date'  => get_the_date('Y-m-d', $post_id),
            'category'        => get_field('news_category', $post_id) ?: 'General',
            'featured'        => (bool) get_field('featured', $post_id),
        );

        // Get featured image
        if (has_post_thumbnail($post_id)) {
            $news_data['image_url'] = get_the_post_thumbnail_url($post_id, 'large');
        }

        // Check if article already exists in Supabase
        $supabase_id = get_post_meta($post_id, 'supabase_news_id', true);

        if ($supabase_id) {
            // Update existing
            $this->supabase_request('news_articles', $news_data, 'PATCH', $supabase_id);
        } else {
            // Create new
            $result = $this->supabase_request('news_articles', $news_data);
            if ($result && isset($result[0]['id'])) {
                update_post_meta($post_id, 'supabase_news_id', $result[0]['id']);
            }
        }
    }
}

// Initialize the plugin
new Jamaica_Connect_Supabase_Sync();

/**
 * REST API Endpoints for Next.js to fetch WordPress data
 */
add_action('rest_api_init', function () {
    // Endpoint to get ACF field definitions
    register_rest_route('jamaica-connect/v1', '/acf-fields/(?P<post_type>[a-zA-Z0-9-]+)', array(
        'methods'  => 'GET',
        'callback' => 'jc_get_acf_fields',
        'permission_callback' => '__return_true',
    ));

    // Endpoint to manually trigger sync
    register_rest_route('jamaica-connect/v1', '/sync', array(
        'methods'  => 'POST',
        'callback' => 'jc_manual_sync',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
    ));
});

function jc_get_acf_fields($request) {
    $post_type = $request['post_type'];
    $field_groups = acf_get_field_groups(array('post_type' => $post_type));
    $fields = array();

    foreach ($field_groups as $group) {
        $fields[$group['title']] = acf_get_fields($group['key']);
    }

    return rest_ensure_response($fields);
}

function jc_manual_sync($request) {
    // Trigger manual sync of all content
    $results = array(
        'businesses' => 0,
        'news' => 0,
    );

    // Sync all businesses
    $businesses = get_posts(array(
        'post_type' => 'business',
        'post_status' => 'publish',
        'posts_per_page' => -1,
    ));

    foreach ($businesses as $business) {
        do_action('save_post', $business->ID, $business, true);
        $results['businesses']++;
    }

    // Sync all news
    $news = get_posts(array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'category_name' => 'news',
        'posts_per_page' => -1,
    ));

    foreach ($news as $article) {
        do_action('save_post', $article->ID, $article, true);
        $results['news']++;
    }

    return rest_ensure_response(array(
        'success' => true,
        'message' => 'Sync completed',
        'results' => $results,
    ));
}
