from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

def run_debug():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.set_window_size(1440, 900)
    
    try:
        url = "http://127.0.0.1:8000"
        print("Navigating to:", url)
        driver.get(url)
        time.sleep(3)
        
        # Print initial console logs
        print("\n--- Initial Browser Console Logs ---")
        for entry in driver.get_log('browser'):
            print(entry)
            
        print("\nForcing Signup Modal to display using classList.add('active')...")
        driver.execute_script("document.getElementById('signup-modal').classList.add('active');")
        time.sleep(2)
        
        is_modal_displayed = driver.find_element(By.ID, "signup-modal").is_displayed()
        print(f"Is Signup Modal displayed? {is_modal_displayed}")
        
        # Fill signup form
        print("Filling form...")
        name_input = driver.find_element(By.ID, "signup-name")
        email_input = driver.find_element(By.ID, "signup-email")
        pass_input = driver.find_element(By.ID, "signup-password")
        conf_input = driver.find_element(By.ID, "signup-confirm")
        
        print(f"Name input displayed: {name_input.is_displayed()}")
        
        name_input.send_keys("Selenium Test")
        
        import random
        email = f"selenium_{random.randint(1000, 9999)}@example.com"
        print(f"Using email: {email}")
        email_input.send_keys(email)
        pass_input.send_keys("password123")
        conf_input.send_keys("password123")
        
        print("Submitting form...")
        signup_form = driver.find_element(By.ID, "signup-form")
        driver.execute_script("arguments[0].dispatchEvent(new Event('submit', {cancelable: true}));", signup_form)
        time.sleep(4)
        
        print("\n--- Browser Console Logs after Submit ---")
        for entry in driver.get_log('browser'):
            print(entry)
            
        # Check current URL and session
        print("\nCurrent URL:", driver.current_url)
        
        page_src = driver.page_source
        if "user-menu" in page_src:
            print("Signup Success! User menu found in page source.")
        else:
            print("Signup Modal still open or user menu NOT found in page source.")
            err_text = driver.find_element(By.ID, "signup-error").text
            print("Signup error displayed on page:", err_text)

    except Exception as e:
        print("Error during test run:", e)
    finally:
        driver.quit()

if __name__ == "__main__":
    run_debug()
