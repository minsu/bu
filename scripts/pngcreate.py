#!/usr/bin/env python

# pngcreate.py (python3 version)
#
# Exports Font Awesome icons as PNG images.
#
# Copyright (c) 2012-2013 Michal Wojciechowski (http://odyniec.net/)
# Font Awesome - http://fortawesome.github.com/Font-Awesome

import sys, argparse, os, re
from os import path, access, R_OK
from PIL import Image, ImageFont, ImageDraw

# Mapping of icon names to character codes
icons = {
    "adjust": "\uf042",
    "adn": "\uf170",
    "align-center": "\uf037",
    "align-justify": "\uf039",
    "align-left": "\uf036",
    "align-right": "\uf038",
    "ambulance": "\uf0f9",
    "anchor": "\uf13d",
    "android": "\uf17b",
    "angle-double-down": "\uf103",
    "angle-double-left": "\uf100",
    "angle-double-right": "\uf101",
    "angle-double-up": "\uf102",
    "angle-down": "\uf107",
    "angle-left": "\uf104",
    "angle-right": "\uf105",
    "angle-up": "\uf106",
    "apple": "\uf179",
    "archive": "\uf187",
    "arrow-circle-down": "\uf0ab",
    "arrow-circle-left": "\uf0a8",
    "arrow-circle-o-down": "\uf01a",
    "arrow-circle-o-left": "\uf190",
    "arrow-circle-o-right": "\uf18e",
    "arrow-circle-o-up": "\uf01b",
    "arrow-circle-right": "\uf0a9",
    "arrow-circle-up": "\uf0aa",
    "arrow-down": "\uf063",
    "arrow-left": "\uf060",
    "arrow-right": "\uf061",
    "arrow-up": "\uf062",
    "arrows": "\uf047",
    "arrows-alt": "\uf0b2",
    "arrows-h": "\uf07e",
    "arrows-v": "\uf07d",
    "asterisk": "\uf069",
    "backward": "\uf04a",
    "ban": "\uf05e",
    "bar-chart-o": "\uf080",
    "barcode": "\uf02a",
    "bars": "\uf0c9",
    "beer": "\uf0fc",
    "bell": "\uf0f3",
    "bell-o": "\uf0a2",
    "bitbucket": "\uf171",
    "bitbucket-square": "\uf172",
    "bold": "\uf032",
    "book": "\uf02d",
    "bookmark": "\uf02e",
    "bookmark-o": "\uf097",
    "briefcase": "\uf0b1",
    "bug": "\uf188",
    "building-o": "\uf0f7",
    "bullhorn": "\uf0a1",
    "bullseye": "\uf140",
    "calendar": "\uf073",
    "calendar-o": "\uf133",
    "camera": "\uf030",
    "camera-retro": "\uf083",
    "caret-down": "\uf0d7",
    "caret-left": "\uf0d9",
    "caret-right": "\uf0da",
    "caret-up": "\uf0d8",
    "certificate": "\uf0a3",
    "check": "\uf00c",
    "check-circle": "\uf058",
    "check-circle-o": "\uf05d",
    "check-square": "\uf14a",
    "check-square-o": "\uf046",
    "chevron-circle-down": "\uf13a",
    "chevron-circle-left": "\uf137",
    "chevron-circle-right": "\uf138",
    "chevron-circle-up": "\uf139",
    "chevron-down": "\uf078",
    "chevron-left": "\uf053",
    "chevron-right": "\uf054",
    "chevron-up": "\uf077",
    "circle": "\uf111",
    "circle-o": "\uf10c",
    "clock-o": "\uf017",
    "cloud": "\uf0c2",
    "cloud-download": "\uf0ed",
    "cloud-upload": "\uf0ee",
    "code": "\uf121",
    "code-fork": "\uf126",
    "coffee": "\uf0f4",
    "columns": "\uf0db",
    "comment": "\uf075",
    "comment-o": "\uf0e5",
    "comments": "\uf086",
    "comments-o": "\uf0e6",
    "compass": "\uf14e",
    "compress": "\uf066",
    "credit-card": "\uf09d",
    "crop": "\uf125",
    "crosshairs": "\uf05b",
    "css3": "\uf13c",
    "cutlery": "\uf0f5",
    "desktop": "\uf108",
    "dot-circle-o": "\uf192",
    "download": "\uf019",
    "dribbble": "\uf17d",
    "dropbox": "\uf16b",
    "eject": "\uf052",
    "ellipsis-h": "\uf141",
    "ellipsis-v": "\uf142",
    "envelope": "\uf0e0",
    "envelope-o": "\uf003",
    "eraser": "\uf12d",
    "exchange": "\uf0ec",
    "exclamation": "\uf12a",
    "exclamation-circle": "\uf06a",
    "expand": "\uf065",
    "external-link": "\uf08e",
    "external-link-square": "\uf14c",
    "eye": "\uf06e",
    "eye-slash": "\uf070",
    "facebook": "\uf09a",
    "facebook-square": "\uf082",
    "fast-backward": "\uf049",
    "fast-forward": "\uf050",
    "female": "\uf182",
    "fighter-jet": "\uf0fb",
    "file": "\uf15b",
    "file-o": "\uf016",
    "file-text": "\uf15c",
    "file-text-o": "\uf0f6",
    "film": "\uf008",
    "filter": "\uf0b0",
    "fire": "\uf06d",
    "fire-extinguisher": "\uf134",
    "flag": "\uf024",
    "flag-checkered": "\uf11e",
    "flag-o": "\uf11d",
    "flask": "\uf0c3",
    "flickr": "\uf16e",
    "folder": "\uf07b",
    "folder-o": "\uf114",
    "folder-open": "\uf07c",
    "folder-open-o": "\uf115",
    "font": "\uf031",
    "forward": "\uf04e",
    "foursquare": "\uf180",
    "frown-o": "\uf119",
    "gamepad": "\uf11b",
    "gbp": "\uf154",
    "gift": "\uf06b",
    "github": "\uf09b",
    "github-alt": "\uf113",
    "github-square": "\uf092",
    "gittip": "\uf184",
    "glass": "\uf000",
    "globe": "\uf0ac",
    "google-plus": "\uf0d5",
    "google-plus-square": "\uf0d4",
    "h-square": "\uf0fd",
    "hand-o-down": "\uf0a7",
    "hand-o-left": "\uf0a5",
    "hand-o-right": "\uf0a4",
    "hand-o-up": "\uf0a6",
    "hdd-o": "\uf0a0",
    "headphones": "\uf025",
    "heart": "\uf004",
    "heart-o": "\uf08a",
    "home": "\uf015",
    "hospital-o": "\uf0f8",
    "html5": "\uf13b",
    "inbox": "\uf01c",
    "indent": "\uf03c",
    "info": "\uf129",
    "info-circle": "\uf05a",
    "instagram": "\uf16d",
    "italic": "\uf033",
    "key": "\uf084",
    "keyboard-o": "\uf11c",
    "laptop": "\uf109",
    "leaf": "\uf06c",
    "lemon-o": "\uf094",
    "level-down": "\uf149",
    "level-up": "\uf148",
    "lightbulb-o": "\uf0eb",
    "linkedin": "\uf0e1",
    "linkedin-square": "\uf08c",
    "linux": "\uf17c",
    "list": "\uf03a",
    "list-alt": "\uf022",
    "list-ol": "\uf0cb",
    "list-ul": "\uf0ca",
    "location-arrow": "\uf124",
    "lock": "\uf023",
    "long-arrow-down": "\uf175",
    "long-arrow-left": "\uf177",
    "long-arrow-right": "\uf178",
    "long-arrow-up": "\uf176",
    "magic": "\uf0d0",
    "magnet": "\uf076",
    "mail-reply-all": "\uf122",
    "male": "\uf183",
    "map-marker": "\uf041",
    "maxcdn": "\uf136",
    "medkit": "\uf0fa",
    "meh-o": "\uf11a",
    "microphone": "\uf130",
    "microphone-slash": "\uf131",
    "minus": "\uf068",
    "minus-circle": "\uf056",
    "minus-square": "\uf146",
    "minus-square-o": "\uf147",
    "money": "\uf0d6",
    "moon-o": "\uf186",
    "music": "\uf001",
    "pagelines": "\uf18c",
    "paperclip": "\uf0c6",
    "pause": "\uf04c",
    "pencil": "\uf040",
    "pencil-square": "\uf14b",
    "phone": "\uf095",
    "phone-square": "\uf098",
    "picture-o": "\uf03e",
    "pinterest": "\uf0d2",
    "pinterest-square": "\uf0d3",
    "plane": "\uf072",
    "play": "\uf04b",
    "play-circle": "\uf144",
    "play-circle-o": "\uf01d",
    "plus": "\uf067",
    "plus-circle": "\uf055",
    "plus-square": "\uf0fe",
    "plus-square-o": "\uf196",
    "power-off": "\uf011",
    "print": "\uf02f",
    "puzzle-piece": "\uf12e",
    "qrcode": "\uf029",
    "question": "\uf128",
    "question-circle": "\uf059",
    "quote-left": "\uf10d",
    "quote-right": "\uf10e",
    "random": "\uf074",
    "refresh": "\uf021",
    "renren": "\uf18b",
    "reply-all": "\uf122",
    "retweet": "\uf079",
    "road": "\uf018",
    "rocket": "\uf135",
    "rss": "\uf09e",
    "rss-square": "\uf143",
    "search": "\uf002",
    "search-minus": "\uf010",
    "search-plus": "\uf00e",
    "share-square": "\uf14d",
    "share-square-o": "\uf045",
    "shield": "\uf132",
    "shopping-cart": "\uf07a",
    "sign-in": "\uf090",
    "sign-out": "\uf08b",
    "signal": "\uf012",
    "sitemap": "\uf0e8",
    "skype": "\uf17e",
    "smile-o": "\uf118",
    "sort-alpha-asc": "\uf15d",
    "sort-alpha-desc": "\uf15e",
    "sort-amount-asc": "\uf160",
    "sort-amount-desc": "\uf161",
    "sort-numeric-asc": "\uf162",
    "sort-numeric-desc": "\uf163",
    "spinner": "\uf110",
    "square": "\uf0c8",
    "square-o": "\uf096",
    "stack-exchange": "\uf18d",
    "stack-overflow": "\uf16c",
    "star": "\uf005",
    "star-half": "\uf089",
    "star-o": "\uf006",
    "step-backward": "\uf048",
    "step-forward": "\uf051",
    "stethoscope": "\uf0f1",
    "stop": "\uf04d",
    "strikethrough": "\uf0cc",
    "subscript": "\uf12c",
    "suitcase": "\uf0f2",
    "sun-o": "\uf185",
    "superscript": "\uf12b",
    "table": "\uf0ce",
    "tablet": "\uf10a",
    "tag": "\uf02b",
    "tags": "\uf02c",
    "tasks": "\uf0ae",
    "terminal": "\uf120",
    "text-height": "\uf034",
    "text-width": "\uf035",
    "th": "\uf00a",
    "th-large": "\uf009",
    "th-list": "\uf00b",
    "thumb-tack": "\uf08d",
    "thumbs-down": "\uf165",
    "thumbs-o-down": "\uf088",
    "thumbs-o-up": "\uf087",
    "thumbs-up": "\uf164",
    "ticket": "\uf145",
    "times": "\uf00d",
    "times-circle": "\uf057",
    "times-circle-o": "\uf05c",
    "tint": "\uf043",
    "trash-o": "\uf014",
    "trello": "\uf181",
    "trophy": "\uf091",
    "truck": "\uf0d1",
    "tumblr": "\uf173",
    "tumblr-square": "\uf174",
    "twitter": "\uf099",
    "twitter-square": "\uf081",
    "umbrella": "\uf0e9",
    "underline": "\uf0cd",
    "unlock": "\uf09c",
    "unlock-alt": "\uf13e",
    "upload": "\uf093",
    "user": "\uf007",
    "user-md": "\uf0f0",
    "video-camera": "\uf03d",
    "vimeo-square": "\uf194",
    "vk": "\uf189",
    "volume-down": "\uf027",
    "volume-off": "\uf026",
    "volume-up": "\uf028",
    "weibo": "\uf18a",
    "wheelchair": "\uf193",
    "windows": "\uf17a",
    "wrench": "\uf0ad",
    "xing": "\uf168",
    "xing-square": "\uf169",
    "youtube": "\uf167",
    "youtube-play": "\uf16a",
    "youtube-square": "\uf166",
}


class ListAction(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        for icon in sorted(icons.keys()):
            print(icon)
        exit(0)


class ListUpdateAction(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        print("icons = {")
        for icon in sorted(icons.keys()):
            print('    "%s": "\\u%x",' % (icon, ord(icons[icon][0])))
        print("}")
        exit(0)


def export_icon(icon, size, filename, font, color):
    image = Image.new("RGBA", (size, size), color=(0,0,0,0))

    draw = ImageDraw.Draw(image)

    # Initialize font
    font = ImageFont.truetype(font, size)

    # Determine the dimensions of the icon
    width,height = draw.textsize(icons[icon], font=font)

    draw.text(((size - width) / 2, (size - height) / 2), icons[icon],
            font=font, fill=color)

    # Get bounding box
    bbox = image.getbbox()

    if bbox:
        image = image.crop(bbox)

    borderw = int((size - (bbox[2] - bbox[0])) / 2)
    borderh = int((size - (bbox[3] - bbox[1])) / 2)

    # Create background image
    bg = Image.new("RGBA", (size, size), (0,0,0,0))

    bg.paste(image, (borderw,borderh))

    # Save file
    bg.save(filename)


class LoadCSSAction(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        global icons
        icons = LoadCSSAction._load_css(values)

    @staticmethod
    def _load_css(filename):
        import tinycss
        new_icons = {}
        parser = tinycss.make_parser("page3")
        stylesheet = parser.parse_stylesheet_file(filename)
        is_icon = re.compile(u("^\.fa-(.*):before$"))
        for rule in stylesheet.rules:
            selector = rule.selector.as_css()
            match = is_icon.match(selector)
            if match:
                name = match.groups()[0]
                for declaration in rule.declarations:
                    if declaration.name == "content":
                        new_icons[name] = declaration.value.as_css()
        return new_icons


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
            description="Exports Font Awesome icons as PNG images.")

    parser.add_argument("icon", type=str, nargs="+",
            help="The name(s) of the icon(s) to export (or \"ALL\" for all icons)")
    parser.add_argument("--color", type=str, default="black",
            help="Color (HTML color code or name, default: black)")
    parser.add_argument("--font", type=str,
        default="{0}/fonts/fontawesome-webfont.ttf".format(
            os.path.dirname(os.path.abspath(__file__))),
        help="Font file to use (default: fonts/fontawesome-webfont.ttf)")
    parser.add_argument("--css", type=str, default="", action=LoadCSSAction,
            help="Path to the CSS file defining icon names (instead of the " +
            "predefined list)")
    parser.add_argument("--list", nargs=0, action=ListAction,
            help="List available icon names and exit")
    parser.add_argument("--list-update", nargs=0, action=ListUpdateAction,
            help=argparse.SUPPRESS)
    parser.add_argument("--size", type=int, default=16,
            help="Icon size in pixels (default: 16)")

    args = parser.parse_args()
    icon = args.icon
    size = args.size
    font = args.font
    color = args.color

    if args.font:
        if not path.isfile(args.font) or not access(args.font, R_OK):
            print("Error: Font file (%s) can't be opened" % args.font, file=sys.stderr)
            exit(1)

    if args.icon == [ "ALL" ]:
        # Export all icons
        selected_icons = sorted(icons.keys())
    else:
        selected_icons = []

        # Icon name was given
        for icon in args.icon:
            # Strip the "icon-" prefix, if present
            if icon.startswith("icon-"):
                icon = icon[5:]

            if icon in icons:
                selected_icons.append(icon)
            else:
                print("Error: Unknown icon name (%s)" % icon, file=sys.stderr);
                sys.exit(1)

    for icon in selected_icons:
        filename = icon + '-' + str(size) + '-' + color + ".png"
        print("Exporting icon \"%s\" as %s (%ix%i pixels)" %
                (icon, filename, size, size))

        export_icon(icon, size, filename, font, color)

