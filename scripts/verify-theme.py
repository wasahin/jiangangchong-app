from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})

    pages = [
        ('http://localhost:3000/', 'home'),
        ('http://localhost:3000/staff', 'staff'),
        ('http://localhost:3000/yellowwhite', 'yellowwhite'),
    ]

    for url, name in pages:
        print(f"\n=== Checking {name} ({url}) ===")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        # Take screenshot
        screenshot_path = f'c:/Users/coolj/.trae-cn/trae projects/jingangchong-app/scripts/screenshot-{name}.png'
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved: {screenshot_path}")

        # Check background color
        bg = page.evaluate('''() => {
            const html = document.documentElement;
            const body = document.body;
            return {
                htmlBg: window.getComputedStyle(html).backgroundColor,
                bodyBg: window.getComputedStyle(body).backgroundColor,
                bodyClass: body.className
            };
        }''')
        print(f"Background: html={bg['htmlBg']}, body={bg['bodyBg']}, class={bg['bodyClass']}")

        # Check for neumorphic card elements
        cards = page.locator('.rounded-neumo-card, [class*="shadow-neumo"]').all()
        print(f"Neumorphic cards found: {len(cards)}")

        # Check accent colors
        amber_elements = page.locator('[class*="accent-amber"], [class*="text-accent-amber"], [class*="bg-accent-amber"]').all()
        cyan_elements = page.locator('[class*="accent-cyan"], [class*="text-accent-cyan"], [class*="bg-accent-cyan"]').all()
        print(f"Amber accent elements: {len(amber_elements)}")
        print(f"Cyan accent elements: {len(cyan_elements)}")

        # Check buttons
        buttons = page.locator('button').all()
        print(f"Buttons found: {len(buttons)}")

    browser.close()
    print("\n=== Verification complete ===")
