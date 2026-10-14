from pathlib import Path
from bs4 import BeautifulSoup
import shutil,hashlib,json,base64,re
P=Path(__file__).resolve().parents[1]/'public';root=P.parent.parent
photos=['1000017821.jpg','1000017824.jpg','1000017841.jpg']
for name in photos:shutil.copyfile(root/'photo-source'/name,P/'assets'/name)
def F(s):return BeautifulSoup(s,'html.parser')
def load(p):return F((P/p).read_text())
def save(s,p):(P/p).write_text(str(s))
def photo(name,alt):return f'<figure class="original-photo"><img src="/assets/{name}" alt="{alt}" loading="lazy"/></figure>'
# Preserve actual photos byte for byte: CSS only scales the whole original frame.
s=load('about/index.html');intro=s.select_one('.audit-founder');intro.parent.h2.decompose() if intro.parent.h2 and intro.parent.h2 not in intro.descendants else None
intro['class']=['audit-founder','about-intro'];intro.select_one('.eyebrow').string='About the founder'
intro.h1.insert_after(F('<p class="about-headline">People · Security · Progress</p>'))
# Keep the professional portrait in the introduction. Original mirror photo accompanies story.
sections=s.select('main > section');story=next(x for x in sections if x.find('h2') and x.h2.get_text()=='From engineering to advisory')
wrap=story.select_one('.reading-panel');wrap.h2.string='Curiosity, experience and a practical perspective'
copy=F('<div class="founder-story"><div class="story-copy"></div></div>').div
for p in list(wrap.find_all('p',recursive=False)):copy.select_one('.story-copy').append(p.extract())
copy.insert(0,F(photo('1000017821.jpg','Milica Vlk beside a mirror')));wrap.h2.insert_after(copy)
# A calmer strip makes the philosophy concrete without inventing personal/client history.
focus=s.select_one('#current-focus')
focus.insert_after(F('<section class="section founder-perspective"><div class="wrap reading-panel"><div class="perspective-layout"><div><p class="eyebrow">Behind the work</p><h2>A balanced perspective</h2><p>Technical depth, curiosity and clear communication connect Milica’s engineering background with the advisory work offered through VLK InfoSec Consulting.</p><div class="perspective-values"><p><strong>Direction</strong><br>Understand the decision and its business context.</p><p><strong>Structure</strong><br>Clarify responsibilities, evidence and next steps.</p><p><strong>Assurance</strong><br>Review progress and make limitations visible.</p></div><a class="text-link" href="/how-we-work/">How this shapes an engagement →</a></div><div class="original-gallery">'+photo('1000017824.jpg','Portrait of Milica Vlk')+photo('1000017841.jpg','Milica Vlk seated')+'</div></div></div></section>'))
save(s,'about/index.html')
# Homepage retains professional founder portrait, with a compact original-photo panel.
s=load('index.html');founder=s.select_one('.audit-founder');founder.insert_after(F('<div class="home-photo-story">'+photo('1000017821.jpg','Milica Vlk beside a mirror')+'<div><p class="eyebrow">Meet the founder</p><h3>The perspective behind the work</h3><p>Explore the professional journey, recent learning and approach behind VLK InfoSec Consulting.</p><a class="text-link" href="/about/">Meet Milica →</a></div></div>'));save(s,'index.html')
# A human point of contact on process and enquiry pages; no decorative photo repetition on policies.
for route,heading in [('how-we-work/index.html','A direct conversation with the founder'),('start/index.html','Your point of contact')]:
 s=load(route);s.main.append(F('<section class="section"><div class="wrap reading-panel contact-person">'+photo('1000017824.jpg','Portrait of Milica Vlk')+f'<div><p class="eyebrow">{heading}</p><h2>Milica Vlk</h2><p>Founder · VLK InfoSec Consulting</p><p>Initial enquiries help establish the business need, the right scope and whether an engagement is a good fit.</p><a class="text-link" href="/about/">About Milica →</a></div></div></section>'));save(s,route)
# Split cybersecurity from project management using existing explicit career context.
s=load('bio/index.html');rec=s.select_one('#recommendations');rec.h2.string='Recommendations from colleagues and collaborators'
outer=rec.select_one('.chapter-expand')
if outer:
 content=outer.select_one('.chapter-content');outer.replace_with(content);content.unwrap()
cyber=F('<section class="recommendation-chapter" id="recommendations-cyber"><header class="recommendation-chapter-heading"><div class="eyebrow">2024–2025</div><h3>Cyber Security Engineering & Product Management</h3></header><div class="testimonials-grid bio-testimonials"></div></section>').section
pm=s.select_one('#recommendations-4');pm.select_one('header h3').string='Project Management & Delivery';pm.select_one('header .eyebrow').string='TeleGroup · Project delivery'
for a in list(pm.select('.testimonial')):
 if a.h3.get_text(strip=True) in ['Aleksandar Radivojevic','Tamara Velanac']:cyber.select_one('.testimonials-grid').append(a.extract())
pm.insert_after(cyber)
s.select_one('#recommendations-1 header h3').string='IP Television Services · Systems & Network Engineering'
s.select_one('#recommendations-2 header h3').string='Radio Network Optimization & Software Engineering'
s.select_one('#recommendations-3 header h3').string='Systems Engineering & Team Leadership'
# Role navigation matches the actual sections; no hard-coded count.
nav=F('<nav class="recommendation-jumps" aria-label="Recommendations by Milica’s role"></nav>').nav
for sec in rec.select('.recommendation-chapter'):
 h=sec.select_one('header h3')
 if h:nav.append(F('<a href="#'+sec['id']+'">'+h.get_text()+'</a>'))
rec.h2.insert_after(nav);save(s,'bio/index.html')
# Author before quote on every page. Preserve exact full quote text.
for p in P.rglob('*.html'):
 s=F(p.read_text())
 for h in s.find_all(['h1','h2','h3','summary']):
  if h.string:h.string=re.sub(r'\b16 recommendations\b','Recommendations',h.string,flags=re.I)
 for card in s.select('.testimonial'):
  h=card.find('h3');role=card.select_one('.testimonial-role');period=card.select_one('.testimonial-period');quote=card.find('blockquote')
  if not h or not quote:continue
  author=F('<header class="recommendation-author"></header>').header;author.append(h.extract())
  if role:author.append(role.extract())
  card.insert(0,author)
  if period:author.insert_after(period.extract())
  # Full Bio already has full text in a disclosure; show one verbatim paragraph initially.
  detail=card.find('details');paragraphs=quote.find_all('p')
  if detail and len(paragraphs)>1:
   for q in paragraphs[1:]:q.decompose()
 # About/Home recommendations are explicitly grouped by the user's role.
 if p.parent.name=='about' or p==P/'index.html':
  for grid in s.select('.testimonials-grid'):
   cards=list(grid.select(':scope > .testimonial'))
   for i,card in enumerate(cards):
    per=card.select_one('.testimonial-period');label=per.get_text(' ',strip=True).replace('Milica’s career chapter','').strip() if per else 'Professional collaboration'
    group=F('<section class="recommendation-role-group"><h3>'+label+'</h3></section>').section
    card.replace_with(group);group.append(card)
 for x in s.select('link[href],script[src]'):
  attr='src' if x.name=='script' else 'href';x[attr]=re.sub(r'\?v=\d+','?v=34',x[attr])
 p.write_text(str(s))
# Refresh CSP hashes after any inline JSON updates (text currently unchanged).
hashes=[]
for p in P.rglob('*.html'):
 for x in F(p.read_text()).select('script:not([src])'):hashes.append("'sha256-"+base64.b64encode(hashlib.sha256(x.string.encode()).digest()).decode()+"'")
h=(P/'_headers').read_text();h=re.sub(r"script-src 'self'.*?https://challenges.cloudflare.com;","script-src 'self' "+' '.join(sorted(set(hashes)))+' https://challenges.cloudflare.com;',h);(P/'_headers').write_text(h)
manifest={name:hashlib.sha256((P/'assets'/name).read_bytes()).hexdigest() for name in photos}
assert all((P/'assets'/n).read_bytes()==(root/'photo-source'/n).read_bytes() for n in photos)
(P.parent/'ORIGINAL-PHOTOS.json').write_text(json.dumps(manifest,indent=2))
