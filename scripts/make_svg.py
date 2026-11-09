import base64

with open('D:/sullia-jewellery/client/public/sparkle-logo-256.webp', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 256">
  <image width="256" height="256" href="data:image/webp;base64,{b64}" />
</svg>'''

with open('D:/sullia-jewellery/client/public/favicon.svg', 'w') as f:
    f.write(svg)
with open('D:/sullia-jewellery/client/app/icon.svg', 'w') as f:
    f.write(svg)
print('Vector SVGs updated with real logo emblem')
