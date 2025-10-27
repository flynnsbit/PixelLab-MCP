
## Available Endpoints

# Account

## GET /balance
**Get balance**
Tags: Account

Returns the current balance for your account.

### Responses
- **200**: Successfully retrieved balance
- **401**: Invalid API token

# Animate

## POST /animate-with-skeleton
**Animate with skeleton**
Tags: Animate

Creates a pixel art animation based on the provided parameters. Called "Animate with skeleton" in the plugin.

### Parameters

### Request Body
- `image_size`: object (required)
- `image_size.width`: integer (min=16.0, max=256.0) (required)
  Image width in pixels
- `image_size.height`: integer (min=16.0, max=256.0) (required)
  Image height in pixels
- `guidance_scale`: number (min=1.0, max=20.0, default=4.0) (optional)
  How closely to follow the reference image and skeleton keypoints
- `view`: enum[side, low top-down, high top-down] (optional)
- `direction`: enum[north, north-east, east, ...] (optional)
- `isometric`: boolean (default=False) (optional)
  Generate in isometric view
- `oblique_projection`: boolean (default=False) (optional)
  Generate in oblique projection
- `init_images`: array | null (optional)
  Initial images to start the generation from
- `init_image_strength`: integer (min=1.0, max=999.0, default=300) (optional)
  Strength of the initial image influence
- `skeleton_keypoints`: array[array] (optional)
  Skeleton points
- `reference_image`: object (required)
  A base64 encoded image.

Attributes:
    type (Literal["base64"]): Always "base64" to indicate the image encoding type
    base64 (str): The base64 encoded image data
    format (str): The image format (e.g., "png", "jpeg")
- `reference_image.type`: string (default=base64) (optional)
  Image data type
- `reference_image.base64`: string (required)
  Base64 encoded image data
- `reference_image.format`: string (default=png) (optional)
  Image format
- `inpainting_images`: array[any] (optional)
  Images used for showing the model with connected skeleton
- `mask_images`: array[any] (optional)
  Inpainting / mask image (black and white image, where the white is where the model should inpaint)
- `color_image`: object | null (optional)
  Forced color palette, image containing colors used for palette
- `seed`: integer | null (optional)
  Seed decides the starting noise

### Responses
- **200**: Successfully generated image
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded

## POST /animate-with-text
**Animate with text**
Tags: Animate

Creates a pixel art animation based on text description and parameters.

### Parameters

### Request Body
- `image_size`: object (required)
- `image_size.width`: integer (min=64.0, max=64.0) (required)
  Image width in pixels
- `image_size.height`: integer (min=64.0, max=64.0) (required)
  Image height in pixels
- `description`: string (required)
  Character description
- `negative_description`: string | null (optional)
  Negative prompt to guide what not to generate
- `action`: string (required)
  Action description
- `text_guidance_scale`: number | null (optional)
  How closely to follow the text prompts
- `image_guidance_scale`: number | null (optional)
  How closely to follow the reference image
- `n_frames`: integer | null (optional)
  Length of full animation (the model will always generate 4 frames)
- `start_frame_index`: integer | null (optional)
  Starting frame index of the full animation
- `view`: enum[side, low top-down, high top-down] (optional)
- `direction`: enum[north, north-east, east, ...] (optional)
- `init_images`: array | null (optional)
  Initial images to start the generation from
- `init_image_strength`: integer (min=1.0, max=999.0, default=300) (optional)
  Strength of the initial image influence
- `reference_image`: object (required)
  A base64 encoded image.

Attributes:
    type (Literal["base64"]): Always "base64" to indicate the image encoding type
    base64 (str): The base64 encoded image data
    format (str): The image format (e.g., "png", "jpeg")
- `reference_image.type`: string (default=base64) (optional)
  Image data type
- `reference_image.base64`: string (required)
  Base64 encoded image data
- `reference_image.format`: string (default=png) (optional)
  Image format
- `inpainting_images`: array[any] (optional)
  Existing animation frames to guide the generation
- `mask_images`: array | null (optional)
  Inpainting / mask image (black and white image, where the white is where the model should inpaint)
- `color_image`: object | null (optional)
  Forced color palette, image containing colors used for palette
- `seed`: integer | null (optional)
  Seed for reproducible results (0 for random)

### Responses
- **200**: Successfully generated animation
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded

## POST /estimate-skeleton
**Estimate skeleton**
Tags: Animate

Estimates the skeleton of a character, returning a list of keypoints to use with the skeleton animation tool.

### Parameters

### Request Body
- `image`: object (optional)
  A base64 encoded image.

Attributes:
    type (Literal["base64"]): Always "base64" to indicate the image encoding type
    base64 (str): The base64 encoded image data
    format (str): The image format (e.g., "png", "jpeg")
- `image.type`: string (default=base64) (optional)
  Image data type
- `image.base64`: string (required)
  Base64 encoded image data
- `image.format`: string (default=png) (optional)
  Image format

### Responses
- **200**: Successfully generated image
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded

# Background Jobs

## GET /background-jobs/{job_id}
**Get background job status**
Tags: Background Jobs

Check the status and results of a background job.

### Parameters
- `job_id` [path]: string (required)

### Responses
- **200**: Successfully retrieved job status
- **401**: Invalid API token
- **404**: Job not found or doesn't belong to user
- **429**: Too many requests
- **422**: Validation Error

# Character Management

## GET /characters
**List user's characters**
Tags: Character Management

List all characters created by the authenticated user.

### Parameters
- `limit` [query]: integer (min=1, max=100) (optional)
  Maximum number of characters to return
- `offset` [query]: integer (min=0) (optional)
  Number of characters to skip

### Responses
- **200**: Successfully retrieved character list
- **401**: Invalid API token
- **422**: Invalid pagination parameters
- **429**: Too many requests

## GET /characters/{character_id}
**Get character details**
Tags: Character Management

Get detailed information about a specific character.

### Parameters
- `character_id` [path]: string (required)

### Responses
- **200**: Successfully retrieved character details
- **401**: Invalid API token
- **403**: Character belongs to another user
- **404**: Character not found
- **429**: Too many requests
- **422**: Validation Error

## GET /characters/{character_id}/zip
**Export character as ZIP**
Tags: Character Management

Download a character with all animations as a ZIP file.

### Parameters
- `character_id` [path]: string (required)

### Responses
- **200**: ZIP file download containing character data
- **423**: Character or animations still being generated
- **404**: Character not found
- **422**: Validation Error

# Character from template

## POST /create-character-with-4-directions
**Create character with 4 directions**
Tags: Character from template

Generate a character or object facing 4 cardinal directions (south, west, east, north).

### Parameters

### Request Body
- `description`: string (minLen=1, maxLen=2000) (required)
  Description of the character or object to generate
- `image_size`: object (required)
- `image_size.width`: integer (min=32.0, max=400.0) (required)
  Canvas width in pixels (character will be ~60% of canvas size)
- `image_size.height`: integer (min=32.0, max=400.0) (required)
  Canvas height in pixels (character will be ~60% of canvas size)
- `async_mode`: boolean | null (optional)
  Process asynchronously (always true for character creation)
- `text_guidance_scale`: number | null (optional)
  How closely to follow the text description (higher = more faithful)
- `outline`: string | null (optional)
  Outline style (thin, medium, thick, none)
- `shading`: string | null (optional)
  Shading style (soft, hard, flat, none)
- `detail`: string | null (optional)
  Detail level (low, medium, high)
- `view`: string | null (optional)
  Camera view angle (side, low top-down, high top-down, perspective)
- `isometric`: boolean | null (optional)
  Generate in isometric view
- `color_image`: object | null (optional)
  Color palette reference image
- `force_colors`: boolean | null (optional)
  Force the use of colors from color_image
- `proportions`: null (optional)
  Character body proportions (preset or custom values)
- `seed`: integer | null (optional)
  Seed for reproducible generation
- `output_type`: string | null (optional)
  Output format (always dict for external API)

### Responses
- **200**: Successfully generated 4-rotation images
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests

## POST /create-character-with-8-directions
**Create character with 8 directions**
Tags: Character from template

Generate a character or object facing 8 directions (all cardinal and diagonal directions).

### Parameters

### Request Body
- `description`: string (minLen=1, maxLen=2000) (required)
  Description of the character or object to generate
- `image_size`: object (required)
- `image_size.width`: integer (min=32.0, max=400.0) (required)
  Canvas width in pixels (character will be ~60% of canvas size)
- `image_size.height`: integer (min=32.0, max=400.0) (required)
  Canvas height in pixels (character will be ~60% of canvas size)
- `async_mode`: boolean | null (optional)
  Process asynchronously (always true - no synchronous processing yet)
- `text_guidance_scale`: number | null (optional)
  How closely to follow the text description (higher = more faithful)
- `outline`: string | null (optional)
  Outline style (thin, medium, thick, none)
- `shading`: string | null (optional)
  Shading style (soft, hard, flat, none)
- `detail`: string | null (optional)
  Detail level (low, medium, high)
- `view`: string | null (optional)
  Camera view angle (side, low top-down, high top-down, perspective)
- `isometric`: boolean | null (optional)
  Generate in isometric view
- `color_image`: object | null (optional)
  Color palette reference image
- `force_colors`: boolean | null (optional)
  Force the use of colors from color_image
- `proportions`: null (optional)
  Character body proportions (preset or custom values)
- `seed`: integer | null (optional)
  Seed for reproducible generation
- `output_type`: string | null (optional)
  Output format (always dict for external API)

### Responses
- **200**: Successfully generated 8-rotation images
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests

## POST /characters/animations
**Create Character Animation**
Tags: Character from template

Animate an existing character (background processing)

### Parameters

### Request Body
- `character_id`: string (required)
  ID of existing character to animate
- `animation_name`: string | null (optional)
  Name for this animation (defaults to action_description if not provided)
- `description`: string | null (optional)
  Description of the character or object to animate (uses character's original if not specified)
- `action_description`: string | null (optional)
  Action description (e.g., 'walking', 'running', 'jumping'). If not provided, uses default description based on template_animation_id.
- `async_mode`: boolean | null (optional)
  Process in background (always true - no foreground processing yet)
- `template_animation_id`: enum[backflip, breathing-idle, cross-punch, ...] (required)
  Animation template ID (required). Available: `backflip`, `breathing-idle`, `cross-punch`, `crouched-walking`, `crouching`, `drinking`, `falling-back-death`, `fight-stance-idle-8-frames`, `fireball`, `flying-kick`, ...
- `text_guidance_scale`: number | null (optional)
  How closely to follow the text description (higher = more faithful)
- `outline`: string | null (optional)
  Outline style (uses character's original if not specified)
- `shading`: string | null (optional)
  Shading style (uses character's original if not specified)
- `detail`: string | null (optional)
  Detail level (uses character's original if not specified)
- `directions`: array | null (optional)
  List of directions to animate (south, north, east, west, etc.). If None, animates all available directions.
- `isometric`: boolean | null (optional)
  Generate in isometric view
- `color_image`: object | null (optional)
  Color palette reference image
- `force_colors`: boolean | null (optional)
  Force the use of colors from color_image
- `seed`: integer | null (optional)
  Seed for reproducible generation

### Responses
- **200**: Successful Response
- **422**: Validation Error

## POST /animate-character
**Animate character with template**
Tags: Character from template

Animate an existing character with multiple frames showing movement or action.

### Parameters

### Request Body
- `character_id`: string (required)
  ID of existing character to animate
- `animation_name`: string | null (optional)
  Name for this animation (defaults to action_description if not provided)
- `description`: string | null (optional)
  Description of the character or object to animate (uses character's original if not specified)
- `action_description`: string | null (optional)
  Action description (e.g., 'walking', 'running', 'jumping'). If not provided, uses default description based on template_animation_id.
- `async_mode`: boolean | null (optional)
  Process in background (always true - no foreground processing yet)
- `template_animation_id`: enum[backflip, breathing-idle, cross-punch, ...] (required)
  Animation template ID (required). Available: `backflip`, `breathing-idle`, `cross-punch`, `crouched-walking`, `crouching`, `drinking`, `falling-back-death`, `fight-stance-idle-8-frames`, `fireball`, `flying-kick`, ...
- `text_guidance_scale`: number | null (optional)
  How closely to follow the text description (higher = more faithful)
- `outline`: string | null (optional)
  Outline style (uses character's original if not specified)
- `shading`: string | null (optional)
  Shading style (uses character's original if not specified)
- `detail`: string | null (optional)
  Detail level (uses character's original if not specified)
- `directions`: array | null (optional)
  List of directions to animate (south, north, east, west, etc.). If None, animates all available directions.
- `isometric`: boolean | null (optional)
  Generate in isometric view
- `color_image`: object | null (optional)
  Color palette reference image
- `force_colors`: boolean | null (optional)
  Force the use of colors from color_image
- `seed`: integer | null (optional)
  Seed for reproducible generation

### Responses
- **200**: Successfully started character animation in background
- **401**: Invalid API token
- **402**: Insufficient credits
- **404**: Character not found
- **422**: Validation error
- **429**: Too many requests

# Create Image

## POST /create-image-pixflux
**Create image (pixflux)**
Tags: Create Image

Creates a pixel art image based on the provided parameters. Called "Create image (new)" in the plugin.

### Parameters

### Request Body
- `description`: string (required)
  Text description of the image to generate
- `negative_description`: string (default=) (optional)
  (Deprecated)
- `image_size`: object (required)
- `image_size.width`: integer (min=16.0, max=400.0) (required)
  Image width in pixels
- `image_size.height`: integer (min=16.0, max=400.0) (required)
  Image height in pixels
- `text_guidance_scale`: number (min=1.0, max=20.0, default=8) (optional)
  How closely to follow the text description
- `outline`: string | null (optional)
  Outline style reference (weakly guiding)
- `shading`: string | null (optional)
  Shading style reference (weakly guiding)
- `detail`: string | null (optional)
  Detail style reference (weakly guiding)
- `view`: string | null (optional)
  Camera view angle (weakly guiding)
- `direction`: string | null (optional)
  Subject direction (weakly guiding)
- `isometric`: boolean (default=False) (optional)
  Generate in isometric view (weakly guiding)
- `no_background`: boolean (default=False) (optional)
  Generate with transparent background, (blank background over 200x200 area)
- `init_image`: object | null (optional)
  Initial image to start from
- `init_image_strength`: integer (min=1.0, max=999.0, default=300) (optional)
  Strength of the initial image influence
- `color_image`: object | null (optional)
  Forced color palette, image containing colors used for palette
- `seed`: integer | null (optional)
  Seed decides the starting noise

### Responses
- **200**: Successfully generated image
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded

## POST /create-image-bitforge
**Create image (bitforge)**
Tags: Create Image

Generates a pixel art image based on the provided parameters. Called "Create S-M image" in the plugin.

### Parameters

### Request Body
- `description`: string (required)
  Text description of the image to generate
- `negative_description`: string (default=) (optional)
  Text description of what to avoid in the generated image
- `image_size`: object (required)
- `image_size.width`: integer (min=16.0, max=200.0) (required)
  Image width in pixels
- `image_size.height`: integer (min=16.0, max=200.0) (required)
  Image height in pixels
- `text_guidance_scale`: number (min=1.0, max=20.0, default=8.0) (optional)
  How closely to follow the text description
- `extra_guidance_scale`: number (min=0.0, max=20.0, default=3.0) (optional)
  (Deprecated)
- `style_strength`: number (min=0.0, max=100.0, default=0.0) (optional)
  Strength of the style transfer (0-100)
- `outline`: string | null (optional)
  Outline style reference
- `shading`: string | null (optional)
  Shading style reference
- `detail`: string | null (optional)
  Detail style reference
- `view`: string | null (optional)
  Camera view angle
- `direction`: string | null (optional)
  Subject direction
- `isometric`: boolean (default=False) (optional)
  Generate in isometric view
- `oblique_projection`: boolean (default=False) (optional)
  Generate in oblique projection
- `no_background`: boolean (default=False) (optional)
  Generate with transparent background
- `coverage_percentage`: number | null (optional)
  Percentage of the canvas to cover
- `init_image`: object | null (optional)
  Initial image to start from
- `init_image_strength`: integer (min=1.0, max=999.0, default=300) (optional)
  Strength of the initial image influence
- `style_image`: object | null (optional)
  Reference image for style transfer
- `inpainting_image`: object | null (optional)
  Reference image which is inpainted
- `mask_image`: object | null (optional)
  Inpainting / mask image (black and white image, where the white is where the model should inpaint)
- `color_image`: object | null (optional)
  Forced color palette, image containing colors used for palette
- `skeleton_guidance_scale`: number (min=0.0, max=5.0, default=1.0) (optional)
  How closely to follow the skeleton keypoints
- `skeleton_keypoints`: array | null (optional)
  Skeleton points. Warning! Sizes that are not 16x16, 32x32 and 64x64 can cause the generations to be lower quality
- `seed`: integer | null (optional)
  Seed decides the starting noise

### Responses
- **200**: Successfully generated image
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded

# Create map

## POST /tilesets
**Create a tileset asynchronously**
Tags: Create map

Creates a Wang tileset with 16 tiles in the background and returns immediately with job ID

### Parameters

### Request Body
- `lower_description`: string (minLen=1) (required)
  Description of the lower/base terrain level (e.g., 'ocean', 'grass', 'lava')
- `upper_description`: string (minLen=1) (required)
  Description of the upper/elevated terrain level (e.g., 'sand', 'stone', 'snow')
- `transition_description`: string (default=) (optional)
  Optional description of transition area between lower and upper
- `lower_base_tile_id`: string | null (optional)
  Optional ID to identify the lower base tile in metadata
- `upper_base_tile_id`: string | null (optional)
  Optional ID to identify the upper base tile in metadata
- `tile_size`: object (optional)
- `tile_size.width`: enum[16, 32] (default=16) (optional)
  Individual tile width in pixels (16 or 32)
- `tile_size.height`: enum[16, 32] (default=16) (optional)
  Individual tile height in pixels (16 or 32)
- `text_guidance_scale`: number (min=1.0, max=20.0, default=8.0) (optional)
  How closely to follow the text descriptions (default: 8.0)
- `outline`: string | null (optional)
  Outline style reference
- `shading`: string | null (optional)
  Shading style reference
- `detail`: string | null (optional)
  Detail style reference
- `view`: enum[low top-down, high top-down] (optional)
  Camera view options supported for tileset generation
- `tile_strength`: number (min=0.1, max=2.0, default=1.0) (optional)
  Strength of tile pattern adherence
- `tileset_adherence_freedom`: number (min=0.0, max=900.0, default=500.0) (optional)
  How flexible it will be when following tileset structure, higher values means more flexibility
- `tileset_adherence`: number (min=0.0, max=500.0, default=100.0) (optional)
  How much it will follow the reference/texture image and follow tileset structure
- `transition_size`: enum[0.0, 0.25, 0.5] (default=0.0) (optional)
  Size of transition area (0 = no transition, 0.25 = quarter, 0.5 = half)
- `lower_reference_image`: object | null (optional)
  Reference image for lower terrain style
- `upper_reference_image`: object | null (optional)
  Reference image for upper terrain style
- `transition_reference_image`: object | null (optional)
  Reference image for transition area style
- `color_image`: object | null (optional)
  Reference image for color palette
- `seed`: integer | null (optional)
  Seed for reproducible generation

### Responses
- **202**: Tileset creation started, returns job ID
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded

## POST /create-tileset
**Create top-down tileset (async processing)**
Tags: Create map

Creates a complete tileset for game development with seamlessly connecting tiles.

### Parameters

### Request Body
- `lower_description`: string (minLen=1) (required)
  Description of the lower/base terrain level (e.g., 'ocean', 'grass', 'lava')
- `upper_description`: string (minLen=1) (required)
  Description of the upper/elevated terrain level (e.g., 'sand', 'stone', 'snow')
- `transition_description`: string (default=) (optional)
  Optional description of transition area between lower and upper
- `lower_base_tile_id`: string | null (optional)
  Optional ID to identify the lower base tile in metadata
- `upper_base_tile_id`: string | null (optional)
  Optional ID to identify the upper base tile in metadata
- `tile_size`: object (optional)
- `tile_size.width`: enum[16, 32] (default=16) (optional)
  Individual tile width in pixels (16 or 32)
- `tile_size.height`: enum[16, 32] (default=16) (optional)
  Individual tile height in pixels (16 or 32)
- `text_guidance_scale`: number (min=1.0, max=20.0, default=8.0) (optional)
  How closely to follow the text descriptions (default: 8.0)
- `outline`: string | null (optional)
  Outline style reference
- `shading`: string | null (optional)
  Shading style reference
- `detail`: string | null (optional)
  Detail style reference
- `view`: enum[low top-down, high top-down] (optional)
  Camera view options supported for tileset generation
- `tile_strength`: number (min=0.1, max=2.0, default=1.0) (optional)
  Strength of tile pattern adherence
- `tileset_adherence_freedom`: number (min=0.0, max=900.0, default=500.0) (optional)
  How flexible it will be when following tileset structure, higher values means more flexibility
- `tileset_adherence`: number (min=0.0, max=500.0, default=100.0) (optional)
  How much it will follow the reference/texture image and follow tileset structure
- `transition_size`: enum[0.0, 0.25, 0.5] (default=0.0) (optional)
  Size of transition area (0 = no transition, 0.25 = quarter, 0.5 = half)
- `lower_reference_image`: object | null (optional)
  Reference image for lower terrain style
- `upper_reference_image`: object | null (optional)
  Reference image for upper terrain style
- `transition_reference_image`: object | null (optional)
  Reference image for transition area style
- `color_image`: object | null (optional)
  Reference image for color palette
- `seed`: integer | null (optional)
  Seed for reproducible generation

### Responses
- **202**: Successful Response
- **200**: Successfully generated tileset
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded

## GET /tilesets/{tileset_id}
**Get generated tileset by ID**
Tags: Create map

Retrieve a completed tileset by its UUID.

### Parameters
- `tileset_id` [path]: string (required)

### Responses
- **200**: Successfully retrieved tileset
- **423**: Tileset is still being generated
- **404**: Tileset not found
- **401**: Invalid API token
- **422**: Validation Error

## POST /create-isometric-tile
**Create isometric tile (async processing)**
Tags: Create map

Creates a isometric tile based on the provided parameters.

### Parameters

### Request Body
- `description`: string (required)
  Text description of the image to generate
- `image_size`: object (required)
- `image_size.width`: integer (min=16.0, max=64.0) (required)
  Image width in pixels. Sizes above 24px often give better results.
- `image_size.height`: integer (min=16.0, max=64.0) (required)
  Image height in pixels. Sizes above 24px often give better results.
- `text_guidance_scale`: number (min=1.0, max=20.0, default=8) (optional)
  How closely to follow the text description
- `outline`: string | null (optional)
  Outline style for the tile
- `shading`: string | null (optional)
  Shading complexity
- `detail`: string | null (optional)
  Level of detail in the tile
- `init_image`: object | null (optional)
  Initial image to start from
- `init_image_strength`: integer (min=1.0, max=999.0, default=300) (optional)
  Strength of the initial image influence
- `isometric_tile_size`: integer | null (optional)
  Size of the isometric tile. Recommended sizes: 16, 32. Can be omitted for default.
- `isometric_tile_shape`: enum[thick tile, thin tile, block] (default=block) (optional)
  Tile thickness. Thicker tiles allow more height variation in game maps. thin tile: ~15% canvas height, thick tile: ~25% height, block: ~50% height
- `color_image`: object | null (optional)
  Forced color palette, image containing colors used for palette
- `seed`: integer | null (optional)
  Seed decides the starting noise

### Responses
- **202**: Successful Response
- **200**: Successfully generated image
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded

## GET /isometric-tiles/{tile_id}
**Get generated isometric tile by ID**
Tags: Create map

Retrieve a completed isometric tile by its UUID.

### Parameters
- `tile_id` [path]: string (required)

### Responses
- **200**: Successfully retrieved tile
- **404**: Tile not found
- **401**: Invalid API token
- **423**: Tile still processing
- **422**: Validation Error

# Documentation

## GET /llms.txt
**Get LLM-friendly API documentation**
Tags: Documentation

Returns API documentation formatted for Large Language Models (LLMs).

### Responses
- **200**: LLM-friendly API documentation

# Inpaint

## POST /inpaint
**Inpaint image**
Tags: Inpaint

Creates a pixel art image based on the provided parameters. Called "Inpaint" in the plugin.

### Parameters

### Request Body
- `description`: string (required)
  Text description of the image to generate
- `negative_description`: string (default=) (optional)
  Text description of what to avoid in the generated image
- `image_size`: object (required)
- `image_size.width`: integer (min=16.0, max=200.0) (required)
  Image width in pixels
- `image_size.height`: integer (min=16.0, max=200.0) (required)
  Image height in pixels
- `text_guidance_scale`: number (min=1.0, max=10.0, default=3.0) (optional)
  How closely to follow the text description
- `extra_guidance_scale`: number (min=0.0, max=20.0, default=3.0) (optional)
  (Deprecated)
- `outline`: string | null (optional)
  Outline style reference
- `shading`: string | null (optional)
  Shading style reference
- `detail`: string | null (optional)
  Detail style reference
- `view`: string | null (optional)
  Camera view angle
- `direction`: string | null (optional)
  Subject direction
- `isometric`: boolean (default=False) (optional)
  Generate in isometric view
- `oblique_projection`: boolean (default=False) (optional)
  Generate in oblique projection
- `no_background`: boolean (default=False) (optional)
  Generate with transparent background
- `init_image`: object | null (optional)
  Initial image to start from
- `init_image_strength`: integer (min=1.0, max=999.0, default=300) (optional)
  Strength of the initial image influence
- `inpainting_image`: object (required)
  A base64 encoded image.

Attributes:
    type (Literal["base64"]): Always "base64" to indicate the image encoding type
    base64 (str): The base64 encoded image data
    format (str): The image format (e.g., "png", "jpeg")
- `inpainting_image.type`: string (default=base64) (optional)
  Image data type
- `inpainting_image.base64`: string (required)
  Base64 encoded image data
- `inpainting_image.format`: string (default=png) (optional)
  Image format
- `mask_image`: object (required)
  A base64 encoded image.

Attributes:
    type (Literal["base64"]): Always "base64" to indicate the image encoding type
    base64 (str): The base64 encoded image data
    format (str): The image format (e.g., "png", "jpeg")
- `mask_image.type`: string (default=base64) (optional)
  Image data type
- `mask_image.base64`: string (required)
  Base64 encoded image data
- `mask_image.format`: string (default=png) (optional)
  Image format
- `color_image`: object | null (optional)
  Forced color palette, image containing colors used for palette
- `seed`: integer | null (optional)
  Seed decides the starting noise

### Responses
- **200**: Successfully generated image
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded

# Rotate

## POST /rotate
**Rotate character or object**
Tags: Rotate

Rotates a pixel art image based on the provided parameters. Called "Rotate" in the plugin.

### Parameters

### Request Body
- `image_size`: object (required)
- `image_size.width`: integer (min=16.0, max=200.0) (required)
  Image width in pixels
- `image_size.height`: integer (min=16.0, max=200.0) (required)
  Image height in pixels
- `image_guidance_scale`: number (min=1.0, max=20.0, default=3.0) (optional)
  How closely to follow the reference image
- `view_change`: integer | null (optional)
  How many degrees to tilt the subject
- `direction_change`: integer | null (optional)
  How many degrees to rotate the subject
- `from_view`: string | null (optional)
  From camera view angle
- `to_view`: string | null (optional)
  To camera view angle
- `from_direction`: string | null (optional)
  From subject direction
- `to_direction`: string | null (optional)
  From subject direction
- `isometric`: boolean (default=False) (optional)
  Generate in isometric view
- `oblique_projection`: boolean (default=False) (optional)
  Generate in oblique projection
- `init_image`: object | null (optional)
  Initial image to start from
- `init_image_strength`: integer (min=1.0, max=999.0, default=300) (optional)
  Strength of the initial image influence
- `mask_image`: object | null (optional)
  Inpainting / mask image. Requires init image! (black and white image, where the white is where the model should inpaint)
- `from_image`: object (required)
  A base64 encoded image.

Attributes:
    type (Literal["base64"]): Always "base64" to indicate the image encoding type
    base64 (str): The base64 encoded image data
    format (str): The image format (e.g., "png", "jpeg")
- `from_image.type`: string (default=base64) (optional)
  Image data type
- `from_image.base64`: string (required)
  Base64 encoded image data
- `from_image.format`: string (default=png) (optional)
  Image format
- `color_image`: object | null (optional)
  Forced color palette, image containing colors used for palette
- `seed`: integer | null (optional)
  Seed decides the starting noise

### Responses
- **200**: Successfully generated image
- **401**: Invalid API token
- **402**: Insufficient credits
- **422**: Validation error
- **429**: Too many requests
- **529**: Rate limit exceeded
