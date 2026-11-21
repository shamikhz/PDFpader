import os
import subprocess
from PIL import Image

def generate_favicons():
    chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
    if not os.path.exists(chrome_path):
        chrome_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

    # Master SVG representation matching the website icon
    # - Rounded-xl squircle
    # - Gradient from-brand-600 (#ea580c) via-orange-500 (#f97316) to-amber-500 (#f59e0b)
    # - White Lucide FileCheck2 icon centered (w-5 inside w-9 = 55.5% scale)
    svg_body = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="50%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <!-- Rounded-xl squircle (33.3% corner radius) -->
  <rect x="16" y="16" width="480" height="480" rx="120" ry="120" fill="url(#brandGrad)" />
  <!-- Crisp white Lucide FileCheck2 icon -->
  <g transform="translate(114, 114) scale(11.833)" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m3 15 2 2 4-4" />
  </g>
</svg>"""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: 512px; height: 512px; background: transparent; overflow: hidden; }}
  svg {{ width: 512px; height: 512px; display: block; }}
</style>
</head>
<body>
{svg_body}
</body>
</html>"""

    temp_html = os.path.abspath('temp_icon_render.html')
    temp_master_png = os.path.abspath('temp_master_512.png')

    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print("Rendering 512x512 transparent master PNG via headless browser...")
    file_url = 'file:///' + temp_html.replace('\\', '/')
    subprocess.run([
        chrome_path,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--default-background-color=00000000',
        '--window-size=512,512',
        f'--screenshot={temp_master_png}',
        file_url
    ], check=True)

    if not os.path.exists(temp_master_png):
        raise RuntimeError("Failed to generate master screenshot!")

    master_img = Image.open(temp_master_png).convert('RGBA')
    print(f"Master image loaded: {master_img.size}, mode={master_img.mode}")

    # Verify transparency outside squircle
    corner_pixel = master_img.getpixel((0, 0))
    print(f"Top-left corner pixel (should be transparent): {corner_pixel}")

    # Generate resized variations
    sizes = {
        'icon_512': master_img.resize((512, 512), Image.Resampling.LANCZOS),
        'icon_192': master_img.resize((192, 192), Image.Resampling.LANCZOS),
        'apple_180': master_img.resize((180, 180), Image.Resampling.LANCZOS),
    }

    # Ensure public directory exists
    os.makedirs('public', exist_ok=True)

    # 1. Write vector SVGs to public/
    for p in ['public/icon.svg', 'public/apple-icon.svg']:
        with open(p, 'w', encoding='utf-8') as f:
            f.write(svg_body)
        print(f"✓ Saved vector SVG: {p}")

    # 2. Write PNGs to public/
    for p in ['public/icon.png']:
        sizes['icon_512'].save(p, format='PNG', optimize=True)
        print(f"✓ Saved 512x512 PNG: {p}")

    for p in ['public/apple-icon.png']:
        sizes['apple_180'].save(p, format='PNG', optimize=True)
        print(f"✓ Saved 180x180 Apple Touch Icon: {p}")

    # 3. Create true multi-resolution ICO (16, 32, 48, 64, 128, 256)
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    for p in ['public/favicon.ico']:
        master_img.save(p, format='ICO', sizes=ico_sizes)
        print(f"✓ Saved multi-resolution ICO: {p}")

    # Cleanup temporary files
    if os.path.exists(temp_html):
        os.remove(temp_html)
    if os.path.exists(temp_master_png):
        os.remove(temp_master_png)
    if os.path.exists('test_icon.html'):
        os.remove('test_icon.html')

    print("\nALL FAVICONS AND WEB ICONS SUCCESSFULLY SYNCHRONIZED AND GENERATED!")

if __name__ == '__main__':
    generate_favicons()
