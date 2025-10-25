from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the homepage
    page.goto("http://localhost:5000/")

    # Wait for the main heading to be visible
    expect(page.get_by_role("heading", name="Elige tu Lenguaje de Programación")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/homepage.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)