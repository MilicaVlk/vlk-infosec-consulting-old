from pathlib import Path
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[1] / "public"
errors = []

for page in root.rglob("*.html"):
    soup = BeautifulSoup(page.read_text(encoding="utf-8"), "html.parser")
    if not soup.title or not soup.title.get_text(strip=True):
        errors.append(f"missing title: {page.relative_to(root)}")
    if not soup.select_one('meta[name="description"]'):
        errors.append(f"missing description: {page.relative_to(root)}")

about = root / "about/index.html"
soup = BeautifulSoup(about.read_text(encoding="utf-8"), "html.parser")
section = soup.select_one("section.founder-perspective")
if section and section.find("img"):
    errors.append("Behind the work still contains an image")

for required in ("robots.txt", "sitemap.xml", "favicon.ico"):
    if not (root / required).exists():
        errors.append(f"missing SEO asset: {required}")

if errors:
    raise SystemExit("FAIL\n" + "\n".join(errors))
print("PASS: titles, descriptions, SEO assets and Behind the work image removal verified")
