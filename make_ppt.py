#!/usr/bin/env python3
"""
PMNA Perks — Professional PowerPoint Generator
Creates a polished, dark-themed presentation about the project.
"""

import io
import sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import os

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "PMNA_Perks_Presentation.pptx")

# ── Color Palette ──────────────────────────────────────────────────────────────
BG_DARK      = RGBColor(0x0A, 0x0A, 0x1A)   # deep navy
BG_CARD      = RGBColor(0x10, 0x10, 0x2A)   # card bg
ACCENT_CYAN  = RGBColor(0x00, 0xD4, 0xFF)   # neon cyan
ACCENT_PURP  = RGBColor(0x8B, 0x5C, 0xF6)   # violet
ACCENT_GOLD  = RGBColor(0xF5, 0xA6, 0x23)   # golden yellow
WHITE        = RGBColor(0xFF, 0xFF, 0xFF)
GRAY         = RGBColor(0xA0, 0xA0, 0xC0)
GREEN        = RGBColor(0x22, 0xC5, 0x5E)
RED          = RGBColor(0xEF, 0x44, 0x44)

SLIDE_W = Inches(13.33)
SLIDE_H = Inches(7.5)


def make_prs():
    prs = Presentation()
    prs.slide_width  = SLIDE_W
    prs.slide_height = SLIDE_H
    return prs


def fill_bg(slide, color=BG_DARK):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_rect(slide, l, t, w, h, color, transparency=0):
    shape = slide.shapes.add_shape(1, l, t, w, h)  # MSO_SHAPE_TYPE.RECTANGLE
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    return shape


def add_label(slide, text, l, t, w, h, font_size=14, bold=False, color=WHITE,
              align=PP_ALIGN.LEFT, italic=False):
    txBox = slide.shapes.add_textbox(l, t, w, h)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    run.font.name = "Calibri"
    return txBox


def add_accent_line(slide, t, color=ACCENT_CYAN, w_frac=0.15):
    add_rect(slide, Inches(0.5), t, Inches(13.33 * w_frac), Inches(0.04), color)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 1 — TITLE
# ══════════════════════════════════════════════════════════════════════════════
def slide_title(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
    fill_bg(slide)

    # Full-width gradient bar at top
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), ACCENT_CYAN)

    # Side accent bar
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, ACCENT_PURP)

    # Logo block
    add_rect(slide, Inches(0.5), Inches(1.2), Inches(1.8), Inches(1.8), ACCENT_PURP)
    add_label(slide, "PMNA", Inches(0.5), Inches(1.3), Inches(1.8), Inches(0.8),
              font_size=34, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_label(slide, "PERKS", Inches(0.5), Inches(1.9), Inches(1.8), Inches(0.6),
              font_size=18, bold=True, color=ACCENT_CYAN, align=PP_ALIGN.CENTER)

    # Main title
    add_label(slide, "PMNA PERKS", Inches(2.6), Inches(1.2), Inches(10), Inches(1.2),
              font_size=54, bold=True, color=WHITE)
    add_label(slide, "Hyperlocal Commerce & Offer Discovery Platform",
              Inches(2.6), Inches(2.4), Inches(10), Inches(0.7),
              font_size=22, color=ACCENT_CYAN)

    add_accent_line(slide, Inches(3.25), ACCENT_GOLD, 0.6)

    add_label(slide, "Perinthalmanna  •  Angadipuram  •  Kerala",
              Inches(2.6), Inches(3.5), Inches(9), Inches(0.5),
              font_size=16, color=GRAY)

    add_label(slide, "ASVI Softworks  |  Hojathon S1  |  2026",
              Inches(2.6), Inches(4.0), Inches(9), Inches(0.5),
              font_size=14, color=GRAY, italic=True)

    # Bottom pill badges
    badges = [("React + Vite", ACCENT_PURP), ("Node.js + Express", ACCENT_CYAN),
              ("MongoDB", GREEN), ("Python ML", ACCENT_GOLD), ("Gemini AI", RED)]
    x = Inches(0.5)
    for label, col in badges:
        add_rect(slide, x, Inches(6.5), Inches(1.9), Inches(0.55), col)
        add_label(slide, label, x, Inches(6.52), Inches(1.9), Inches(0.5),
                  font_size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        x += Inches(2.05)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), ACCENT_PURP)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 2 — PROBLEM STATEMENT
# ══════════════════════════════════════════════════════════════════════════════
def slide_problem(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill_bg(slide)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), RED)
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, RED)

    add_label(slide, "THE PROBLEM", Inches(0.5), Inches(0.2), Inches(10), Inches(0.6),
              font_size=11, bold=True, color=RED)
    add_label(slide, "Local shops are invisible to customers",
              Inches(0.5), Inches(0.7), Inches(12.5), Inches(0.9),
              font_size=36, bold=True, color=WHITE)
    add_accent_line(slide, Inches(1.65), RED, 0.3)

    problems = [
        ("No Digital Presence",       "Thousands of small shops in Perinthalmanna & Angadipuram have no online platform to showcase deals."),
        ("Missed Deals",              "Customers don't know about daily specials, flash sales, and festival offers from nearby shops."),
        ("No Verified Discovery",     "No hyperlocal, trust-based platform where customers can find verified, authentic local merchants."),
        ("Merchant Isolation",        "Shop owners have no tools to manage promotions, track views, or advertise to local audiences."),
    ]

    for i, (title, desc) in enumerate(problems):
        y = Inches(2.0) + i * Inches(1.18)
        add_rect(slide, Inches(0.5), y, Inches(12.3), Inches(1.05), BG_CARD)
        add_rect(slide, Inches(0.5), y, Inches(0.06), Inches(1.05), RED)
        add_label(slide, title, Inches(0.75), y + Inches(0.05), Inches(3.5), Inches(0.4),
                  font_size=14, bold=True, color=RED)
        add_label(slide, desc, Inches(0.75), y + Inches(0.45), Inches(11.8), Inches(0.55),
                  font_size=12, color=GRAY)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), RED)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 3 — SOLUTION OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════
def slide_solution(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill_bg(slide)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), GREEN)
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, GREEN)

    add_label(slide, "THE SOLUTION", Inches(0.5), Inches(0.2), Inches(10), Inches(0.6),
              font_size=11, bold=True, color=GREEN)
    add_label(slide, "PMNA Perks — One Platform, Every Local Deal",
              Inches(0.5), Inches(0.7), Inches(12.5), Inches(0.9),
              font_size=32, bold=True, color=WHITE)
    add_accent_line(slide, Inches(1.65), GREEN, 0.4)

    cols = [
        ("For Customers\n(Free)", [
            "Browse verified local deals",
            "Filter by category, price, location",
            "AI chatbot to find offers fast",
            "Flash deals & ending-soon alerts",
        ], ACCENT_CYAN),
        ("For Merchants", [
            "Register & manage store profile",
            "Create & publish promotions",
            "Upload photos with Multer",
            "Showcase Ads for max visibility",
        ], ACCENT_PURP),
        ("For Platform", [
            "Admin verification dashboard",
            "Real-time analytics & reports",
            "Subscription & payment tracking",
            "Python ML chatbot training",
        ], ACCENT_GOLD),
    ]

    for i, (title, pts, col) in enumerate(cols):
        x = Inches(0.5) + i * Inches(4.28)
        add_rect(slide, x, Inches(2.0), Inches(4.0), Inches(5.0), BG_CARD)
        add_rect(slide, x, Inches(2.0), Inches(4.0), Inches(0.5), col)
        add_label(slide, title, x, Inches(2.05), Inches(4.0), Inches(0.45),
                  font_size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        for j, pt in enumerate(pts):
            y = Inches(2.65) + j * Inches(0.7)
            add_rect(slide, x + Inches(0.2), y + Inches(0.15), Inches(0.12), Inches(0.12), col)
            add_label(slide, pt, x + Inches(0.45), y, Inches(3.4), Inches(0.6),
                      font_size=12, color=GRAY)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), GREEN)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 4 — TECH STACK
# ══════════════════════════════════════════════════════════════════════════════
def slide_tech(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill_bg(slide)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), ACCENT_PURP)
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, ACCENT_PURP)

    add_label(slide, "TECHNOLOGY STACK", Inches(0.5), Inches(0.2), Inches(10), Inches(0.6),
              font_size=11, bold=True, color=ACCENT_PURP)
    add_label(slide, "Full-Stack Architecture",
              Inches(0.5), Inches(0.7), Inches(12.5), Inches(0.9),
              font_size=36, bold=True, color=WHITE)
    add_accent_line(slide, Inches(1.65), ACCENT_PURP, 0.25)

    layers = [
        ("FRONTEND", [
            ("React 18 + Vite",        "Fast SPA with HMR dev server"),
            ("Tailwind CSS",           "Utility-first responsive styling"),
            ("React Router v6",        "Client-side routing & layouts"),
            ("Context API",            "Auth, Location, Assistant state"),
        ], ACCENT_CYAN),
        ("BACKEND", [
            ("Node.js + Express",      "REST API with ES Modules"),
            ("MongoDB + Mongoose",     "NoSQL database & ODM"),
            ("Multer",                 "Multipart image upload middleware"),
            ("JWT Authentication",     "Secure role-based access control"),
        ], ACCENT_PURP),
        ("AI & INTELLIGENCE", [
            ("Python scikit-learn",    "TF-IDF + Logistic Regression chatbot"),
            ("Google Gemini 1.5 Flash","Grounded NL response generation"),
            ("Cloudinary",             "Cloud image storage & CDN"),
            ("child_process.spawn",    "Node-Python ML bridge"),
        ], ACCENT_GOLD),
    ]

    for i, (layer_title, items, col) in enumerate(layers):
        x = Inches(0.3) + i * Inches(4.35)
        add_rect(slide, x, Inches(2.1), Inches(4.15), Inches(4.9), BG_CARD)
        add_rect(slide, x, Inches(2.1), Inches(4.15), Inches(0.45), col)
        add_label(slide, layer_title, x, Inches(2.12), Inches(4.15), Inches(0.42),
                  font_size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        for j, (tech, desc) in enumerate(items):
            y = Inches(2.65) + j * Inches(1.0)
            add_label(slide, tech, x + Inches(0.2), y, Inches(3.7), Inches(0.4),
                      font_size=13, bold=True, color=col)
            add_label(slide, desc, x + Inches(0.2), y + Inches(0.38), Inches(3.7), Inches(0.4),
                      font_size=10, color=GRAY)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), ACCENT_PURP)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 5 — KEY FEATURES
# ══════════════════════════════════════════════════════════════════════════════
def slide_features(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill_bg(slide)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), ACCENT_CYAN)
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, ACCENT_CYAN)

    add_label(slide, "KEY FEATURES", Inches(0.5), Inches(0.2), Inches(10), Inches(0.6),
              font_size=11, bold=True, color=ACCENT_CYAN)
    add_label(slide, "What Makes PMNA Perks Unique",
              Inches(0.5), Inches(0.7), Inches(12.5), Inches(0.9),
              font_size=36, bold=True, color=WHITE)
    add_accent_line(slide, Inches(1.65), ACCENT_CYAN, 0.35)

    features = [
        ("AI-Powered Chatbot",       "Python scikit-learn intent classifier (12 intents, 231 training samples). Manglish support. Integrated with Gemini for live DB context."),
        ("Multer Image Upload",      "Drag-and-drop offer photo & store logo upload. Supports PNG, JPG, WEBP up to 5MB. Cloudinary CDN + local fallback."),
        ("3D Payment Gateway",       "Realistic credit card flip animation using CSS 3D transforms. UPI QR + Card/Netbanking for Showcase Ad payments."),
        ("Showcase Advertising",     "Premium banner spots on PMNA home feed. Merchants pay via UPI or card, banner activates instantly."),
        ("Admin Verification",       "Multi-role system: Customer, Merchant, Admin. Admins approve merchants, manage offers, generate reports."),
        ("Hyperlocal Discovery",     "Filter offers by location (Perinthalmanna / Angadipuram), category, price range, discount %, and ending-soon deals."),
    ]

    for i, (title, desc) in enumerate(features):
        col_idx = i % 2
        row_idx = i // 2
        x = Inches(0.5) + col_idx * Inches(6.45)
        y = Inches(2.1) + row_idx * Inches(1.65)
        add_rect(slide, x, y, Inches(6.2), Inches(1.5), BG_CARD)
        add_rect(slide, x, y, Inches(0.06), Inches(1.5), ACCENT_CYAN)
        add_label(slide, title, x + Inches(0.2), y + Inches(0.1), Inches(5.8), Inches(0.45),
                  font_size=14, bold=True, color=ACCENT_CYAN)
        add_label(slide, desc, x + Inches(0.2), y + Inches(0.55), Inches(5.8), Inches(0.85),
                  font_size=11, color=GRAY)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), ACCENT_CYAN)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 6 — CHATBOT DEEP DIVE
# ══════════════════════════════════════════════════════════════════════════════
def slide_chatbot(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill_bg(slide)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), ACCENT_GOLD)
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, ACCENT_GOLD)

    add_label(slide, "AI CHATBOT", Inches(0.5), Inches(0.2), Inches(10), Inches(0.6),
              font_size=11, bold=True, color=ACCENT_GOLD)
    add_label(slide, "Python ML + Gemini Hybrid Intelligence",
              Inches(0.5), Inches(0.7), Inches(12.5), Inches(0.9),
              font_size=32, bold=True, color=WHITE)
    add_accent_line(slide, Inches(1.65), ACCENT_GOLD, 0.45)

    # Pipeline flow
    steps = [
        ("User Query", "Natural language input\nEnglish + Manglish", ACCENT_CYAN),
        ("Python ML\nClassifier", "TF-IDF + Logistic Regression\n12 intents, 231 samples", ACCENT_PURP),
        ("Gemini +\nMongoDB", "Live DB context\nGrounded NL response", ACCENT_GOLD),
        ("Final\nResponse", "Rich cards + text\nto the user", GREEN),
    ]

    arrow_y = Inches(2.4)
    x_start = Inches(0.5)
    box_w = Inches(2.6)
    gap = Inches(0.7)

    for i, (title, desc, col) in enumerate(steps):
        x = x_start + i * (box_w + gap)
        add_rect(slide, x, arrow_y, box_w, Inches(1.8), col)
        add_label(slide, title, x, arrow_y + Inches(0.1), box_w, Inches(0.7),
                  font_size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        add_label(slide, desc, x, arrow_y + Inches(0.75), box_w, Inches(0.9),
                  font_size=10, color=WHITE, align=PP_ALIGN.CENTER)
        if i < len(steps) - 1:
            ax = x + box_w + Inches(0.1)
            add_label(slide, "-->", ax, arrow_y + Inches(0.7), gap - Inches(0.1), Inches(0.5),
                      font_size=22, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    # Stats box
    add_rect(slide, Inches(0.5), Inches(4.5), Inches(12.3), Inches(2.5), BG_CARD)

    stats = [
        ("12", "Intents Trained", ACCENT_CYAN),
        ("231", "Training Samples", ACCENT_PURP),
        ("100%", "Training Accuracy", GREEN),
        ("80.5%", "Validation Accuracy", ACCENT_GOLD),
        ("9/9", "Self-Tests Passed", GREEN),
    ]
    for i, (num, label, col) in enumerate(stats):
        sx = Inches(0.9) + i * Inches(2.4)
        add_label(slide, num, sx, Inches(4.7), Inches(2.2), Inches(0.8),
                  font_size=36, bold=True, color=col, align=PP_ALIGN.CENTER)
        add_label(slide, label, sx, Inches(5.45), Inches(2.2), Inches(0.5),
                  font_size=11, color=GRAY, align=PP_ALIGN.CENTER)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), ACCENT_GOLD)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 7 — MERCHANTS & SHOPS
# ══════════════════════════════════════════════════════════════════════════════
def slide_merchants(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill_bg(slide)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), GREEN)
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, GREEN)

    add_label(slide, "VERIFIED MERCHANTS", Inches(0.5), Inches(0.2), Inches(10), Inches(0.6),
              font_size=11, bold=True, color=GREEN)
    add_label(slide, "Live Shops & Offers on PMNA",
              Inches(0.5), Inches(0.7), Inches(12.5), Inches(0.9),
              font_size=36, bold=True, color=WHITE)
    add_accent_line(slide, Inches(1.65), GREEN, 0.3)

    merchants = [
        ("Kozhikode Star Biriyani", "Restaurants", "Perinthalmanna",
         "Malabar Dum Biriyani Rs.180 | Beef Fry Combo Rs.150 | Family Feast Rs.799"),
        ("Top In Town Bakery", "Bakery", "Perinthalmanna",
         "Truffle Pastry Box Rs.270 | Cake Privilege Pass Rs.680"),
        ("WalkZone Footwear", "Footwear", "Angadipuram",
         "Running Sneakers Rs.599 | Heel Sandals Rs.649 | Stock Clearance 55% OFF"),
        ("Modern Textiles & Sarees", "Fashion", "Perinthalmanna",
         "Kanchipuram Silk Rs.1999 | Cotton Wear Rs.399 | 60% OFF Clearance"),
        ("Mobile Hub & Gadgets", "Electronics", "Angadipuram",
         "20W Type-C Charger Rs.399 | 50% OFF Flash Deal"),
        ("Malabar Gold & Diamonds", "Jewellery", "Perinthalmanna",
         "Premium gold & diamond jewellery collections"),
        ("aswathy bakes", "Bakery", "Perinthalmanna",
         "Custom cakes & fresh baked goods"),
    ]

    for i, (name, cat, loc, offers) in enumerate(merchants):
        col_i = i % 2
        row_i = i // 2
        x = Inches(0.5) + col_i * Inches(6.45)
        y = Inches(2.1) + row_i * Inches(1.25)
        if i == 6:  # center last card
            x = Inches(3.4)

        add_rect(slide, x, y, Inches(6.2), Inches(1.1), BG_CARD)
        add_rect(slide, x, y, Inches(0.06), Inches(1.1), GREEN)
        tag_col = {"Restaurants": RED, "Bakery": ACCENT_GOLD, "Footwear": ACCENT_CYAN,
                   "Fashion": ACCENT_PURP, "Electronics": ACCENT_CYAN,
                   "Jewellery": ACCENT_GOLD}.get(cat, GRAY)
        add_rect(slide, x + Inches(0.15), y + Inches(0.1), Inches(1.2), Inches(0.28), tag_col)
        add_label(slide, cat, x + Inches(0.15), y + Inches(0.08), Inches(1.2), Inches(0.3),
                  font_size=8, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        add_label(slide, name, x + Inches(0.2), y + Inches(0.4), Inches(4), Inches(0.35),
                  font_size=13, bold=True, color=WHITE)
        add_label(slide, loc, x + Inches(4.3), y + Inches(0.4), Inches(1.8), Inches(0.35),
                  font_size=10, color=GREEN, align=PP_ALIGN.RIGHT)
        add_label(slide, offers, x + Inches(0.2), y + Inches(0.72), Inches(5.8), Inches(0.35),
                  font_size=9, color=GRAY)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), GREEN)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 8 — SYSTEM ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════
def slide_architecture(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill_bg(slide)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), ACCENT_PURP)
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, ACCENT_PURP)

    add_label(slide, "ARCHITECTURE", Inches(0.5), Inches(0.2), Inches(10), Inches(0.6),
              font_size=11, bold=True, color=ACCENT_PURP)
    add_label(slide, "System Design Overview",
              Inches(0.5), Inches(0.7), Inches(12.5), Inches(0.9),
              font_size=36, bold=True, color=WHITE)
    add_accent_line(slide, Inches(1.65), ACCENT_PURP, 0.28)

    # 3-column architecture diagram
    layers_data = [
        ("CLIENT LAYER", [
            "React 18 + Vite (port 5173)",
            "Tailwind CSS styling",
            "Context: Auth / Location / Assistant",
            "FloatingAssistant chat widget",
            "MockPaymentGateway (3D flip card)",
        ], ACCENT_CYAN, Inches(0.4)),
        ("SERVER LAYER", [
            "Express.js REST API (port 5000)",
            "JWT middleware + role guards",
            "Multer upload handler",
            "geminiService.js (AI pipeline)",
            "pythonChatService.js (ML bridge)",
        ], ACCENT_PURP, Inches(4.75)),
        ("DATA & AI LAYER", [
            "MongoDB Atlas (Mongoose ODM)",
            "Cloudinary / local /uploads",
            "Python scikit-learn model (.pkl)",
            "pmna_knowledge_base.json",
            "Google Gemini 1.5 Flash API",
        ], ACCENT_GOLD, Inches(9.1)),
    ]

    for title, items, col, x in layers_data:
        add_rect(slide, x, Inches(2.0), Inches(4.05), Inches(5.0), BG_CARD)
        add_rect(slide, x, Inches(2.0), Inches(4.05), Inches(0.45), col)
        add_label(slide, title, x, Inches(2.02), Inches(4.05), Inches(0.42),
                  font_size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        for j, item in enumerate(items):
            y = Inches(2.6) + j * Inches(0.78)
            add_rect(slide, x + Inches(0.2), y + Inches(0.15), Inches(0.1), Inches(0.1), col)
            add_label(slide, item, x + Inches(0.42), y, Inches(3.5), Inches(0.7),
                      font_size=11, color=GRAY)

    # Arrow between columns
    for ax in [Inches(4.48), Inches(8.83)]:
        add_label(slide, "<-->", ax, Inches(4.2), Inches(0.28), Inches(0.5),
                  font_size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), ACCENT_PURP)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 9 — IMPACT & FUTURE
# ══════════════════════════════════════════════════════════════════════════════
def slide_impact(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill_bg(slide)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), ACCENT_GOLD)
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, ACCENT_GOLD)

    add_label(slide, "IMPACT & ROADMAP", Inches(0.5), Inches(0.2), Inches(10), Inches(0.6),
              font_size=11, bold=True, color=ACCENT_GOLD)
    add_label(slide, "Current Impact & Future Vision",
              Inches(0.5), Inches(0.7), Inches(12.5), Inches(0.9),
              font_size=36, bold=True, color=WHITE)
    add_accent_line(slide, Inches(1.65), ACCENT_GOLD, 0.38)

    # Current metrics
    metrics = [
        ("7+", "Verified Merchants\nOnboarded"),
        ("12", "AI Intents\nTrained"),
        ("2", "Cities\nCovered"),
        ("5+", "Product\nCategories"),
    ]
    for i, (num, label) in enumerate(metrics):
        x = Inches(0.5) + i * Inches(3.1)
        add_rect(slide, x, Inches(2.0), Inches(2.8), Inches(1.6), BG_CARD)
        add_label(slide, num, x, Inches(2.1), Inches(2.8), Inches(0.8),
                  font_size=40, bold=True, color=ACCENT_GOLD, align=PP_ALIGN.CENTER)
        add_label(slide, label, x, Inches(2.85), Inches(2.8), Inches(0.65),
                  font_size=11, color=GRAY, align=PP_ALIGN.CENTER)

    # Roadmap
    add_label(slide, "FUTURE ROADMAP", Inches(0.5), Inches(3.85), Inches(5), Inches(0.4),
              font_size=12, bold=True, color=ACCENT_GOLD)
    roadmap = [
        ("v2.0", "Mobile App (React Native) — iOS & Android"),
        ("v2.1", "Customer loyalty points & reward redemption system"),
        ("v2.2", "Real-time push notifications for flash deals"),
        ("v2.3", "Merchant analytics dashboard with sales insights"),
        ("v3.0", "Expand to Malappuram district — 20+ cities"),
    ]
    for i, (ver, text) in enumerate(roadmap):
        y = Inches(4.35) + i * Inches(0.56)
        add_rect(slide, Inches(0.5), y, Inches(0.7), Inches(0.42), ACCENT_GOLD)
        add_label(slide, ver, Inches(0.5), y + Inches(0.02), Inches(0.7), Inches(0.4),
                  font_size=10, bold=True, color=BG_DARK, align=PP_ALIGN.CENTER)
        add_label(slide, text, Inches(1.35), y, Inches(11), Inches(0.42),
                  font_size=12, color=GRAY)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), ACCENT_GOLD)


# ══════════════════════════════════════════════════════════════════════════════
#  SLIDE 10 — THANK YOU
# ══════════════════════════════════════════════════════════════════════════════
def slide_thankyou(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill_bg(slide)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.08), ACCENT_CYAN)
    add_rect(slide, 0, 0, Inches(0.06), SLIDE_H, ACCENT_CYAN)
    add_rect(slide, Inches(13.27), 0, Inches(0.06), SLIDE_H, ACCENT_PURP)

    add_label(slide, "THANK YOU", Inches(0.5), Inches(1.5), Inches(12.3), Inches(1.8),
              font_size=72, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    add_label(slide, "PMNA Perks — Empowering Local Commerce",
              Inches(0.5), Inches(3.2), Inches(12.3), Inches(0.7),
              font_size=22, color=ACCENT_CYAN, align=PP_ALIGN.CENTER)

    add_accent_line(slide, Inches(4.0), ACCENT_GOLD, 1.0)

    add_label(slide, "Built with   React  +  Node.js  +  MongoDB  +  Python ML  +  Gemini AI",
              Inches(0.5), Inches(4.3), Inches(12.3), Inches(0.55),
              font_size=14, color=GRAY, align=PP_ALIGN.CENTER)

    add_label(slide, "github.com/Vivek-k001/ASVI-Softworks-Hojathon-S1",
              Inches(0.5), Inches(5.0), Inches(12.3), Inches(0.5),
              font_size=14, color=ACCENT_CYAN, align=PP_ALIGN.CENTER)

    add_label(slide, "ASVI Softworks  |  Hojathon Season 1  |  2026",
              Inches(0.5), Inches(5.7), Inches(12.3), Inches(0.5),
              font_size=13, color=GRAY, italic=True, align=PP_ALIGN.CENTER)

    add_rect(slide, 0, Inches(7.42), SLIDE_W, Inches(0.08), ACCENT_CYAN)


# ══════════════════════════════════════════════════════════════════════════════
#  BUILD & SAVE
# ══════════════════════════════════════════════════════════════════════════════
def main():
    print("[BUILD] Creating PMNA Perks Presentation...")
    prs = make_prs()

    slide_title(prs)       ; print("  [1/10] Title slide")
    slide_problem(prs)     ; print("  [2/10] Problem statement")
    slide_solution(prs)    ; print("  [3/10] Solution overview")
    slide_tech(prs)        ; print("  [4/10] Tech stack")
    slide_features(prs)    ; print("  [5/10] Key features")
    slide_chatbot(prs)     ; print("  [6/10] Chatbot deep dive")
    slide_merchants(prs)   ; print("  [7/10] Merchants & shops")
    slide_architecture(prs); print("  [8/10] System architecture")
    slide_impact(prs)      ; print("  [9/10] Impact & roadmap")
    slide_thankyou(prs)    ; print("  [10/10] Thank you")

    prs.save(OUTPUT_PATH)
    print(f"\n[DONE] Saved -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
