import os
import json
import sys
from PIL import Image

def png_to_image_designer(image_path, image_name=None):
    """
    Convert a PNG image to Image Designer format.
    
    Args:
        image_path: Path to the PNG file
        image_name: Optional name for the image (defaults to filename)
    
    Returns:
        dict: Image data in Image Designer format
    """
    # Resolve absolute paths for clarity
    abs_image_path = os.path.abspath(image_path)
    print(f"[info] Processing: {abs_image_path}")

    if not os.path.isfile(abs_image_path):
        raise FileNotFoundError(f"Image not found at: {abs_image_path}")

    # Load image and resize to 16x16
    img = Image.open(abs_image_path).convert("RGBA")
    img = img.resize((16, 16), Image.Resampling.NEAREST)  # Use nearest neighbor for pixel art
    
    # Get image name
    if image_name is None:
        image_name = os.path.splitext(os.path.basename(abs_image_path))[0]
    
    # Convert to pixel data
    pixels = list(img.getdata())
    
    # Create 16x16 grid
    data = []
    for row in range(16):
        row_data = []
        for col in range(16):
            pixel_index = row * 16 + col
            r, g, b, a = pixels[pixel_index]
            
            # Handle transparency
            if a == 0:
                row_data.append(0)  # Transparent = 0 (number, not string)
            else:
                # Convert to hex color
                hex_color = f"#{r:02X}{g:02X}{b:02X}"
                row_data.append(hex_color)
        
        data.append(row_data)
    
    # Create Image Designer format
    image_data = {
        "name": image_name,
        "data": data
    }
    
    # Save output file
    image_dir = os.path.dirname(abs_image_path)
    base_name = os.path.splitext(os.path.basename(abs_image_path))[0]
    output_path = os.path.join(image_dir, f"{base_name}_image_designer.json")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(image_data, f, indent=2)
    
    print(f"[ok] Created Image Designer format: {output_path}")
    print(f"[info] Image name: '{image_name}'")
    print(f"[info] Size: 16x16 pixels")
    
    # Show usage instructions
    print("\n[usage] To use in Image Designer:")
    print("1. Copy the JSON content")
    print("2. Go to Image Designer > JSON View")
    print("3. Paste into the 'Import Image Library' section")
    print("4. Or manually add to your soundboard config's imageLibrary")
    
    return image_data, output_path

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print("Usage: python png_to_image_designer.py <image_path> [image_name]")
            print("Example: python png_to_image_designer.py icons/heart.png 'Heart Icon'")
            sys.exit(1)
        
        image_path = sys.argv[1]
        image_name = sys.argv[2] if len(sys.argv) > 2 else None
        
        image_data, output_path = png_to_image_designer(image_path, image_name)
        
        # Optional: open the folder automatically
        try:
            if sys.platform.startswith("win"):
                os.startfile(os.path.dirname(output_path))
            elif sys.platform == "darwin":
                os.system(f'open "{os.path.dirname(output_path)}"')
        except Exception as e:
            print(f"[info] Could not auto-open folder: {e}")
            
    except Exception as e:
        print(f"[error] {e}")
        sys.exit(1)