from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def setup_driver():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.maximize_window()
    return driver


def test_open_homepage():

    driver = setup_driver()

    driver.get("http://localhost:5173")

    time.sleep(3)

    assert "signifyEd" in driver.page_source

    driver.quit()


def test_launch_demo():

    driver = setup_driver()

    driver.get("http://localhost:5173")

    time.sleep(2)

    button = driver.find_element(By.XPATH, "//button[contains(text(),'Launch Demo')]")

    button.click()

    time.sleep(3)

    assert "Demo" in driver.page_source

    driver.quit()


# def test_translation_pipeline():

#     driver = setup_driver()

#     driver.get("http://localhost:5173")

#     time.sleep(2)

#     driver.find_element(By.XPATH, "//button[contains(text(),'Launch Demo')]").click()

#     time.sleep(3)

#     # text_box = driver.find_element(By.TAG_NAME, "textarea")

#     text_box = WebDriverWait(driver, 10).until(
#     EC.presence_of_element_located((By.TAG_NAME, "input"))
# )

#     text_box.send_keys("hello")

#     translate_button = driver.find_element(By.XPATH, "//button[contains(text(),'Translate')]")

#     translate_button.click()

#     time.sleep(5)

#     assert "HELLO" in driver.page_source

#     driver.quit()


def test_translation_pipeline():

    driver = setup_driver()

    driver.get("http://localhost:5173")

    # click Launch Demo
    launch = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Launch Demo')]"))
    )
    launch.click()

    # wait for input
    text_box = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "input"))
    )

    text_box.send_keys("hello")

    # click send button
    send_button = driver.find_element(By.CSS_SELECTOR, "button.bg-green-600")
    send_button.click()

    import time
    time.sleep(5)

    driver.quit()