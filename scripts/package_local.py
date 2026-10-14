from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlsplit,unquote
import shutil,os,zipfile
root=Path(__file__).resolve().parents[2];src=root/'vlk-preview';dest=root/'VLK-Local-Preview'
shutil.copytree(src,dest/'website',dirs_exist_ok=True,ignore=shutil.ignore_patterns('.git'))
shutil.copytree(src/'public',dest/'preview',dirs_exist_ok=True)
for p in (dest/'preview').rglob('*.html'):
 s=BeautifulSoup(p.read_text(),'html.parser');s.select_one('meta[name=robots]')['content']='noindex,nofollow'
 for x in s.select('[href],[src]'):
  for attr in ['href','src']:
   v=x.get(attr,'')
   if not v.startswith('/') or v.startswith('//'):continue
   u=urlsplit(v);path=u.path.lstrip('/');path=path+'index.html' if not path or path.endswith('/') else path
   x[attr]=os.path.relpath(dest/'preview'/path,p.parent)+('?' +u.query if u.query else '')+('#'+u.fragment if u.fragment else '')
 s.body.insert(0,BeautifulSoup('<div style="padding:8px;text-align:center;background:#fff2d4;color:#2b1944;font:14px system-ui">LOCAL PREVIEW · Original photographs · Email demo: 123456 · No messages sent</div>','html.parser'))
 p.write_text(str(s))
p=dest/'OTVORI-PREVIEW.html';s=BeautifulSoup(p.read_text(),'html.parser');s.h1.string='VLK InfoSec Consulting — preview sa originalnim fotografijama';s.h1.insert_after(BeautifulSoup('<p>Fotografije iz drugog četa dodate su u Home, About, How We Work i kontakt. Originalni JPG fajlovi su neizmenjeni, prikazani u celom kadru. Preporuke su bez ukupnog broja, grupisane po ulogama, sa autorom na vrhu.</p>','html.parser'));p.write_text(str(s))
errors=[]
for f in (dest/'preview').rglob('*.html'):
 s=BeautifulSoup(f.read_text(),'html.parser')
 for a in s.select('[href],[src]'):
  for attr in ['href','src']:
   v=a.get(attr,'');u=urlsplit(v)
   if not v or u.scheme or v.startswith('//'):continue
   t=(f.parent/unquote(u.path)).resolve() if u.path else f.resolve()
   if not t.exists():errors.append((str(f),v))
   elif u.fragment and t.suffix=='.html' and not BeautifulSoup(t.read_text(),'html.parser').find(id=u.fragment):errors.append(('anchor',str(f),v))
assert not errors,errors
for n in ['1000017821.jpg','1000017824.jpg','1000017841.jpg']:assert (dest/'preview/assets'/n).read_bytes()==(root/'photo-source'/n).read_bytes()
with zipfile.ZipFile(root/'VLK-Website-Local-Preview.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in dest.rglob('*'):
  if f.is_file():z.write(f,f.relative_to(root))
print('PASS: all links/anchors and byte-identical original photos; packaged complete site')
