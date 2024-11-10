import os
import time
import urllib
import urllib.parse

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService

from django.conf import settings


def create_html_content(headline, body_text, image_path):
    """HTML template for image generation."""

    html_content = f"""
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                margin: 0;
                padding: 0;
                background-image: url('{image_path}');
                background-size: cover;
                font-family: 'Helvetica Neue', sans-serif;
                color: white;
                width: 1000px;
                height: 1000px;
                overflow: auto;
                position: relative;
            }}
            .overlay {{
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }}
            .container {{
                position: relative;
                width: 1000px;
                height: 1000px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: left;
                text-align: left;
                overflow: auto;
            }}
            .headline {{
                font-size: 4.5vw;
                font-weight: bold;
                margin-bottom: 20px;
                padding-left: 50px;
                padding-right: 50px;
            }}
            .body-text {{
                font-size: 2.7vw;
                max-width: 90%;
                text-align: left;
                line-height: 1.4;
                padding-left: 50px;
                padding-right: 50px;
                padding-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="overlay"></div>
        <div class="container">
            <div class="headline">{headline}</div>
            <div class="body-text">{body_text}</div>
        </div>
    </body>
    </html>
    """
    return html_content


def generate_images(albums: list):
    """
    Generate images for social media from Album instances.

    Uses selenium with headless chrome for smooth font render. CPU-hungry.
    Specify CHROME_LOCATION in env in production.
    """
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1000,1000")
    if settings.CHROME_LOCATION:
        service = ChromeService(executable_path=settings.CHROME_LOCATION)
        driver = webdriver.Chrome(service=service, options=chrome_options)
    else:
        driver = webdriver.Chrome(
            options=chrome_options,
        )
    for album in albums:
        image_url = f'{settings.BASE_URL}{album.image_url}'
        html_content = create_html_content(
            headline=f'{album.band_name} — {album.album_name}',
            body_text=album.text,
            image_path=image_url
        )
        data_url = "data:text/html," + urllib.parse.quote(html_content)
        driver.get(data_url)
        time.sleep(1)
        output_image_path = os.path.join(
            settings.MEDIA_ROOT,
            f'output{album.id}.png'
        )
        driver.save_screenshot(output_image_path)
    driver.quit()
