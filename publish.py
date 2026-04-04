#!/usr/bin/env python3
"""
publish.py — Convert a Markdown draft into a published blog post.

Usage:
    python publish.py blog/drafts/my-post.md

Markdown file format (YAML frontmatter required):

    ---
    title: Your Post Title
    date: 2026-04-03
    excerpt: A one-to-two sentence summary shown in listings and below the title.
    slug: your-post-slug
    image: your-image.png     # optional — filename relative to blog/images/
    image_alt: Alt text       # optional — describe the image for accessibility
    ---

    Your markdown content here...

What the script does:
    1. Converts markdown body to HTML and inserts it into the post template
    2. Writes blog/posts/{slug}.html
    3. Inserts a preview card at the top of blog/index.html
    4. Inserts a preview card at the top of the #blog section in index.html

Requirements:
    pip install markdown python-frontmatter
"""

import sys
import os
import re
from datetime import date, datetime

try:
    import frontmatter
except ImportError:
    sys.exit("Missing dependency: pip install python-frontmatter")

try:
    import markdown as md_lib
except ImportError:
    sys.exit("Missing dependency: pip install markdown")

ROOT = os.path.dirname(os.path.abspath(__file__))

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def fmt_date(d):
    return f"{MONTHS[d.month - 1]} {d.day}, {d.year}"


def parse_date(value):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    for fmt in ("%Y-%m-%d", "%B %d, %Y", "%b %d, %Y"):
        try:
            return datetime.strptime(str(value).strip(), fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Cannot parse date: {value!r}")


def md_to_html(text):
    """Convert markdown to HTML, indented to nest inside <article>."""
    converter = md_lib.Markdown(extensions=["extra"])
    html = converter.convert(text)
    # Add post__img class so blog.css styles inline images correctly
    html = re.sub(r"<img ", '<img class="post__img" ', html)
    # Indent every line by 8 spaces to sit cleanly inside <article class="post-body">
    return "\n".join(
        "        " + line if line.strip() else "" for line in html.splitlines()
    )


def build_post_page(title, date_obj, excerpt, body_html, slug, image, image_alt):
    date_iso = date_obj.isoformat()
    date_disp = fmt_date(date_obj)

    hero = ""
    if image:
        hero = f"""
      <img
        class="post__hero"
        src="../images/{image}"
        alt="{image_alt}"
      />"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Ilhan Esmail</title>
  <meta name="description" content="{excerpt}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../style.css" />
  <link rel="stylesheet" href="../blog.css" />
</head>
<body>

  <!-- NAVBAR -->
  <header class="navbar navbar--scrolled" id="navbar">
    <div class="navbar__inner">
      <a href="../../index.html" class="navbar__logo">Ilhan Esmail<span class="accent">.</span></a>
      <nav class="navbar__nav" id="navMenu" role="navigation">
        <ul class="navbar__list">
          <li><a href="../../index.html#about"      class="navbar__link">About</a></li>
          <li><a href="../../index.html#experience" class="navbar__link">Experience</a></li>
          <li><a href="../../index.html#skills"     class="navbar__link">Skills</a></li>
          <li><a href="../../index.html#education"  class="navbar__link">Education</a></li>
          <li><a href="../index.html"               class="navbar__link navbar__link--active">Blog</a></li>
          <li><a href="../../index.html#contact"    class="navbar__link">Contact</a></li>
        </ul>
      </nav>
      <button class="navbar__toggle" id="navToggle" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <main class="post-page">
    <div class="post-container">

      <a href="../index.html" class="post__back">← All Posts</a>

      <header class="post__header">
        <time class="post__date" datetime="{date_iso}">{date_disp}</time>
        <h1 class="post__title">{title}</h1>
        <p class="post__excerpt">{excerpt}</p>
      </header>
{hero}
      <article class="post-body">
{body_html}
      </article>

    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <p class="footer__text">&copy; 2026 Ilhan Esmail</p>
    </div>
  </footer>

  <script>
    var navToggle = document.getElementById('navToggle');
    var navMenu   = document.getElementById('navMenu');
    navToggle.addEventListener('click', function () {{
      var isOpen = navMenu.classList.toggle('navbar__nav--open');
      navToggle.classList.toggle('navbar__toggle--open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }});
    document.querySelectorAll('.navbar__link').forEach(function (link) {{
      link.addEventListener('click', function () {{
        navMenu.classList.remove('navbar__nav--open');
        navToggle.classList.remove('navbar__toggle--open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }});
    }});
  </script>
</body>
</html>"""


def build_blog_list_card(title, date_obj, excerpt, slug, image, image_alt):
    """Card for blog/index.html (.blog-list__item)."""
    date_disp = fmt_date(date_obj)
    if image:
        img_block = (
            f'<div class="blog-list__image">'
            f'<img src="images/{image}" alt="{image_alt}" /></div>'
        )
    else:
        img_block = '<div class="blog-list__image blog-list__image--placeholder"></div>'

    return f"""
        <article class="blog-list__item">
          <a href="posts/{slug}.html" class="blog-list__link">
            {img_block}
            <div class="blog-list__body">
              <time class="blog-list__date">{date_disp}</time>
              <h2 class="blog-list__title">{title}</h2>
              <p class="blog-list__excerpt">{excerpt}</p>
              <span class="blog-list__read">Read more →</span>
            </div>
          </a>
        </article>"""


def build_index_card(title, date_obj, excerpt, slug, image, image_alt):
    """Card for the #blog section in index.html (.blog-card)."""
    date_disp = fmt_date(date_obj)
    if image:
        img_block = (
            f'<div class="blog-card__image">'
            f'<img src="blog/images/{image}" alt="{image_alt}" /></div>'
        )
    else:
        img_block = '<div class="blog-card__image"></div>'

    return f"""
          <article class="blog-card fade-in">
            <a href="blog/posts/{slug}.html" class="blog-card__link">
              {img_block}
              <div class="blog-card__body">
                <time class="blog-card__date">{date_disp}</time>
                <h3 class="blog-card__title">{title}</h3>
                <p class="blog-card__excerpt">{excerpt}</p>
                <span class="blog-card__read">Read more →</span>
              </div>
            </a>
          </article>"""


def insert_after(filepath, marker, new_content):
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    if marker not in content:
        raise ValueError(f"Marker not found in {filepath}:\n  {marker!r}")
    updated = content.replace(marker, marker + new_content, 1)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(updated)


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)

    md_path = sys.argv[1]
    if not os.path.exists(md_path):
        sys.exit(f"Error: file not found: {md_path}")

    post = frontmatter.load(md_path)

    for field in ("title", "date", "excerpt", "slug"):
        if field not in post:
            sys.exit(f"Error: missing required frontmatter field '{field}'")

    title     = str(post["title"])
    date_obj  = parse_date(post["date"])
    excerpt   = str(post["excerpt"])
    slug      = str(post["slug"])
    image     = post.get("image")
    image_alt = str(post.get("image_alt", ""))

    body_html = md_to_html(post.content)

    # --- Write post page ---
    post_path = os.path.join(ROOT, "blog", "posts", f"{slug}.html")
    if os.path.exists(post_path):
        ans = input(f"blog/posts/{slug}.html already exists. Overwrite? [y/N] ").strip().lower()
        if ans != "y":
            sys.exit("Aborted.")

    with open(post_path, "w", encoding="utf-8") as f:
        f.write(build_post_page(title, date_obj, excerpt, body_html, slug, image, image_alt))
    print(f"  Created  blog/posts/{slug}.html")

    # --- Update blog/index.html ---
    insert_after(
        os.path.join(ROOT, "blog", "index.html"),
        "<!-- END TEMPLATE -->",
        build_blog_list_card(title, date_obj, excerpt, slug, image, image_alt),
    )
    print("  Updated  blog/index.html")

    # --- Update index.html ---
    insert_after(
        os.path.join(ROOT, "index.html"),
        "<!-- END TEMPLATE -->",
        build_index_card(title, date_obj, excerpt, slug, image, image_alt),
    )
    print("  Updated  index.html")

    print(f"\nPublished: blog/posts/{slug}.html")


if __name__ == "__main__":
    main()
