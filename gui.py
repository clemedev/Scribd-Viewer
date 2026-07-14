import re
import tkinter as tk
from tkinter import messagebox


def extract_doc_id(url):
    # FIX: supports BOTH /document/ and /doc/
    match = re.search(r"scribd\.com/(?:document|doc)/(\d+)", url)
    return match.group(1) if match else None


def build_embed_url(doc_id):
    return "https://www.scribd.com/embeds/{}/content?start_page=1&view_mode=scroll".format(doc_id)


def generate():
    url = entry.get().strip()

    doc_id = extract_doc_id(url)

    if not doc_id:
        messagebox.showerror("Error", "Invalid Scribd URL")
        return

    embed_url = build_embed_url(doc_id)

    output_var.set(embed_url)

    # update clickable label
    link_label.config(text="Open Embed Link (internal)", fg="blue")


def open_internal():
    url = output_var.get().strip()

    if not url:
        messagebox.showwarning("Warning", "No link generated yet")
        return

    # instead of browser, show in popup window
    popup = tk.Toplevel(root)
    popup.title("Embed URL")
    popup.geometry("600x100")

    tk.Label(popup, text=url, wraplength=580, justify="left").pack(pady=20)


# ---------------- GUI ----------------

root = tk.Tk()
root.title("Scribd Embed Generator")
root.geometry("600x220")
root.resizable(False, False)

tk.Label(root, text="Scribd URL:").pack(pady=5)

entry = tk.Entry(root, width=80)
entry.pack(pady=5)

tk.Button(root, text="Generate", command=generate).pack(pady=5)

output_var = tk.StringVar()

tk.Label(root, text="Generated Embed URL:").pack(pady=5)

tk.Entry(root, textvariable=output_var, width=80).pack(pady=5)

link_label = tk.Label(root, text="", fg="blue", cursor="hand2")
link_label.pack(pady=5)
link_label.bind("<Button-1>", lambda e: open_internal())

root.mainloop()
