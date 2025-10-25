import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the login page (assuming it's at /login)
    page.goto("http://localhost:5000/login")

    # Fill in dummy credentials and login
    # The actual authentication doesn't matter, we just need to get to the profile page
    # In a real scenario with backend interaction, we would need a test user
    page.get_by_label("Correo electrónico").fill("test@example.com")
    page.get_by_label("Contraseña").fill("password123")
    page.get_by_role("button", name="Iniciar sesión").click()

    # Wait for navigation to the home page (or a dashboard)
    # This might need adjustment depending on the app's behavior after login
    expect(page).to_have_url(re.compile(".*"), timeout=10000)

    # Navigate to the profile page
    # First, click the user avatar/menu to open the dropdown
    # Using a selector that is likely to be stable
    page.locator('button[id^="radix-"]').filter(has_text=re.compile(r"Open user menu")).click()

    # Then click the "Mi Perfil" link in the dropdown
    page.get_by_role("menuitem", name="Mi Perfil").click()

    # Wait for the profile page to load
    expect(page).to_have_url("http://localhost:5000/profile")
    expect(page.get_by_role("heading", name="Mi Perfil")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/profile_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)