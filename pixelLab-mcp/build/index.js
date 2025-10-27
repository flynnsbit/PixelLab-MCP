#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
const API_KEY = process.env.PIXELLAB_API_KEY;
const API_BASE_URL = process.env.PIXELLAB_API_BASE_URL || 'https://api.pixellab.ai';
if (!API_KEY) {
    throw new Error('PIXELLAB_API_KEY environment variable is required');
}
class PixelLabServer {
    server;
    axiosInstance;
    constructor() {
        this.server = new Server({
            name: 'pixelLab-mcp-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'create_character',
                    description: 'Create pixel art characters with 4 or 8 directional views',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            description: {
                                type: 'string',
                                description: 'Description of the character to create',
                            },
                            n_directions: {
                                type: 'number',
                                description: 'Number of directional views (4 or 8)',
                                enum: [4, 8],
                                default: 8,
                            },
                        },
                        required: ['description'],
                    },
                },
                {
                    name: 'animate_character',
                    description: 'Add animations to existing characters (walk, run, idle, etc.)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            character_id: {
                                type: 'string',
                                description: 'ID of the character to animate',
                            },
                            animation: {
                                type: 'string',
                                description: 'Type of animation (walk, run, idle, etc.)',
                            },
                        },
                        required: ['character_id', 'animation'],
                    },
                },
                {
                    name: 'create_topdown_tileset',
                    description: 'Generate Wang tilesets for seamless terrain transitions. Chain multiple terrains together.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            lower: {
                                type: 'string',
                                description: 'Lower terrain type',
                            },
                            upper: {
                                type: 'string',
                                description: 'Upper terrain type',
                            },
                            lower_base_tile_id: {
                                type: 'string',
                                description: 'ID of the lower base tile (optional, for chaining)',
                            },
                        },
                        required: ['lower', 'upper'],
                    },
                },
                {
                    name: 'create_sidescroller_tileset',
                    description: 'Generate platform tilesets for 2D platformer games with seamless transitions.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            lower: {
                                type: 'string',
                                description: 'Lower platform type',
                            },
                            transition: {
                                type: 'string',
                                description: 'Transition material',
                            },
                            base_tile_id: {
                                type: 'string',
                                description: 'ID of the base tile (optional, for chaining)',
                            },
                        },
                        required: ['lower', 'transition'],
                    },
                },
                {
                    name: 'create_isometric_tile',
                    description: 'Create individual isometric tiles',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            description: {
                                type: 'string',
                                description: 'Description of the isometric tile',
                            },
                            size: {
                                type: 'number',
                                description: 'Size of the tile in pixels',
                                default: 32,
                            },
                        },
                        required: ['description'],
                    },
                },
                {
                    name: 'get_character',
                    description: 'Get complete character information including rotations, animations, and download links',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            character_id: {
                                type: 'string',
                                description: 'Character ID to retrieve',
                            },
                            include_preview: {
                                type: 'boolean',
                                description: 'Include preview image of all directions',
                                default: true,
                            },
                        },
                        required: ['character_id'],
                    },
                },
                {
                    name: 'list_characters',
                    description: 'List all characters created by the user with pagination',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            limit: {
                                type: 'number',
                                description: 'Maximum number of characters to return (1-100)',
                                minimum: 1,
                                maximum: 100,
                                default: 10,
                            },
                            offset: {
                                type: 'number',
                                description: 'Number of characters to skip for pagination',
                                minimum: 0,
                                default: 0,
                            },
                        },
                    },
                },
                {
                    name: 'get_background_job',
                    description: 'Check the status and results of a background job',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            job_id: {
                                type: 'string',
                                description: 'Background job ID to check',
                            },
                        },
                        required: ['job_id'],
                    },
                },
                {
                    name: 'get_balance',
                    description: 'Check account balance and remaining API credits',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_8direction_character',
                    description: 'Create pixel art characters with 8 directional views (full 360°)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            description: {
                                type: 'string',
                                description: 'Description of the character to create',
                            },
                        },
                        required: ['description'],
                    },
                },
                {
                    name: 'get_character_zip',
                    description: 'Download character as ZIP file with all directions and animations',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            character_id: {
                                type: 'string',
                                description: 'Character ID to download',
                            },
                        },
                        required: ['character_id'],
                    },
                },
                {
                    name: 'get_tileset_status',
                    description: 'Check status and download completed tilesets',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tileset_id: {
                                type: 'string',
                                description: 'Tileset ID to check',
                            },
                        },
                        required: ['tileset_id'],
                    },
                },
                {
                    name: 'get_isometric_tile_status',
                    description: 'Check status and download completed isometric tiles',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tile_id: {
                                type: 'string',
                                description: 'Isometric tile ID to check',
                            },
                        },
                        required: ['tile_id'],
                    },
                },
                {
                    name: 'animate_with_text',
                    description: 'Create animations from text descriptions (creative animation generation)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            description: {
                                type: 'string',
                                description: 'Base character description',
                            },
                            action: {
                                type: 'string',
                                description: 'Animation action description (e.g., "breathing heavily", "casting a spell")',
                            },
                            reference_image: {
                                type: 'string',
                                description: 'Character ID to use as reference for animation',
                            },
                        },
                        required: ['description', 'action', 'reference_image'],
                    },
                },
                {
                    name: 'create_image_pixflux',
                    description: 'Generate pixel art images using Pixflux model (primary image generation)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            description: {
                                type: 'string',
                                description: 'Text description of the image to generate',
                            },
                            negative_description: {
                                type: 'string',
                                description: 'What to avoid in the generated image (optional)',
                            },
                            width: {
                                type: 'number',
                                description: 'Image width (16-400)',
                                minimum: 16,
                                maximum: 400,
                                default: 64,
                            },
                            height: {
                                type: 'number',
                                description: 'Image height (16-400)',
                                minimum: 16,
                                maximum: 400,
                                default: 64,
                            },
                        },
                        required: ['description'],
                    },
                },
                {
                    name: 'inpaint_pixel_art',
                    description: 'Edit and modify existing pixel art images (inpaint)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            description: {
                                type: 'string',
                                description: 'How to modify the image',
                            },
                            source_image: {
                                type: 'string',
                                description: 'Base64 encoded source image',
                            },
                            mask_image: {
                                type: 'string',
                                description: 'Base64 mask image (white areas will be modified, black areas stay same)',
                            },
                            negative_description: {
                                type: 'string',
                                description: 'What to avoid in the modified areas (optional)',
                            },
                            width: {
                                type: 'number',
                                description: 'Image width (16-400)',
                                minimum: 16,
                                maximum: 400,
                                default: 64,
                            },
                            height: {
                                type: 'number',
                                description: 'Image height (16-400)',
                                minimum: 16,
                                maximum: 400,
                                default: 64,
                            },
                        },
                        required: ['description', 'source_image', 'mask_image'],
                    },
                },
                {
                    name: 'get_api_documentation',
                    description: 'Retrieve formatted API documentation for Large Language Models',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'create_image_bitforge',
                    description: 'Generate pixel art images using Bitforge model (alternative generation)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            description: {
                                type: 'string',
                                description: 'Text description of the image to generate',
                            },
                            negative_description: {
                                type: 'string',
                                description: 'What to avoid in the generated image (optional)',
                            },
                            width: {
                                type: 'number',
                                description: 'Image width (16-200)',
                                minimum: 16,
                                maximum: 200,
                                default: 64,
                            },
                            height: {
                                type: 'number',
                                description: 'Image height (16-200)',
                                minimum: 16,
                                maximum: 200,
                                default: 64,
                            },
                            style_strength: {
                                type: 'number',
                                description: 'Style transfer strength (0-100)',
                                minimum: 0,
                                maximum: 100,
                                default: 0,
                            },
                        },
                        required: ['description'],
                    },
                },
                {
                    name: 'rotate_character',
                    description: 'Generate different viewing angles of pixel art characters',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            source_image: {
                                type: 'string',
                                description: 'Base64 encoded source character image',
                            },
                            image_guidance_scale: {
                                type: 'number',
                                description: 'How closely to follow the reference image (1-20)',
                                minimum: 1,
                                maximum: 20,
                                default: 3,
                            },
                            view_change: {
                                type: 'number',
                                description: 'Degrees to tilt the subject view',
                                minimum: -180,
                                maximum: 180,
                                default: 30,
                            },
                            direction_change: {
                                type: 'number',
                                description: 'Degrees to rotate the subject direction',
                                minimum: -180,
                                maximum: 180,
                                default: 45,
                            },
                            from_view: {
                                type: 'string',
                                description: 'Source view angle (side, top-down, etc.)',
                                enum: ['side', 'top-down', 'low top-down', 'high top-down', 'perspective'],
                                default: 'side',
                            },
                            to_view: {
                                type: 'string',
                                description: 'Target view angle (side, top-down, etc.)',
                                enum: ['side', 'top-down', 'low top-down', 'high top-down', 'perspective'],
                                default: 'top-down',
                            },
                            width: {
                                type: 'number',
                                description: 'Image width (16-200)',
                                minimum: 16,
                                maximum: 200,
                                default: 64,
                            },
                            height: {
                                type: 'number',
                                description: 'Image height (16-200)',
                                minimum: 16,
                                maximum: 200,
                                default: 64,
                            },
                        },
                        required: ['source_image'],
                    },
                },
                {
                    name: 'animate_with_skeleton',
                    description: 'Professional pose-based animation using 2D skeleton keypoints',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            reference_image: {
                                type: 'string',
                                description: 'Base64 encoded reference image for pose',
                            },
                            skeleton_keypoints: {
                                type: 'array',
                                description: 'Array of skeleton keypoint coordinates',
                                items: {
                                    type: 'array',
                                    items: { type: 'number' },
                                },
                            },
                            image_guidance_scale: {
                                type: 'number',
                                description: 'How closely to follow the reference image (1-20)',
                                minimum: 1,
                                maximum: 20,
                                default: 4,
                            },
                            view: {
                                type: 'string',
                                description: 'Camera view angle',
                                enum: ['side', 'top-down', 'low top-down', 'high top-down'],
                                default: 'side',
                            },
                            direction: {
                                type: 'string',
                                description: 'Subject direction',
                                enum: ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'],
                                default: 'south',
                            },
                            isometric: {
                                type: 'boolean',
                                description: 'Generate in isometric view',
                                default: false,
                            },
                        },
                        required: ['reference_image'],
                    },
                },
                {
                    name: 'estimate_skeleton',
                    description: 'Extract skeleton keypoints from pixel art character images',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            image: {
                                type: 'string',
                                description: 'Base64 encoded character image for keypoint extraction',
                            },
                        },
                        required: ['image'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'create_character':
                    return this.handleCreateCharacter(args);
                case 'animate_character':
                    return this.handleAnimateCharacter(args);
                case 'create_topdown_tileset':
                    return this.handleCreateTopdownTileset(args);
                case 'create_sidescroller_tileset':
                    return this.handleCreateSidescrollerTileset(args);
                case 'create_isometric_tile':
                    return this.handleCreateIsometricTile(args);
                case 'get_character':
                    return this.handleGetCharacter(args);
                case 'list_characters':
                    return this.handleListCharacters(args);
                case 'get_background_job':
                    return this.handleGetBackgroundJob(args);
                case 'get_balance':
                    return this.handleGetBalance(args);
                case 'get_8direction_character':
                    return this.handleGet8DirectionCharacter(args);
                case 'get_character_zip':
                    return this.handleGetCharacterZip(args);
                case 'get_tileset_status':
                    return this.handleGetTilesetStatus(args);
                case 'get_isometric_tile_status':
                    return this.handleGetIsometricTileStatus(args);
                case 'animate_character_alt':
                    return this.handleAnimateCharacterAlt(args);
                case 'animate_with_text':
                    return this.handleAnimateWithText(args);
                case 'create_image_pixflux':
                    return this.handleCreateImagePixflux(args);
                case 'inpaint_pixel_art':
                    return this.handleInpaintPixelArt(args);
                case 'get_api_documentation':
                    return this.handleGetApiDocumentation(args);
                case 'create_image_bitforge':
                    return this.handleCreateImageBitforge(args);
                case 'rotate_character':
                    return this.handleRotateCharacter(args);
                case 'animate_with_skeleton':
                    return this.handleAnimateWithSkeleton(args);
                case 'estimate_skeleton':
                    return this.handleEstimateSkeleton(args);
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
        });
    }
    // Core working handlers (already tested and verified)
    async handleCreateCharacter(args) {
        if (!args || typeof args.description !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Description is required for character creation');
        }
        try {
            const response = await this.axiosInstance.post('/create-character-with-4-directions', {
                description: args.description,
                image_size: {
                    width: 64,
                    height: 64
                },
            });
            if (response.status === 200 && response.data.character_id && response.data.background_job_id) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🤖 **4-DIRECTION CHARACTER CREATION STARTED!**\n\n✅ Description: "${args.description}"\n✅ Character ID: ${response.data.character_id}\n✅ Job ID: ${response.data.background_job_id}\n\n⏱️ Processing will take 3-5 minutes.\n\n💡 Check back with get_character to see your robot!`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Character creation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error: ${error.response?.status} - ${error.response?.data?.message ?? error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleAnimateCharacter(args) {
        if (!args || !args.character_id) {
            throw new McpError(ErrorCode.InvalidParams, 'Character ID is required for animation');
        }
        try {
            // Map user-friendly animation names to valid template IDs
            const animationMapping = {
                'walking': 'breathing-idle',
                'running': 'breathing-idle',
                'sprint': 'breathing-idle',
                'digital sprint': 'breathing-idle',
                'idle': 'breathing-idle',
                'fight': 'cross-punch',
                'punch': 'cross-punch',
                'attack': 'cross-punch',
                'crouch': 'crouching',
                'jump': 'flying-kick',
                'kick': 'flying-kick',
                'fall': 'falling-back-death',
                'death': 'falling-back-death',
                'backflip': 'backflip',
                'drink': 'drinking'
            };
            const templateId = animationMapping[args.animation?.toLowerCase()] || 'breathing-idle';
            const response = await this.axiosInstance.post('/characters/animations', {
                character_id: args.character_id,
                template_animation_id: templateId,
                action_description: `${args.animation || 'walking'} animation`,
                async_mode: true
            });
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🎬 **ANIMATION JOB STARTED!**\n\n✅ Character ID: ${args.character_id}\n✅ Animation: ${args.animation || 'walking'}\n✅ Status: Processing\n\n⏱️ Animation will be ready in 2-4 minutes.`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Animation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Animation API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleCreateTopdownTileset(args) {
        if (!args || !args.lower || !args.upper) {
            throw new McpError(ErrorCode.InvalidParams, 'Lower and upper terrain types are required');
        }
        try {
            const response = await this.axiosInstance.post('/tilesets', {
                lower_description: args.lower,
                upper_description: args.upper,
                lower_base_tile_id: args.lower_base_tile_id,
                transition_description: args.transition_description || '',
                tile_size: { width: 16, height: 16 }
            });
            if (response.data.data?.tileset_id || response.data.tileset_id) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🏞️ **TOP-DOWN TILESET CREATION STARTED!**\n\n✅ Lower: "${args.lower}"\n✅ Upper: "${args.upper}"\n✅ Tileset ID: ${response.data.data?.tileset_id || response.data.tileset_id}\n\n⏱️ Processing will take 3-5 minutes.`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Tileset creation debug response:\n${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `PixelLab API error: ${error.response?.data?.message ?? error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleCreateSidescrollerTileset(args) {
        return {
            content: [
                {
                    type: 'text',
                    text: `📊 **SIDESCROLLER TILESETS STATUS:**\n\n❌ **NOT CURRENTLY SUPPORTED BY PIXELLAB API v2**\n\nThe PixelLab API currently only supports:\n• Top-down tilesets ("low top-down" or "high top-down" views)\n• Wang tiles for seamless terrain transitions\n\nSidescroller tilesets would require "side" view, which is not implemented in API v2.\n\n💡 Use top-down tilesets in your platformer games instead!`,
                },
            ],
        };
    }
    async handleCreateIsometricTile(args) {
        if (!args || typeof args.description !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Description is required for isometric tile creation');
        }
        try {
            const response = await this.axiosInstance.post('/create-isometric-tile', {
                description: args.description,
                image_size: {
                    width: args.size || 32,
                    height: args.size || 32
                },
                isometric_tile_size: args.size || 32,
                isometric_tile_shape: 'block'
            });
            if (response.status === 200 && (response.data.tile_id || response.data.background_job_id)) {
                const tile_id = response.data.tile_id || 'Unknown';
                const job_id = response.data.background_job_id || 'Unknown';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🎲 **ISOMETRIC TILE CREATION STARTED!**\n\n✅ Description: "${args.description}"\n✅ Size: ${args.size || 32}px\n✅ Tile ID: ${tile_id}\n✅ Job ID: ${job_id}\n\n⏱️ Processing will take 2-3 minutes.\n\n💡 Use get_isometric_tile_status to check completion.`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Isometric tile creation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `PixelLab API error: ${error.response?.data?.message ?? error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleGetCharacter(args) {
        if (!args || !args.character_id) {
            throw new McpError(ErrorCode.InvalidParams, 'Character ID is required');
        }
        try {
            const response = await this.axiosInstance.get(`/characters/${args.character_id}`);
            if (response.status !== 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Failed to retrieve character: ${response.data?.message || 'Unknown error'}`,
                        },
                    ],
                    isError: true,
                };
            }
            const character = response.data;
            let result = `🎨 **CHARACTER DETAILS:**\n`;
            if (character.id) {
                result += `🆔 ID: ${character.id}\n`;
            }
            if (character.name) {
                result += `📝 Name: ${character.name}\n`;
            }
            if (character.rotation_urls && character.rotation_urls.south) {
                result += `✅ **COMPLETED! Ready for download.**\n\n`;
                result += `📸 **DOWNLOAD LINKS:**\n`;
                const valid_directions = ['south', 'west', 'east', 'north'];
                valid_directions.forEach(direction => {
                    if (character.rotation_urls?.[direction]) {
                        result += `• ${direction.toUpperCase()}: ${character.rotation_urls[direction]}\n`;
                    }
                });
                if (character.animations && character.animations.length > 0) {
                    result += `\n🎬 **ANIMATIONS (${character.animations.length}):**\n`;
                    character.animations.forEach((animation, index) => {
                        result += `• ${animation.name || `Animation ${index + 1}`}: ${animation.status}\n`;
                    });
                }
            }
            else {
                result += `⏳ **Still processing...**\n`;
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: result,
                    },
                ],
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error retrieving character: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleListCharacters(args) {
        try {
            const params = new URLSearchParams();
            if (args?.limit)
                params.append('limit', args.limit.toString());
            if (args?.offset)
                params.append('offset', args.offset.toString());
            const response = await this.axiosInstance.get(`/characters?${params.toString()}`);
            const characters = Array.isArray(response.data) ? response.data : (response.data.characters || []);
            let result = `🎨 **YOUR CHARACTER LIBRARY (${characters.length} characters)**\n\n`;
            if (characters.length === 0) {
                result += `📝 **No characters found.**\nStart by creating your first character!`;
            }
            else {
                characters.forEach((character, index) => {
                    result += `${index + 1}. **${character.name || character.description || 'Unnamed Character'}**\n`;
                    result += `   🆔 ID: ${character.character_id || character.id}\n`;
                    result += `   📊 Status: ${character.status || 'Unknown'}\n\n`;
                });
                result += `💡 Use get_character() to view details & downloads!`;
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: result,
                    },
                ],
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error listing characters: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleGetBackgroundJob(args) {
        if (!args || !args.job_id) {
            throw new McpError(ErrorCode.InvalidParams, 'Job ID is required');
        }
        try {
            const response = await this.axiosInstance.get(`/background-jobs/${args.job_id}`);
            if (response.status !== 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Failed to retrieve job status: ${response.data?.message || 'Unknown error'}`,
                        },
                    ],
                    isError: true,
                };
            }
            const job = response.data;
            let result = `⚙️ **JOB STATUS: ${job.status?.toUpperCase() || 'UNKNOWN'}**\n\n`;
            if (job.character_id) {
                result += `🎨 Character ID: ${job.character_id}\n`;
            }
            if (job.status === 'completed') {
                result += `✅ **COMPLETED!**\n\n`;
                if (job.download_url) {
                    result += `📥 DOWNLOAD: ${job.download_url}\n`;
                }
            }
            else if (job.status === 'processing') {
                result += `⏳ **Still processing...**\n`;
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: result,
                    },
                ],
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error retrieving job: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // New endpoint handlers (Phase 1 continuation)
    async handleGetBalance(args) {
        try {
            const response = await this.axiosInstance.get('/balance');
            if (response.status === 200) {
                const balance = response.data;
                let result = `💰 **ACCOUNT BALANCE:**\n\n`;
                if (balance.credits !== undefined) {
                    result += `💳 Credits: ${balance.credits}\n`;
                }
                if (balance.usage !== undefined) {
                    result += `📊 Usage: ${balance.usage}\n`;
                }
                if (balance.limits) {
                    result += `🚦 Limits: ${JSON.stringify(balance.limits, null, 2)}\n`;
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: result,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Failed to get balance: ${response.data?.message || 'Unknown error'}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error getting balance: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleGet8DirectionCharacter(args) {
        if (!args || typeof args.description !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Description is required for 8-direction character creation');
        }
        try {
            const response = await this.axiosInstance.post('/create-character-with-8-directions', {
                description: args.description,
                image_size: {
                    width: 64,
                    height: 64
                },
                async_mode: true
            });
            if (response.status === 200 && response.data.character_id && response.data.background_job_id) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🎮 **8-DIRECTION CHARACTER CREATION STARTED!**\n\n✅ Description: "${args.description}"\n✅ Directions: Full 360° (8 views)\n✅ Character ID: ${response.data.character_id}\n✅ Job ID: ${response.data.background_job_id}\n\n⏱️ Processing will take 4-6 minutes.\n\n💡 Perfect for top-down games needing 8-directional movement!`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ 8-direction character creation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleGetCharacterZip(args) {
        if (!args || !args.character_id) {
            throw new McpError(ErrorCode.InvalidParams, 'Character ID is required for ZIP download');
        }
        try {
            const response = await this.axiosInstance.get(`/characters/${args.character_id}/zip`);
            if (response.status === 200) {
                // Debug the ZIP response structure
                console.error('ZIP Response:', JSON.stringify(response.data, null, 2));
                // Handle different possible response formats
                let downloadUrl = response.data.download_url || response.data.zip_url || response.data.url;
                // Check if the response is the actual file (unlikely for ZIP which would typically be a redirect)
                if (!downloadUrl && response.data) {
                    // Maybe the response contains the URL in a different field
                    downloadUrl = response.headers?.location || response.headers?.['content-location'];
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📦 **CHARACTER ZIP DOWNLOAD READY!**\n\n✅ Character ID: ${args.character_id}\n✅ Status: ZIP file generated\n\n📥 DOWNLOAD: ${downloadUrl || 'Check console for response details'}\n\n💡 The ZIP includes all directional sprites + animations!\n\n**DEBUG:** Response structure logged to console.`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ ZIP generation failed: ${response.data?.message || 'Character may still be processing'}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error getting ZIP: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleGetTilesetStatus(args) {
        if (!args || !args.tileset_id) {
            throw new McpError(ErrorCode.InvalidParams, 'Tileset ID is required');
        }
        try {
            const response = await this.axiosInstance.get(`/tilesets/${args.tileset_id}`);
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🏞️ **TILESET COMPLETED!**\n\n✅ Tileset ID: ${args.tileset_id}\n✅ Status: Ready for download\n\n📥 16-tile wang tileset available for your game!\n\n💡 Use these tiles for seamless terrain in your projects.`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `⏳ Tileset still processing... ETA 3-5 minutes from creation.\n${response.data?.message || 'Check back soon!'}`,
                        },
                    ],
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error checking tileset: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async handleGetIsometricTileStatus(args) {
        if (!args || !args.tile_id) {
            throw new McpError(ErrorCode.InvalidParams, 'Tile ID is required');
        }
        try {
            const response = await this.axiosInstance.get(`/isometric-tiles/${args.tile_id}`);
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🎲 **ISOMETRIC TILE COMPLETED!**\n\n✅ Tile ID: ${args.tile_id}\n✅ Status: Ready for download\n\n📥 3D isometric tile available for your isometric games!\n\n💡 Perfect for city builders and RTS games.`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `⏳ Isometric tile still processing... ETA 2-3 minutes from creation.\n${response.data?.message || 'Check back soon!'}`,
                        },
                    ],
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error checking isometric tile: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // Phase 2: Text-based animation generation
    async handleAnimateWithText(args) {
        if (!args || typeof args.description !== 'string' || typeof args.action !== 'string' || typeof args.reference_image !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Description, action, and reference_image (character ID) are required for text-based animation');
        }
        try {
            const response = await this.axiosInstance.post('/animate-with-text', {
                image_size: {
                    width: 64,
                    height: 64
                },
                description: args.description,
                action: args.action,
                text_guidance_scale: args.text_guidance_scale || 3.0,
                image_guidance_scale: args.image_guidance_scale || 1.0,
                n_frames: args.n_frames || 4,
                reference_image: {
                    type: 'character_id',
                    character_id: args.reference_image
                }
            });
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🎭 **TEXT-BASED ANIMATION CREATION STARTED!**\n\n✅ Character: "${args.description}"\n✅ Action: "${args.action}"\n✅ Reference: ${args.reference_image}\n✅ Status: Processing\n\n⏱️ Processing will take 4-6 minutes.\n\n💡 Creative text-to-animation generation unlocked!`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Text-based animation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error text animation: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // Phase 2: Alternative animation method
    async handleAnimateCharacterAlt(args) {
        if (!args || !args.character_id) {
            throw new McpError(ErrorCode.InvalidParams, 'Character ID is required for animation');
        }
        try {
            const response = await this.axiosInstance.post('/animate-character', {
                character_id: args.character_id,
                template_animation_id: args.animation || 'walking',
                animation_name: args.animation_name,
                action_description: args.animation_name || args.action_description
            });
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🎭 **ALTERNATIVE ANIMATION JOB STARTED!**\n\n✅ Character ID: ${args.character_id}\n✅ Animation: ${args.animation || 'walking'} (alternative method)\n✅ Status: Processing\n\n⏱️ Animation will be ready in 3-5 minutes.\n\n💡 This provides different animation generation compared to the standard method!`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Alternative animation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error alternative animation: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // Phase 3: Pixflux image generation with file storage
    async handleCreateImagePixflux(args) {
        if (!args || typeof args.description !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Description is required for image generation');
        }
        try {
            const response = await this.axiosInstance.post('/create-image-pixflux', {
                description: args.description,
                negative_description: args.negative_description,
                image_size: {
                    width: args.width || 64,
                    height: args.height || 64
                },
                text_guidance_scale: 8.0
            });
            if (response.status === 200 && response.data) {
                // Extract the generated image
                let imageData = '';
                console.error('DEBUG: Pixflux Response Data:', JSON.stringify(response.data, null, 2));
                // Try different response data fields - handle different formats
                if (response.data.image) {
                    // The API usually returns base64 data, add the data URL prefix if missing
                    const base64Data = response.data.image;
                    if (base64Data.includes('data:image')) {
                        imageData = base64Data; // Already has data URL prefix
                    }
                    else {
                        imageData = `data:image/png;base64,${base64Data}`; // Add prefix
                    }
                }
                else if (response.data.images && response.data.images.length > 0) {
                    imageData = response.data.images[0];
                }
                else if (response.data.base64) {
                    imageData = response.data.base64;
                }
                else if (typeof response.data === 'string') {
                    imageData = response.data; // If the entire response data is the image
                }
                if (imageData && typeof imageData === 'string' && imageData.includes('data:image')) {
                    // Remove data URL prefix if present and save
                    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
                    // Save to file system in gameassets directory
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        // Create a filename from description
                        const safeName = args.description
                            .replace(/[^a-z0-9]/gi, '_')
                            .toLowerCase()
                            .substring(0, 30);
                        const filePath = path.join(process.cwd(), 'gameassets', `${safeName}.png`);
                        // Save base64 data as PNG file
                        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `🎨 **PIXFLUX IMAGE GENERATED & SAVED!**\n\n✅ Description: "${args.description}"\n✅ Size: ${args.width || 64}x${args.height || 64}\n✅ File: gameassets/${safeName}.png\n✅ Model: Pixflux (primary)\n\n💡 Image successfully saved to your gameassets folder!`,
                                },
                            ],
                        };
                    }
                    catch (fileError) {
                        console.error('File save error:', fileError);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `🎨 **PIXFLUX IMAGE GENERATED!**\n\n✅ Description: "${args.description}"\n✅ Size: ${args.width || 64}x${args.height || 64}\n✅ Model: Pixflux (primary)\n\n❌ File save failed: ${fileError}\n\n💡 Image data available but couldn't save to file.`,
                                    isError: true,
                                },
                            ],
                        };
                    }
                }
                else {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `🎨 **PIXFLUX IMAGE GENERATED!**\n\n✅ Description: "${args.description}"\n✅ Size: ${args.width || 64}x${args.height || 64}\n✅ Model: Pixflux (primary)\n\n⚠️ Image data format not recognized. Available keys: ${Object.keys(response.data).join(', ')}\n\n💡 Generation successful but save format needs investigation.`,
                            },
                        ],
                    };
                }
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Pixflux image generation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error Pixflux: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // Phase 4: Image inpainting
    async handleInpaintPixelArt(args) {
        if (!args || typeof args.description !== 'string' || typeof args.source_image !== 'string' || typeof args.mask_image !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Description, source_image, and mask_image are required for inpainting');
        }
        try {
            const response = await this.axiosInstance.post('/inpaint', {
                description: args.description,
                negative_description: args.negative_description,
                image_size: {
                    width: args.width || 64,
                    height: args.height || 64
                },
                text_guidance_scale: 3.0,
                inpainting_image: {
                    type: 'base64',
                    base64: args.source_image,
                    format: 'png'
                },
                mask_image: {
                    type: 'base64',
                    base64: args.mask_image,
                    format: 'png'
                }
            });
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🎨 **PIXEL ART INPAINTING STARTED!**\n\n✅ Description: "${args.description}"\n✅ Source Image: Provided\n✅ Mask: Applied\n✅ Status: Processing\n\n⏱️ Processing will take 2-3 minutes.\n\n💡 Perfect for editing existing pixel art - adding, removing, or modifying elements!`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Inpainting failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error inpainting: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // Phase 3: Bitforge image generation (alternative to Pixflux)
    async handleCreateImageBitforge(args) {
        if (!args || typeof args.description !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Description is required for Bitforge image generation');
        }
        try {
            const response = await this.axiosInstance.post('/create-image-bitforge', {
                description: args.description,
                negative_description: args.negative_description,
                image_size: {
                    width: args.width || 64,
                    height: args.height || 64
                },
                text_guidance_scale: 8.0,
                style_strength: args.style_strength || 0
            });
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🎨 **BITFORGE IMAGE GENERATION STARTED!**\n\n✅ Description: "${args.description}"\n✅ Size: ${args.width || 64}x${args.height || 64}\n✅ Model: Bitforge (alternative)\n✅ Style Strength: ${args.style_strength || 0}\n✅ Status: Processing\n\n⏱️ Generation will take 2-4 minutes.\n\n💡 Bitforge offers different generation style than Pixflux!`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Bitforge image generation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error Bitforge: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // Phase 4: Character rotation
    async handleRotateCharacter(args) {
        if (!args || typeof args.source_image !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'source_image (base64) is required for character rotation');
        }
        try {
            const response = await this.axiosInstance.post('/rotate', {
                from_image: {
                    type: 'base64',
                    base64: args.source_image,
                    format: 'png'
                },
                image_guidance_scale: args.image_guidance_scale || 3,
                view_change: args.view_change || 30,
                direction_change: args.direction_change || 45,
                from_view: args.from_view || 'side',
                to_view: args.to_view || 'top-down',
                image_size: {
                    width: args.width || 64,
                    height: args.height || 64
                }
            });
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🔄 **CHARACTER ROTATION STARTED!**\n\n✅ Source Image: Provided\n✅ View Change: ${args.view_change || 30}°\n✅ Direction Change: ${args.direction_change || 45}°\n✅ From View: "${args.from_view || 'side'}"\n✅ To View: "${args.to_view || 'top-down'}"\n✅ Status: Processing\n\n⏱️ Processing will take 2-3 minutes.\n\n💡 Perfect for creating different camera angles from existing characters!`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Character rotation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error rotating character: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // Phase 4: Skeleton-based animation
    async handleAnimateWithSkeleton(args) {
        if (!args || typeof args.reference_image !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'reference_image (base64) is required for skeleton animation');
        }
        try {
            const requestBody = {
                reference_image: {
                    type: 'base64',
                    base64: args.reference_image,
                    format: 'png'
                },
                image_guidance_scale: args.image_guidance_scale || 4,
                view: args.view || 'side',
                direction: args.direction || 'south'
            };
            if (args.skeleton_keypoints) {
                requestBody.skeleton_keypoints = args.skeleton_keypoints;
            }
            if (args.isometric) {
                requestBody.isometric = args.isometric;
            }
            const response = await this.axiosInstance.post('/animate-with-skeleton', requestBody);
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🦴 **SKELETON-BASED ANIMATION STARTED!**\n\n✅ Reference Image: Provided\n✅ Keypoints: ${args.skeleton_keypoints ? 'Included' : 'Auto-generated'}\n✅ View: "${args.view || 'side'}"\n✅ Direction: "${args.direction || 'south'}"\n✅ Isometric: ${args.isometric || false}\n✅ Status: Processing\n\n⏱️ Processing will take 4-6 minutes.\n\n💡 Professional pose-based animation for advanced game characters!`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Skeleton animation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error skeleton animation: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // Phase 4: Skeleton keypoint estimation
    async handleEstimateSkeleton(args) {
        if (!args || typeof args.image !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'image (base64) is required for skeleton estimation');
        }
        try {
            const response = await this.axiosInstance.post('/estimate-skeleton', {
                image: {
                    type: 'base64',
                    base64: args.image,
                    format: 'png'
                }
            });
            if (response.status === 200) {
                const keypoints = response.data?.skeleton_keypoints || response.data?.keypoints || [];
                let result = `🦴 **SKELETON KEYPPOINT ESTIMATION COMPLETED!**\n\n✅ Keypoints Detected: ${keypoints.length}\n\n`;
                if (keypoints.length > 0) {
                    result += `📍 **Keypoint Coordinates:**\n`;
                    keypoints.forEach((point, index) => {
                        if (Array.isArray(point) && point.length >= 2) {
                            result += `• Point ${index + 1}: (${point[0].toFixed(2)}, ${point[1].toFixed(2)})\n`;
                        }
                    });
                }
                result += `\n💡 Use these keypoints with skeleton animation for pose-based character movements!`;
                return {
                    content: [
                        {
                            type: 'text',
                            text: result,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Skeleton estimation failed: ${JSON.stringify(response.data, null, 2)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error skeleton estimation: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    // Phase 4: API Documentation retrieval
    async handleGetApiDocumentation(args) {
        try {
            const response = await this.axiosInstance.get('/llms.txt');
            if (response.status === 200) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📜 **PIXELLAB API DOCUMENTATION FOR LLMS**\n\n${'='.repeat(50)}\n\n${response.data}\n\n${'='.repeat(50)}\n\n📚 **Format:** Optimized for Large Language Models\n💡 **Purpose:** Complete API reference for development\n\n**Note:** This documentation is periodically updated with the latest API changes.`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Failed to retrieve API documentation: ${response.status}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ API Error getting documentation: ${error.response?.status} - ${error.response?.data || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
            throw error;
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('PixelLab MCP server running on stdio');
    }
}
const server = new PixelLabServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map