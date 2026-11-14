#!/usr/bin/env python3
"""
Download looksmax.org threads from the Internet Archive's Wayback Machine.

The live forum sits behind a Cloudflare bot check, so this uses the public archive
instead: it lists every archived thread URL (CDX API), then downloads each thread's
archived copy and extracts the posts. Standard library only; resumable; polite.

Usage:
  python3 download_looksmax_archive.py                         # everything (slow — days)
  python3 download_looksmax_archive.py --match "mewing|bonesmash" --limit 500
  python3 download_looksmax_archive.py --list-only             # just build the thread index

Output (default ./looksmax_archive/):
  threads.tsv            id <tab> slug <tab> timestamp <tab> url   (the index)
  threads/<id>.json      {"id","title","url","archived","posts":[{"author","text"}]}
  html/<id>.html         raw archived page (skip with --no-html)
"""
import argparse, html, json, os, re, sys, time, urllib.parse, urllib.request

UA = "Mozilla/5.0 (compatible; personal-archive-reader/1.0)"
CDX = "https://web.archive.org/cdx/search/cdx"


def fetch(url, timeout=120, tries=5, delay=1.5):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                body = r.read().decode("utf-8", "replace")
                if "Temporarily Offline" not in body[:3000]:
                    time.sleep(delay)
                    return body
        except Exception as e:  # network error, 429, 5xx
            print(f"  retry {i + 1}/{tries}: {e}", file=sys.stderr)
        time.sleep(15 * (i + 1))
    return None


def build_index(out, delay):
    """Page through the CDX index of looksmax.org/threads/* with resume keys."""
    tsv, keyfile = os.path.join(out, "threads.tsv"), os.path.join(out, "cdx.resume")
    seen = set()
    if os.path.exists(tsv):
        with open(tsv) as f:
            seen = {line.split("\t")[0] for line in f if line.strip()}
    key = open(keyfile).read().strip() if os.path.exists(keyfile) else ""
    if key == "DONE":
        return tsv
    while True:
        q = {"url": "looksmax.org/threads/", "matchType": "prefix", "collapse": "urlkey",
             "fl": "original,timestamp", "filter": "statuscode:200", "limit": "20000", "showResumeKey": "true"}
        if key:
            q["resumeKey"] = key
        body = fetch(CDX + "?" + urllib.parse.urlencode(q), timeout=300, delay=delay)
        if body is None:
            print("CDX request failed — rerun later to resume.")
            return tsv
        lines = body.split("\n")
        rows, nxt = [], ""
        for i, line in enumerate(lines):
            if line == "" and i + 1 < len(lines) and lines[i + 1] and not lines[i + 1].startswith("http"):
                nxt = lines[i + 1].strip()
                break
            m = re.match(r"(\S*looksmax\.org/threads/([^/?#\s]+?)\.(\d+)/\S*)\s+(\d+)", line)
            if m and m.group(3) not in seen:
                seen.add(m.group(3))
                base = f"https://looksmax.org/threads/{m.group(2)}.{m.group(3)}/"
                rows.append(f"{m.group(3)}\t{m.group(2)}\t{m.group(4)}\t{base}")
        with open(tsv, "a") as f:
            f.write("".join(r + "\n" for r in rows))
        print(f"index: +{len(rows)} threads (total {len(seen)})")
        if not nxt:
            open(keyfile, "w").write("DONE")
            return tsv
        key = nxt
        open(keyfile, "w").write(key)


def text_of(fragment):
    t = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", fragment, flags=re.I)
    t = re.sub(r"<br\s*/?>|</(p|div|li|blockquote)>", "\n", t, flags=re.I)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\n\s*\n+", "\n\n", re.sub(r"[ \t]+", " ", t)).strip()


def parse_thread(page):
    title = re.search(r'<h1 class="p-title-value">([\s\S]*?)</h1>', page)
    posts = []
    for m in re.finditer(r'<article[^>]+data-author="([^"]*)"[\s\S]*?<div class="bbWrapper">([\s\S]*?)</div>\s*(?:<div class="js-selectToQuote|</article>|<div class="message-lastEdit)', page):
        posts.append({"author": html.unescape(m.group(1)), "text": text_of(m.group(2))})
    return (text_of(title.group(1)) if title else None), posts


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default="looksmax_archive")
    ap.add_argument("--match", help="only threads whose URL slug matches this regex, e.g. 'mewing|canthal'")
    ap.add_argument("--limit", type=int, default=0, help="stop after N threads (0 = no limit)")
    ap.add_argument("--delay", type=float, default=1.5, help="seconds between requests (be polite)")
    ap.add_argument("--list-only", action="store_true", help="only build threads.tsv")
    ap.add_argument("--no-html", action="store_true", help="don't keep raw HTML")
    a = ap.parse_args()
    os.makedirs(os.path.join(a.out, "threads"), exist_ok=True)
    if not a.no_html:
        os.makedirs(os.path.join(a.out, "html"), exist_ok=True)

    tsv = build_index(a.out, a.delay)
    if a.list_only or not os.path.exists(tsv):
        return
    rx = re.compile(a.match, re.I) if a.match else None
    done = 0
    with open(tsv) as f:
        rows = [line.rstrip("\n").split("\t") for line in f if line.strip()]
    for tid, slug, ts, url in rows:
        if rx and not rx.search(slug):
            continue
        dest = os.path.join(a.out, "threads", tid + ".json")
        if os.path.exists(dest):
            continue
        page = fetch(f"https://web.archive.org/web/{ts}id_/{url}", delay=a.delay)
        if page is None:
            continue
        title, posts = parse_thread(page)
        archived = f"https://web.archive.org/web/{ts}/{url}"
        json.dump({"id": tid, "title": title or slug.replace("-", " "), "url": url, "archived": archived, "posts": posts},
                  open(dest, "w"), ensure_ascii=False, indent=1)
        if not a.no_html:
            open(os.path.join(a.out, "html", tid + ".html"), "w").write(page)
        done += 1
        print(f"[{done}] {title or slug} — {len(posts)} posts")
        if a.limit and done >= a.limit:
            break


if __name__ == "__main__":
    main()
