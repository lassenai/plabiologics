"""Rebuild distributable data and offline HTML; needs Python standard library only."""
from pathlib import Path
import base64
import re
root=Path(__file__).resolve().parents[1]
source=root/'work/demo_data.json'
if source.exists():
    (root/'assets/data.js').write_text('window.PLAB_DATA = '+source.read_text(encoding='utf-8')+';\n',encoding='utf-8')
html=re.sub(r'\?v=[^\"]+', '', (root/'index.html').read_text(encoding='utf-8'))
html=html.replace('<link rel="stylesheet" href="assets/app.css">','<style>'+(root/'assets/app.css').read_text(encoding='utf-8')+'</style>')
for script in ['i18n','data','app','research-analysis','research']:
    html=html.replace(f'<script src="assets/{script}.js"></script>','<script>'+(root/f'assets/{script}.js').read_text(encoding='utf-8')+'</script>')
for n in [1,5]:
    path=f'assets/research/kim2020-fig{n}.png'
    html=html.replace(path,'data:image/png;base64,'+base64.b64encode((root/path).read_bytes()).decode())
html=html.replace('src="assets/plabiologics-logo.png"','src="data:image/png;base64,'+base64.b64encode((root/'assets/plabiologics-logo.png').read_bytes()).decode()+'"')
(root/'outputs').mkdir(exist_ok=True)
(root/'outputs/plab-ai-proposal.html').write_text(html,encoding='utf-8')
print('Built offline MVP and packaged sample data.')
