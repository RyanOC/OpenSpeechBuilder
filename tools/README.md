# Development Tools

This directory contains utility scripts and tools for Open Speech Builder development.

## Scripts

### `png_to_image_designer.py` ✅ **Recommended**
Converts PNG images to the exact format expected by the Image Designer.

**Usage:**
```bash
python tools/png_to_image_designer.py input.png "My Icon"
python tools/png_to_image_designer.py heart.png
```

**Features:**
- ✅ Creates correct Image Designer format with `{name, data}` structure
- ✅ Handles transparency properly (0 for transparent pixels)
- ✅ Supports full color images (hex colors)
- ✅ Automatically resizes to 16x16 pixels
- ✅ Ready to import into Image Designer

### `pixel-array.py` ⚠️ **Legacy**
Your original script - creates color grids but not in Image Designer format.

**Requirements:**
- Python 3.x
- PIL/Pillow library (`pip install Pillow`)

**Output:**
- JSON file ready for Image Designer import
- Includes usage instructions

## Adding New Tools

When adding new development tools:
1. Place them in this `tools/` directory
2. Add documentation to this README
3. Include any requirements or dependencies
4. Provide usage examples